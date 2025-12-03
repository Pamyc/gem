
import { useMemo } from 'react';
import { SEPARATOR, ROOT_ID, ChartType, TooltipData, MetricKey } from './types';
import { formatLargeNumber } from '../../../../utils/formatUtils';

interface UseChartOptionsProps {
  isDarkMode: boolean;
  chartType: ChartType;
  sunburstRootId: string;
  chartData: any[];
  fullSunburstData: any[];
  activeMetric: MetricKey;
}

// Helper to render a text field with expand logic if too many items
const renderTextList = (label: string, items: string[]) => {
    if (!items || items.length === 0) return '';
    
    // Sort and remove duplicates (just in case)
    const unique = Array.from(new Set(items)).filter(Boolean).sort();
    
    if (unique.length === 0) return '';

    // Apply specific coloring for Status values
    const formattedItems = unique.map(item => {
        if (item === 'В работе') return `<span style="color: #ef4444;">${item}</span>`;
        if (item === 'Сдан') return `<span style="color: #22c55e;">${item}</span>`;
        return item;
    });

    const labelStyle = 'color: #94a3b8; font-size: 13px; font-weight: 500; min-width: 80px;';
    const valueStyle = 'color: #fff; font-size: 13px; font-weight: 600; text-align: right;';
    const rowStyle = 'display: flex; justify-content: space-between; align-items: start; margin-bottom: 2px; gap: 10px;';

    const maxItems = 2;
    const isExpandable = unique.length > maxItems;

    let content = '';

    if (isExpandable) {
        // Show first 2 + details
        const visible = formattedItems.slice(0, maxItems).join(', ');
        const hidden = formattedItems.join(', '); // All items for expanded view
        const remainingCount = unique.length - maxItems;
        
        // We use <details> native HTML element for interactivity inside tooltip
        content = `
            <details style="width: 100%;">
                <summary style="cursor: pointer; outline: none; list-style: none; display: flex; justify-content: space-between; align-items: center;">
                    <span style="text-align: right; color: #fff; font-weight: 600;">${visible}, ... <span style="color: #a78bfa; font-size: 11px;">(+${remainingCount})</span></span>
                </summary>
                <div style="margin-top: 4px; padding: 4px; background: rgba(0,0,0,0.2); border-radius: 4px; font-size: 12px; color: #e2e8f0; white-space: normal;">
                    ${hidden}
                </div>
            </details>
        `;
    } else {
        content = `<span>${formattedItems.join(', ')}</span>`;
    }

    return `
        <div style="${rowStyle}">
            <span style="${labelStyle}">${label}:</span>
            <div style="${valueStyle}; flex: 1;">${content}</div>
        </div>
    `;
};

