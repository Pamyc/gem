
import React, { useMemo, useState, useRef } from 'react';
import { BarChart2, PieChart, ChevronDown, ChevronRight, Palette, CheckCircle2, XCircle } from 'lucide-react';
import EChartComponent, { EChartInstance } from '../../../components/charts/EChartComponent';
import { useDataStore } from '../../../contexts/DataContext';
import { getMergedHeaders } from '../../../utils/chartUtils';

interface ElevatorsByLiterChartProps {
  isDarkMode: boolean;
  selectedCity: string;
  selectedYear: string;
}

// Palette for Housing Complexes (Removed pure Red and Green to avoid conflict with Status)
const COLORS = [
  '#3b82f6', // Blue
  '#f97316', // Orange
  '#8b5cf6', // Violet
  '#14b8a6', // Teal
  '#ec4899', // Pink
  '#eab308', // Yellow
  '#06b6d4', // Cyan
  '#6366f1', // Indigo
  '#a855f7', // Purple
];

// Distinct Colors for Status
const STATUS_COLORS = {
  yes: '#22c55e', // Green 500 (Distinct "Go")
  no: '#ef4444',  // Red 500 (Distinct "Stop")
};

const SEPARATOR = ':::';

const ElevatorsByLiterChart: React.FC<ElevatorsByLiterChartProps> = ({ isDarkMode, selectedCity, selectedYear }) => {
  const { googleSheets, sheetConfigs } = useDataStore();
  const [chartType, setChartType] = useState<'bar' | 'sunburst'>('bar');
  const [colorMode, setColorMode] = useState<'jk' | 'status'>('jk');
  const [expandedJK, setExpandedJK] = useState<string | null>(null);

  // Ref to access the ECharts instance
  const chartRef = useRef<EChartInstance>(null);

  const { chartData, sunburstData, xLabels, uniqueJKs, jkSummary, totalElevators } = useMemo(() => {
    const sheetKey = 'clientGrowth';
    const sheetData = googleSheets[sheetKey];

    if (!sheetData || !sheetData.headers || !sheetData.rows) {
      return { chartData: [], sunburstData: [], xLabels: [], uniqueJKs: [], jkSummary: [], totalElevators: 0 };
    }

    const config = sheetConfigs.find(c => c.key === sheetKey);
    const headerRows = config?.headerRows || 1;
    const headers = getMergedHeaders(sheetData.headers, headerRows);

    // Индексы столбцов
    const idxJK = headers.indexOf('ЖК');
    const idxLiter = headers.indexOf('Литер');
    const idxElevators = headers.indexOf('Кол-во лифтов');
    const idxCity = headers.indexOf('Город');
    const idxYear = headers.indexOf('Год');
    const idxStatus = headers.indexOf('Сдан да/нет');

    // Фильтры для исключения итогов
    const idxTotal = headers.indexOf('Итого (Да/Нет)');
    const idxNoBreakdown = headers.indexOf('Отдельный литер (Да/Нет)');

    if (idxJK === -1 || idxElevators === -1) return { chartData: [], sunburstData: [], xLabels: [], uniqueJKs: [], jkSummary: [], totalElevators: 0 };

    // 1. Сбор сырых данных
    const rawItems = sheetData.rows.map(row => {
      // 1.1 Фильтрация по структуре данных (исключаем общие итоги)
      if (
        idxTotal !== -1 &&
        String(row[idxTotal]).trim().toLowerCase() === 'да'.toLowerCase()
      ) return null;

      if (
        idxNoBreakdown !== -1 &&
        String(row[idxNoBreakdown]).trim().toLowerCase() === 'нет'.toLowerCase()
      ) return null;

      // 1.2 Фильтрация по селекторам (Город / Год)
      if (selectedCity && idxCity !== -1) {
        const rowCity = String(row[idxCity]).trim();
        if (rowCity !== selectedCity) return null;
      }

      if (selectedYear && selectedYear !== 'Весь период' && idxYear !== -1) {
        const rowYear = String(row[idxYear]).trim();
        if (rowYear !== selectedYear) return null;
      }

      const jk = String(row[idxJK]).trim();
      const literRaw = idxLiter !== -1 ? String(row[idxLiter]).trim() : '';
      const liter = literRaw || jk;
      
      const statusRaw = idxStatus !== -1 ? String(row[idxStatus]).trim().toLowerCase() : '';
      const isHandedOver = statusRaw === 'да';

      const value = parseFloat(String(row[idxElevators]).replace(',', '.')) || 0;

      if (!jk || value === 0) return null;

      return { jk, liter, value, isHandedOver };
    }).filter(Boolean) as { jk: string, liter: string, value: number, isHandedOver: boolean }[];

    // 2. Сортировка: Сначала по ЖК, потом по Литеру
    rawItems.sort((a, b) => {
      if (a.jk !== b.jk) return a.jk.localeCompare(b.jk);
      return a.liter.localeCompare(b.liter, undefined, { numeric: true, sensitivity: 'base' });
    });

    // 3. Подготовка цветов для ЖК
    const uniqueJKsList = Array.from(new Set(rawItems.map(i => i.jk)));

    // 3.1 Подготовка саммари для списка справа
    const jkMap = new Map<string, { total: number, liters: { name: string, value: number, isHandedOver: boolean }[] }>();
    const totalElevatorsCalc = rawItems.reduce((acc, curr) => acc + curr.value, 0);

    rawItems.forEach(item => {
      if (!jkMap.has(item.jk)) {
        jkMap.set(item.jk, { total: 0, liters: [] });
      }
      const entry = jkMap.get(item.jk)!;
      entry.total += item.value;
      entry.liters.push({ name: item.liter, value: item.value, isHandedOver: item.isHandedOver });
    });

    const jkSummary = Array.from(jkMap.entries())
      .map(([name, data]) => ({
        name,
        value: data.total,
        percent: totalElevatorsCalc > 0 ? ((data.total / totalElevatorsCalc) * 100).toFixed(1) : '0',
        liters: data.liters
          .map(l => ({
            ...l,
            percent: data.total > 0 ? ((l.value / data.total) * 100).toFixed(1) : '0'
          }))
          .sort((a, b) => b.value - a.value),
        color: COLORS[uniqueJKsList.indexOf(name) % COLORS.length]
      }))
      .sort((a, b) => b.value - a.value);

    // Helper to get color
    const getItemColor = (jkName: string, isHandedOver: boolean) => {
        if (colorMode === 'status') {
            return isHandedOver ? STATUS_COLORS.yes : STATUS_COLORS.no;
        }
        return COLORS[uniqueJKsList.indexOf(jkName) % COLORS.length];
    };

    // 4. Формирование данных для Bar Chart (Flat)
    const finalData = rawItems.map(item => {
      return {
        value: item.value,
        name: item.liter,
        jkName: item.jk,
        isHandedOver: item.isHandedOver,
        itemStyle: {
          color: getItemColor(item.jk, item.isHandedOver),
          borderRadius: [3, 3, 0, 0]
        }
      };
    });

    // 5. Формирование данных для Sunburst (Hierarchy)
    const sunburstHierarchy = uniqueJKsList.map((jk, idx) => {
      const jkColor = COLORS[idx % COLORS.length]; // Parent always colored by JK for structure
      return {
        name: jk,
        itemStyle: { color: jkColor }, 
        children: rawItems
          .filter(item => item.jk === jk)
          .map(item => ({
            name: `${jk}${SEPARATOR}${item.liter}`,
            value: item.value,
            itemStyle: { 
                // Children follow the selected color mode
                color: getItemColor(item.jk, item.isHandedOver),
                opacity: colorMode === 'status' ? 1 : 0.8 
            }
          }))
      };
    });

    // 6. Подписи оси X для бара
    const labels = rawItems.map(i => i.liter);

    return {
      chartData: finalData,
      sunburstData: sunburstHierarchy,
      xLabels: labels,
      uniqueJKs: uniqueJKsList,
      jkSummary,
      totalElevators: totalElevatorsCalc
    };
  }, [googleSheets, sheetConfigs, selectedCity, selectedYear, colorMode]);

  const option = useMemo(() => {
    const common = {
      backgroundColor: 'transparent',
      title: { show: false },
    };

    if (chartType === 'sunburst') {
      return {
        ...common,
        xAxis: { show: false, axisLine: { show: false } },
        yAxis: { show: false, axisLine: { show: false } },
        grid: { show: false },
        dataZoom: [{ show: false }],
        legend: { show: false },
        tooltip: {
          trigger: 'item',
          backgroundColor: isDarkMode ? 'rgba(21, 25, 35, 0.9)' : 'rgba(255, 255, 255, 0.95)',
          borderColor: isDarkMode ? '#334155' : '#e2e8f0',
          textStyle: { color: isDarkMode ? '#f8fafc' : '#1e293b' },
          formatter: (params: any) => {
            const cleanName = params.name.includes(SEPARATOR) ? params.name.split(SEPARATOR)[1] : params.name;
            return `
               <div style="font-weight:bold; margin-bottom:4px;">${cleanName}</div>
               <div style="margin-top:4px;">Лифтов: <b>${params.value}</b></div>
             `;
          }
        },
        series: [{
          type: 'sunburst',
          data: sunburstData,
          radius: [0, '90%'],
          center: ['50%', '50%'],
          label: {
            rotate: 'radial',
            color: '#fff',
            textBorderColor: 'transparent',
            fontSize: 10,
            formatter: (param: any) => {
              const cleanName = param.name.includes(SEPARATOR) ? param.name.split(SEPARATOR)[1] : param.name;
              return cleanName.length > 10 ? cleanName.substring(0, 10) + '..' : cleanName;
            }
          },
          itemStyle: {
            borderColor: isDarkMode ? '#1e293b' : '#fff',
            borderWidth: 1,
            borderRadius: 4
          },
          emphasis: {
            focus: 'ancestor'
          },
          levels: [
            {},
            {
              r0: '15%',
              r: '60%',
              itemStyle: { borderWidth: 2 },
              label: { rotate: 'tangential', fontSize: 11, fontWeight: 'bold' }
            },
            {
              r0: '60%',
              r: '90%',
              label: { align: 'right' }
            }
          ]
        }]
      };
    }

    return {
      ...common,
      legend: { show: false },
      tooltip: {
        trigger: 'axis',
        backgroundColor: isDarkMode ? 'rgba(21, 25, 35, 0.9)' : 'rgba(255, 255, 255, 0.95)',
        borderColor: isDarkMode ? '#334155' : '#e2e8f0',
        textStyle: { color: isDarkMode ? '#f8fafc' : '#1e293b' },
        axisPointer: { type: 'shadow' },
        formatter: (params: any) => {
          const item = params[0];
          const data = item.data;
          const statusText = data.isHandedOver ? '<span style="color:#22c55e">Сдан</span>' : '<span style="color:#ef4444">В работе</span>';
          return `
            <div style="font-weight:bold; margin-bottom:4px;">${data.jkName}</div>
            <div style="font-size:12px; color: ${isDarkMode ? '#cbd5e1' : '#64748b'}">Литер: ${item.name}</div>
            <div style="font-size:12px; margin-top:2px;">Статус: ${statusText}</div>
            <div style="margin-top:4px;">Лифтов: <b>${item.value}</b></div>
          `;
        }
      },
      grid: {
        left: '1%',
        right: '1%',
        bottom: '2%',
        top: '5%',
        containLabel: true
      },
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
        {
          type: 'slider',
          show: false,
          start: 0,
          end: 100
        },
        { type: 'inside' }
      ],
      series: [
        {
          name: 'Лифты',
          type: 'bar',
          data: chartData,
          barMaxWidth: 20,
          barGap: '10%',
          label: {
            show: true,
            position: 'top',
            color: isDarkMode ? '#e2e8f0' : '#1e293b',
            fontSize: 9,
            fontWeight: 'bold',
            distance: 2
          }
        }
      ]
    };
  }, [chartData, sunburstData, xLabels, isDarkMode, chartType]);

  // Handlers for List Interactions
  const handleItemHover = (name: string) => {
    const instance = chartRef.current?.getInstance();
    if (instance) {
      instance.dispatchAction({
        type: 'highlight',
        name: name
      });
      if (!name.includes(SEPARATOR)) {
        instance.dispatchAction({
          type: 'showTip',
          name: name,
          seriesIndex: 0
        });
      }
    }
  };

  const handleItemLeave = (name: string) => {
    const instance = chartRef.current?.getInstance();
    if (instance) {
      instance.dispatchAction({
        type: 'downplay',
        name: name
      });
      instance.dispatchAction({
        type: 'hideTip'
      });
    }
  };

  const toggleJK = (name: string) => {
    setExpandedJK(prev => prev === name ? null : name);
  };

  return (
    <div className="bg-white dark:bg-[#151923] rounded-3xl border border-gray-200 dark:border-white/10 shadow-sm overflow-hidden p-5 flex flex-col gap-2 w-full relative group">

      {/* Header: Title and Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
            Количество лифтов по литерам
            {colorMode === 'status' && <span className="text-emerald-500 ml-2">(Статус сдачи)</span>}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {colorMode === 'status' 
              ? 'Цвета показывают статус: Зеленый (Сдан) / Красный (В работе)' 
              : (chartType === 'bar' ? 'Группировка цветом по ЖК' : 'Иерархия: ЖК -> Литер')}
          </p>
        </div>

        <div className="flex gap-2">
            {/* Color Mode Switcher */}
            <div className="flex bg-gray-100 dark:bg-white/5 rounded-lg p-1 gap-1 border border-gray-200 dark:border-white/10">
                <button
                    onClick={() => setColorMode('jk')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${colorMode === 'jk'
                        ? 'bg-white dark:bg-[#1e2433] text-indigo-500 shadow-sm'
                        : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                    }`}
                    title="Цвет по ЖК"
                >
                    <Palette size={14} />
                    ЖК
                </button>
                <button
                    onClick={() => setColorMode('status')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${colorMode === 'status'
                        ? 'bg-white dark:bg-[#1e2433] text-emerald-500 shadow-sm'
                        : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                    }`}
                    title="Цвет по статусу сдачи"
                >
                    <CheckCircle2 size={14} />
                    Сдан да/нет
                </button>
            </div>

            {/* Chart Type Switcher */}
            <div className="flex bg-gray-100 dark:bg-white/5 rounded-lg p-1 gap-1 border border-gray-200 dark:border-white/10">
                <button
                    onClick={() => setChartType('bar')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${chartType === 'bar'
                        ? 'bg-white dark:bg-[#1e2433] text-indigo-500 shadow-sm'
                        : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                    }`}
                >
                    <BarChart2 size={14} />
                    Bar
                </button>
                <button
                    onClick={() => setChartType('sunburst')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${chartType === 'sunburst'
                        ? 'bg-white dark:bg-[#1e2433] text-indigo-500 shadow-sm'
                        : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                    }`}
                >
                    <PieChart size={14} />
                    Sunburst
                </button>
            </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="h-[580px] w-full flex flex-row relative">

        {/* Custom Side List for Sunburst */}
        {chartType === 'sunburst' && (
          <div className="w-1/3 min-w-[220px] h-full overflow-y-auto custom-scrollbar border-r border-gray-100 dark:border-white/5 pr-4 pl-2 py-2 animate-in slide-in-from-left-4 duration-500">
            <div className="flex items-center justify-between sticky top-0 bg-white dark:bg-[#151923] py-2 z-10 mb-2 border-b border-gray-100 dark:border-white/5">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Рейтинг ЖК
                </h4>
                {totalElevators > 0 && (
                  <div className="flex items-center gap-1">
                     <span className="text-[10px] font-bold text-gray-900 dark:text-white bg-gray-100 dark:bg-white/10 px-2 py-0.5 rounded-md font-mono">
                        {totalElevators}
                     </span>
                  </div>
                )}
            </div>
            
            <div className="space-y-1">
              {jkSummary.map((item) => {
                const isExpanded = expandedJK === item.name;
                return (
                  <div key={item.name} className="flex flex-col">
                    {/* Header Row */}
                    <div
                      onMouseEnter={() => handleItemHover(item.name)}
                      onMouseLeave={() => handleItemLeave(item.name)}
                      onClick={() => toggleJK(item.name)}
                      className={`flex items-center justify-between group p-2 rounded-lg transition-all cursor-pointer ${isExpanded
                          ? 'bg-gray-100 dark:bg-white/10 shadow-sm'
                          : 'hover:bg-gray-50 dark:hover:bg-white/5'
                        }`}
                    >
                      <div className="flex items-center gap-2 overflow-hidden flex-1">
                        <div
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-xs font-bold text-gray-700 dark:text-gray-200 truncate" title={item.name}>
                          {item.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 pl-2">
                        <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-white/10 px-1.5 py-0.5 rounded">
                          {item.percent}%
                        </span>
                        <span className="text-xs font-bold text-gray-900 dark:text-white font-mono">
                          {item.value}
                        </span>
                        <div className="text-gray-400 group-hover:text-indigo-500 transition-colors">
                          {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        </div>
                      </div>
                    </div>

                    {/* Accordion Body */}
                    {isExpanded && (
                      <div className="pl-4 pr-1 py-1 space-y-0.5 animate-in slide-in-from-top-1 duration-200">
                        {item.liters.map((liter, lIdx) => (
                          <div
                            key={`${item.name}-${liter.name}-${lIdx}`}
                            className="flex justify-between items-center px-3 py-1.5 rounded-md hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-default"
                            onMouseEnter={() => handleItemHover(`${item.name}${SEPARATOR}${liter.name}`)}
                            onMouseLeave={() => handleItemLeave(`${item.name}${SEPARATOR}${liter.name}`)}
                          >
                            <div className="flex items-center gap-2 overflow-hidden">
                                {colorMode === 'status' && (
                                    <div 
                                        className={`w-1.5 h-1.5 rounded-full shrink-0`}
                                        style={{ backgroundColor: liter.isHandedOver ? STATUS_COLORS.yes : STATUS_COLORS.no }}
                                    />
                                )}
                                <span className="text-[11px] text-gray-500 dark:text-gray-400 truncate max-w-[100px]" title={liter.name}>
                                {liter.name}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-mono text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-white/10 px-1.5 rounded">
                                {liter.value}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Chart */}
        <div className="flex-1 h-full min-w-0">
          <EChartComponent
            ref={chartRef}
            options={option}
            theme={isDarkMode ? 'dark' : 'light'}
            height="100%"
            merge={true}
          />
        </div>

      </div>

      {/* Легенда внизу (меняется в зависимости от режима) */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 justify-center px-2 pb-1 border-t border-gray-100 dark:border-white/5 pt-3">
        {colorMode === 'status' ? (
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-xs">
                    <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: STATUS_COLORS.yes }} />
                    <span className="text-gray-600 dark:text-gray-400 font-bold">Сдан (Да)</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs">
                    <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: STATUS_COLORS.no }} />
                    <span className="text-gray-600 dark:text-gray-400 font-bold">Не сдан / В работе</span>
                </div>
            </div>
        ) : (
            chartType === 'bar' && uniqueJKs.length > 0 && uniqueJKs.map((jk, idx) => (
                <div key={jk} className="flex items-center gap-1.5 text-[10px]">
                <div
                    className="w-2.5 h-2.5 rounded-full shadow-sm shrink-0"
                    style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                />
                <span className="text-gray-600 dark:text-gray-400 font-bold whitespace-nowrap">{jk}</span>
                </div>
            ))
        )}
      </div>
    </div>
  );
};

export default ElevatorsByLiterChart;
