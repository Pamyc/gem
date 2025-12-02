
import { useMemo } from 'react';
import { SEPARATOR, ROOT_ID, ChartType, TooltipData } from './types';

interface UseChartOptionsProps {
  isDarkMode: boolean;
  chartType: ChartType;
  sunburstRootId: string;
  chartData: any[];
  fullSunburstData: any[];
}

// --- SINGLE SOURCE OF TRUTH FOR TOOLTIP HTML ---
export const getTooltipHtml = (title: string, data: TooltipData, isDarkMode: boolean) => {
  const textColor = '#ffffff'; 
  const labelColor = '#94a3b8'; // Slate-400
  const valColor = '#ffffff';
  const percentColor = '#a78bfa'; // Light Violet
  
  // Format helpers
  const fmt = (n?: number) => (n !== undefined ? n.toLocaleString('ru-RU') : '0');
  const fmtMoney = (n?: number) => (n !== undefined ? n.toLocaleString('ru-RU') + ' ₽' : '0 ₽');
  
  // Row with optional Arrow
  const row = (label: string, val: string, pct?: string, arrowHtml: string = '') => `
    <div style="display: flex; justify-content: space-between; align-items: baseline; gap: 20px; margin-bottom: 4px;">
      <span style="color: ${labelColor}; font-size: 13px; font-weight: 500;">${label}:</span>
      <div style="text-align: right; white-space: nowrap;">
        <span style="color: ${valColor}; font-size: 14px; font-weight: 700; margin-right: ${pct ? '8px' : '0'};">${val}</span>
        ${arrowHtml}
        ${pct ? `<span style="color: ${percentColor}; font-size: 12px; font-weight: 600;">(${pct}%)</span>` : ''}
      </div>
    </div>
  `;

  // Helper to render a pair of Income/Expense with comparison arrows
  // Logic: Mark the higher value. Green Up for Income, Red Down (Warning) for Expense.
  const renderPair = (l1: string, v1: number | undefined, l2: string, v2: number | undefined) => {
      const val1 = v1 || 0;
      const val2 = v2 || 0;
      
      // If Income > Expense: Green Arrow Up on Income
      const arrow1 = val1 > val2 ? '<span style="color: #4ade80; margin-left: 6px; font-size: 12px;">▲</span>' : '';
      
      // If Expense > Income: Red Arrow Down on Expense (User request: "red arrow down")
      // Visualizing "Expense is heavier/dragging down" or simply distinction.
      const arrow2 = val2 > val1 ? '<span style="color: #f87171; margin-left: 6px; font-size: 12px;">▼</span>' : '';

      return `
        ${row(l1, fmtMoney(v1), undefined, arrow1)}
        ${row(l2, fmtMoney(v2), undefined, arrow2)}
      `;
  };

  const divider = `<div style="height: 1px; background-color: rgba(255,255,255,0.1); margin: 8px 0;"></div>`;

  const titleHtml = `<div style="font-size: 16px; font-weight: 800; color: ${textColor}; margin-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 8px;">${title}</div>`;

  return `
    <div style="font-family: sans-serif; min-width: 320px; padding: 4px;">
      ${titleHtml}
      
      ${row('Лифтов', fmt(data.value), data.percent)}
      ${row('Этажей', fmt(data.floors), data.percentFloors)}
      ${row('Рентабельность', (data.rentability?.toFixed(1) || '0') + '%')}
      ${row('Валовая', fmtMoney(data.profit), data.percentProfit)}
      
      ${divider}
      
      ${renderPair('Доходы (Факт)', data.incomeFact, 'Расходы (Факт)', data.expenseFact)}
      
      ${divider}
      
      ${renderPair('Доходы (ЛО)', data.incomeLO, 'Расходы (ЛО)', data.expenseLO)}
      
      ${divider}
      
      ${renderPair('Доходы (Обр.)', data.incomeObr, 'Расходы (Обр.)', data.expenseObr)}
      
      ${divider}
      
      ${renderPair('Доходы (Монтаж)', data.incomeMont, 'Расходы (Монтаж)', data.expenseMont)}
      
      ${divider}
      
      
      
    </div>
  `;

  //${row('Прибыль с 1 лифта', fmtMoney(data.profitPerLift))}
};