// --- SINGLE SOURCE OF TRUTH FOR TOOLTIP HTML ---
export const getTooltipHtml = (title: string, data: TooltipData, isDarkMode: boolean, activeMetric: MetricKey) => {
  const textColor = '#ffffff'; 
  const labelColor = '#94a3b8'; // Slate-400
  const valColor = '#ffffff';
  const percentColor = '#a78bfa'; // Light Violet
  
  // Format helpers
  const fmt = (n?: number) => (n !== undefined ? n.toLocaleString('ru-RU') : '0');
  const fmtMoney = (n?: number) => (n !== undefined ? n.toLocaleString('ru-RU') + ' ₽' : '0 ₽');
  
  // Generic row creator
  const row = (label: string, val: string, pct?: string, arrowHtml: string = '', isPrimary: boolean = false, valueColorOverride?: string) => {
    const finalValueColor = valueColorOverride ? valueColorOverride : (isPrimary ? '#fff' : valColor);
    
    return `
    <div style="display: flex; justify-content: space-between; align-items: baseline; gap: 20px; margin-bottom: 4px; ${isPrimary ? 'background: rgba(139, 92, 246, 0.15); padding: 4px 8px; margin: 4px -4px; border-radius: 6px; border: 1px solid rgba(139, 92, 246, 0.3);' : ''}">
      <span style="color: ${isPrimary ? '#c4b5fd' : labelColor}; font-size: ${isPrimary ? '14px' : '13px'}; font-weight: ${isPrimary ? '700' : '500'};">${label}:</span>
      <div style="text-align: right; white-space: nowrap;">
        <span style="color: ${finalValueColor}; font-size: ${isPrimary ? '16px' : '14px'}; font-weight: 700; margin-right: ${pct ? '8px' : '0'};">${val}</span>
        ${arrowHtml}
        ${pct ? `<span style="color: ${percentColor}; font-size: 12px; font-weight: 600;">(${pct}%)</span>` : ''}
      </div>
    </div>
  `;
  };

  // Render a pair of values
  const renderPair = (key1: MetricKey, label1: string, val1: number | undefined, key2: MetricKey, label2: string, val2: number | undefined) => {
      const v1 = val1 || 0;
      const v2 = val2 || 0;
      
      const isIncomeHigher = v1 > v2;
      const isExpenseHigher = v2 > v1;

      const arrow1 = isIncomeHigher ? '<span style="color: #4ade80; margin-left: 6px; font-size: 12px;">▲</span>' : '';
      const arrow2 = isExpenseHigher ? '<span style="color: #f87171; margin-left: 6px; font-size: 12px;">▼</span>' : '';

      const color1 = isIncomeHigher ? '#4ade80' : undefined;
      const color2 = isExpenseHigher ? '#f87171' : undefined;

      const isPrimary1 = activeMetric === key1;
      const isPrimary2 = activeMetric === key2;

      return `
        ${row(label1, fmtMoney(v1), undefined, arrow1, isPrimary1, color1)}
        ${row(label2, fmtMoney(v2), undefined, arrow2, isPrimary2, color2)}
      `;
  };

  const divider = `<div style="height: 1px; background-color: rgba(255,255,255,0.1); margin: 8px 0;"></div>`;
  const titleHtml = `<div style="font-size: 16px; font-weight: 800; color: ${textColor}; margin-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 8px;">${title}</div>`;

  // --- Logic to reorder items based on selection ---
  const metricRows = [
      () => row('Лифтов', fmt(data.value), activeMetric === 'value' ? data.percent : undefined, '', activeMetric === 'value'),
      () => row('Этажей', fmt(data.floors), activeMetric === 'floors' ? data.percent : undefined, '', activeMetric === 'floors'),
      () => row('Валовая', fmtMoney(data.profit), activeMetric === 'profit' ? data.percent : undefined, '', activeMetric === 'profit'),
      
      () => `
        ${divider}
        ${renderPair('incomeFact', 'Доходы (Факт)', data.incomeFact, 'expenseFact', 'Расходы (Факт)', data.expenseFact)}
      `,
      () => `
        ${divider}
        ${renderPair('incomeLO', 'Доходы (ЛО)', data.incomeLO, 'expenseLO', 'Расходы (ЛО)', data.expenseLO)}
      `,
      () => `
        ${divider}
        ${renderPair('incomeObr', 'Доходы (Обр.)', data.incomeObr, 'expenseObr', 'Расходы (Обр.)', data.expenseObr)}
      `,
      () => `
        ${divider}
        ${renderPair('incomeMont', 'Доходы (Монтаж)', data.incomeMont, 'expenseMont', 'Расходы (Монтаж)', data.expenseMont)}
      `
  ];

  let primaryHtml = '';
  const remainingRows: (() => string)[] = [];

  const isMetricInBlock = (blockIndex: number, metric: MetricKey) => {
      if (blockIndex === 0 && metric === 'value') return true;
      if (blockIndex === 1 && metric === 'floors') return true;
      if (blockIndex === 2 && metric === 'profit') return true;
      if (blockIndex === 3 && (metric === 'incomeFact' || metric === 'expenseFact')) return true;
      if (blockIndex === 4 && (metric === 'incomeLO' || metric === 'expenseLO')) return true;
      if (blockIndex === 5 && (metric === 'incomeObr' || metric === 'expenseObr')) return true;
      if (blockIndex === 6 && (metric === 'incomeMont' || metric === 'expenseMont')) return true;
      return false;
  };

  metricRows.forEach((renderFn, idx) => {
      if (isMetricInBlock(idx, activeMetric)) {
          primaryHtml = renderFn(); 
      } else {
          remainingRows.push(renderFn);
      }
  });

  // Text metadata section
  const textMetadataHtml = `
    ${divider}
    ${renderTextList('Клиент', data.clients)}
    ${renderTextList('Город', data.cities)}
    ${renderTextList('ЖК', data.jks)}
    ${renderTextList('Статус', data.statuses)}
    ${renderTextList('Тип', data.objectTypes)}
    ${renderTextList('Год', data.years)}
    ${divider}
  `;

  // Wrapper with max-height and scroll
  // Pointer-events auto is CRITICAL for <details> interaction
  return `
    <div style="font-family: sans-serif; min-width: 320px; max-width: 350px; padding: 4px; max-height: 400px; overflow-y: auto; overflow-x: hidden; pointer-events: auto;">
      
      
      ${titleHtml}
      ${primaryHtml}
      ${textMetadataHtml} 
      ${remainingRows.map(fn => fn()).join('')}
      
    </div>
  `;
};