export const useChartOptions = ({
  isDarkMode,
  chartType,
  sunburstRootId,
  chartData,
  fullSunburstData
}: UseChartOptionsProps) => {

  const viewLevel = useMemo(() => {
    if (sunburstRootId === ROOT_ID) return 'root';
    const parts = sunburstRootId.split('|');
    if (parts.length === 1) return 'city';
    if (parts.length === 2) return 'jk';
    return 'liter';
  }, [sunburstRootId]);

  const visibleSunburstData = useMemo(() => {
    if (sunburstRootId === ROOT_ID) return fullSunburstData;

    const findNode = (nodes: any[], id: string): any => {
      for (const node of nodes) {
        if (node.id === id) return [node];
        if (node.children) {
          const found = findNode(node.children, id);
          if (found) return found;
        }
      }
      return null;
    };

    const found = findNode(fullSunburstData, sunburstRootId);
    return found || fullSunburstData;
  }, [fullSunburstData, sunburstRootId]);

  const visibleBarData = useMemo(() => {
    if (sunburstRootId === ROOT_ID) return chartData;

    const parts = sunburstRootId.split('|');
    const cityPart = parts.find(p => p.startsWith('city:'));
    const jkPart = parts.find(p => p.startsWith('jk:'));

    const selectedCity = cityPart ? cityPart.split(':')[1] : null;
    const selectedJK = jkPart ? jkPart.split(':')[1] : null;

    return chartData.filter(item => {
        if (selectedCity && item.cityName !== selectedCity) return false;
        if (selectedJK && item.jkName !== selectedJK) return false;
        return true;
    });
  }, [chartData, sunburstRootId]);

  return useMemo(() => {
    const common = {
      backgroundColor: 'transparent',
      title: { show: false },
    };

    const tooltipCommon = {
        trigger: 'item',
        backgroundColor: 'rgba(30, 41, 59, 0.95)', 
        borderColor: '#334155',
        textStyle: { color: '#f8fafc' },
        padding: 12,
        extraCssText: 'box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5); border-radius: 16px; backdrop-filter: blur(8px); z-index: 9999;',
        confine: true, // Helps keep ECharts tooltip within container/view
    };

    // --- SUNBURST CONFIG ---
    if (chartType === 'sunburst') {
      return {
        ...common,
        xAxis: { show: false, axisLine: { show: false } },
        yAxis: { show: false, axisLine: { show: false } },
        grid: { show: false },
        dataZoom: [{ show: false }],
        legend: { show: false },
        tooltip: {
          ...tooltipCommon,
          formatter: (params: any) => {
            if (params.data.id === sunburstRootId) return '';
            const parts = params.name.split(SEPARATOR);
            const label = parts[parts.length - 1];
            
            const raw = params.data;
            const extra = params.data.data || {}; 

            const tooltipData: TooltipData = {
                value: raw.value || 0,
                floors: raw.floors || 0,
                profit: raw.profit || 0,
                percent: extra.percent,
                percentFloors: extra.percentFloors,
                percentProfit: extra.percentProfit,
                
                incomeFact: extra.incomeFact,
                expenseFact: extra.expenseFact,
                incomeLO: extra.incomeLO,
                expenseLO: extra.expenseLO,
                incomeObr: extra.incomeObr,
                expenseObr: extra.expenseObr,
                incomeMont: extra.incomeMont,
                expenseMont: extra.expenseMont,
                rentability: extra.rentability,
                profitPerLift: extra.profitPerLift,
            };

            return getTooltipHtml(label, tooltipData, isDarkMode);
          },
        },
        series: [
          {
            type: 'sunburst',
            id: 'elevators-sunburst',
            data: visibleSunburstData,
            radius: [0, '95%'],
            center: ['50%', '50%'],
            nodeClick: false,
            animationDurationUpdate: 500,
            label: {
              rotate: 'radial',
              color: '#fff',
              textBorderColor: 'transparent',
              fontSize: 10,
              formatter: (param: any) => {
                if (param.data.id === sunburstRootId) return '';
                const parts = param.name.split(SEPARATOR);
                const cleanName = parts[parts.length - 1];
                return cleanName.length > 12 ? cleanName.substring(0, 10) + '..' : cleanName;
              },
            },
            itemStyle: {
              borderColor: isDarkMode ? '#1e293b' : '#fff',
              borderWidth: 1,
              borderRadius: 4,
            },
            emphasis: {
              focus: 'ancestor',
            },
            levels: (() => {
              if (viewLevel === 'root') {
                return [
                  { r0: '0%', r: '0%', itemStyle: { borderWidth: 0 }, label: { rotate: 0, show: false } },
                  { r0: '0%', r: '0%', itemStyle: { borderWidth: 2 }, label: { rotate: 'tangential', fontSize: 10, fontWeight: 'bold' } },
                  { r0: '13%', r: '35%', itemStyle: { borderWidth: 5 }, label: { padding: 3, minAngle: 2, fontSize: 8 } },
                  { r0: '38%', r: '68%', itemStyle: { borderWidth: 3 }, label: { padding: 3, minAngle: 2, fontSize: 8 } }
                ];
              } else if (viewLevel === 'city') {
                return [
                  { r0: '0%', r: '0%', itemStyle: { borderWidth: 2 }, label: { rotate: 'tangential', fontSize: 10, fontWeight: 'bold' } },
                  { r0: '0%', r: '35%', itemStyle: { borderWidth: 5 }, label: { rotate: 'tangential', fontSize: 10, fontWeight: 'bold' } },
                  { r0: '38%', r: '60%', itemStyle: { borderWidth: 3 }, label: { padding: 3, minAngle: 2, fontSize: 8 } }
                ];
              } else if (viewLevel === 'jk') {
                return [
                  { r0: '0%', r: '0%', itemStyle: { borderWidth: 2 }, label: { rotate: 'tangential', fontSize: 10, fontWeight: 'bold' } },
                  { r0: '0%', r: '42%', itemStyle: { borderWidth: 2 }, label: { rotate: 'tangential', fontSize: 10, fontWeight: 'bold' } }
                ];
              } else {
                return [
                  { r0: '0%', r: '0%', itemStyle: { borderWidth: 2 }, label: { rotate: 'tangential', fontSize: 10, fontWeight: 'bold' } },
                  { r0: '0%', r: '50%', itemStyle: { borderWidth: 2 }, label: { rotate: 'tangential', fontSize: 10, fontWeight: 'bold' } }
                ];
              }
            })(),
          },
        ],
      };
    }

    // --- BAR CHART CONFIG ---
    const dataForBar = visibleBarData;
    const dataCount = dataForBar.length;
    const dynamicLabelFontSize = dataCount < 9 ? 23 : dataCount < 15 ? 14 : dataCount < 30 ? 11 : 9;
    
    const xLabels = dataForBar.map(i => {
        if (viewLevel === 'jk') return i.literName;
        if (viewLevel === 'city') return `${i.jkName} / ${i.literName}`;
        return i.name;
    });

    return {
      ...common,
      legend: { show: false },
      tooltip: {
        ...tooltipCommon,
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params: any) => {
          const item = params[0];
          const data = item.data;
          const title = `${data.cityName} / ${data.jkName} / ${data.literName}`;
          
          const tooltipData: TooltipData = {
              value: data.value || 0,
              floors: data.floors || 0,
              profit: data.profit || 0,
              
              incomeFact: data.incomeFact,
              expenseFact: data.expenseFact,
              incomeLO: data.incomeLO,
              expenseLO: data.expenseLO,
              incomeObr: data.incomeObr,
              expenseObr: data.expenseObr,
              incomeMont: data.incomeMont,
              expenseMont: data.expenseMont,
              rentability: data.rentability,
              profitPerLift: data.profitPerLift,
          };
          
          return getTooltipHtml(title, tooltipData, isDarkMode);
        },
      },
      grid: { left: '1%', right: '1%', bottom: '2%', top: '5%', containLabel: true },
      xAxis: {
        show: true,
        type: 'category',
        data: xLabels,
        axisLabel: {
          show: true,
          color: isDarkMode ? '#94a3b8' : '#64748b',
          interval: 0,
          rotate: 90,
          fontSize: 9,
          formatter: (value: string) => value.length > 15 ? value.substring(0, 15) + '...' : value
        },
        axisLine: { show: true, lineStyle: { color: isDarkMode ? '#334155' : '#cbd5e1' } },
        axisTick: { show: true, alignWithLabel: true }
      },
      yAxis: {
        show: true,
        type: 'value',
        axisLabel: { color: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 10 },
        splitLine: { lineStyle: { color: isDarkMode ? '#334155' : '#e2e8f0', type: 'dashed' } }
      },
      dataZoom: [
        { type: 'slider', show: false, start: 0, end: 100 },
        { type: 'inside' }
      ],
      series: [
        {
          name: 'Лифты',
          type: 'bar',
          data: dataForBar,
          barMaxWidth: 300,
          barGap: '10%',
          label: {
            show: true,
            position: 'top',
            color: isDarkMode ? '#e2e8f0' : '#1e293b',
            fontSize: dynamicLabelFontSize,
            fontWeight: 'bold',
            distance: 2
          }
        }
      ]
    };
  }, [visibleBarData, visibleSunburstData, isDarkMode, chartType, sunburstRootId, viewLevel]);
};