export const useChartOptions = ({
  isDarkMode,
  chartType,
  sunburstRootId,
  chartData,
  fullSunburstData,
  activeMetric
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

    // Enhanced tooltip config with interaction enabled
    const tooltipCommon = {
        trigger: 'item',
        enterable: true, // IMPORTANT: Allows mouse to enter the tooltip for scrolling/clicking
        appendToBody: true, // Prevents z-index clipping
        backgroundColor: 'rgba(30, 41, 59, 0.98)', 
        borderColor: '#334155',
        textStyle: { color: '#f8fafc' },
        padding: 12,
        extraCssText: 'box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.6); border-radius: 16px; backdrop-filter: blur(10px); z-index: 99999; pointer-events: auto;',
        confine: true, 
    };

    const formatTooltip = (params: any) => {
        // Handle axis trigger (array of params) or single item
        const p = Array.isArray(params) ? params[0] : params;
        
        // Safety check for p and p.data
        if (!p || !p.data) return '';

        // Handle Sunburst root skipping
        if (p.data.id === sunburstRootId) return '';
        
        let label = '';
        let extra: any = {};

        // Determine source of data (Sunburst node vs Bar item)
        if (p.seriesType === 'sunburst') {
            const parts = p.name.split(SEPARATOR);
            label = parts[parts.length - 1];
            extra = p.data.data || {};
        } else {
            // Bar chart
            const data = p.data;
            label = `${data.cityName} / ${data.jkName} / ${data.literName}`;
            extra = data; // Bar data structure is flat
        }

        const tooltipData: TooltipData = {
            value: extra.value || extra.elevators || 0, // Fallback logic
            floors: extra.floors || 0,
            profit: extra.profit || 0,
            
            percent: extra.percent,
            
            incomeFact: extra.incomeFact,
            expenseFact: extra.expenseFact,
            incomeLO: extra.incomeLO,
            expenseLO: extra.expenseLO,
            incomeObr: extra.incomeObr,
            expenseObr: extra.expenseObr,
            incomeMont: extra.incomeMont,
            expenseMont: extra.expenseMont,
            profitPerLift: extra.profitPerLift,

            // Text Arrays
            clients: extra.clients || [],
            cities: extra.cities || [],
            jks: extra.jks || [],
            statuses: extra.statuses || [],
            objectTypes: extra.objectTypes || [],
            years: extra.years || []
        };

        return getTooltipHtml(label, tooltipData, isDarkMode, activeMetric);
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
          formatter: formatTooltip,
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
        formatter: formatTooltip, // Use shared formatter
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
        axisLabel: { 
            color: isDarkMode ? '#94a3b8' : '#64748b', 
            fontSize: 10,
            formatter: (value: number) => formatLargeNumber(value)
        },
        splitLine: { lineStyle: { color: isDarkMode ? '#334155' : '#e2e8f0', type: 'dashed' } }
      },
      dataZoom: [
        { type: 'slider', show: false, start: 0, end: 100 },
        { type: 'inside' }
      ],
      series: [
        {
          name: 'Metric',
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
            distance: 2,
            formatter: (params: any) => formatLargeNumber(params.value)
          }
        }
      ]
    };
  }, [visibleBarData, visibleSunburstData, isDarkMode, chartType, sunburstRootId, viewLevel, activeMetric]);
};
