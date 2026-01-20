
import React, { useMemo, useState, useEffect, useRef } from 'react';
import EChartComponent, { EChartInstance } from '../../../components/charts/EChartComponent';
import { useDataStore } from '../../../contexts/DataContext';
import { getMergedHeaders } from '../../../utils/chartUtils';
import { Loader2, BarChart2, Globe, MapPin, Building } from 'lucide-react';

interface ElevatorsPerYearListProps {
  isDarkMode: boolean;
  selectedCity: string;
  selectedRegion?: string;
}

// Palette for years
const YEAR_COLORS = [
  '#3b82f6', // Blue (Newest)
  '#f97316', // Orange
  '#10b981', // Emerald
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#eab308', // Yellow
  '#06b6d4', // Cyan
  '#6366f1', // Indigo
];

interface FlatDataItem {
  uniqueId: string; // Composite key for X axis
  name: string; // Visible JK name
  value: number;
  year: number;
  color: string;
}

interface JKSnapshot {
    year: number;
    value: number;
    color: string;
}

type GroupMode = 'region' | 'city' | 'jk';

const ElevatorsPerYearList: React.FC<ElevatorsPerYearListProps> = ({ isDarkMode, selectedCity, selectedRegion }) => {
  const { googleSheets, sheetConfigs, isLoading } = useDataStore();
  
  // State for filtering years via legend
  const [disabledYears, setDisabledYears] = useState<number[]>([]);
  // State for grouping mode
  const [groupByMode, setGroupByMode] = useState<GroupMode>('jk');
  
  const chartRef = useRef<EChartInstance>(null);

  // --- Data Processing ---
  const { chartData, yearsLegend, historyMap } = useMemo(() => {
    const sheetKey = 'clientGrowth';
    const sheetData = googleSheets[sheetKey];

    if (!sheetData || !sheetData.headers || !sheetData.rows) {
        return { chartData: [], yearsLegend: [], historyMap: new Map() };
    }

    const config = sheetConfigs.find(c => c.key === sheetKey);
    const headerRowsCount = config?.headerRows || 1;
    const headers = getMergedHeaders(sheetData.headers, headerRowsCount);

    // Column Indices
    const idxYear = headers.indexOf('Год');
    const idxJK = headers.indexOf('ЖК');
    const idxElevators = headers.indexOf('Кол-во лифтов');
    const idxCity = headers.indexOf('Город');
    const idxRegion = headers.indexOf('Регион');
    
    // Technical Filters
    const idxTotal = headers.indexOf('Итого (Да/Нет)');
    const idxNoBreakdown = headers.indexOf('Без разбивки на литеры (Да/Нет)');

    if (idxYear === -1 || idxJK === -1 || idxElevators === -1) {
        return { chartData: [], yearsLegend: [], historyMap: new Map() };
    }

    // Temporary storage for aggregation
    // Key: Year_Name (to merge rows if multiple rows exist for same Entity in same Year)
    const aggMap = new Map<string, { name: string; year: number; value: number }>();
    const uniqueYearsSet = new Set<number>();

    sheetData.rows.forEach(row => {
        // 1. Filter out Totals
        if (idxTotal !== -1 && String(row[idxTotal]).trim().toLowerCase() === 'да') return;
        
        // Only aggregate rows (No Breakdown = Yes)
        if (idxNoBreakdown !== -1) {
             const isAggregation = String(row[idxNoBreakdown]).trim().toLowerCase() === 'да';
             if (!isAggregation) return;
        }

        // 2. Context Filters
        const rowRegion = idxRegion !== -1 ? String(row[idxRegion]).trim() : '';
        if (selectedRegion && rowRegion !== selectedRegion) return;

        const rowCity = idxCity !== -1 ? String(row[idxCity]).trim() : '';
        if (selectedCity && rowCity !== selectedCity) return;

        // 3. Extract Data
        const yearStr = String(row[idxYear]).trim();
        const year = parseInt(yearStr);
        const val = parseFloat(String(row[idxElevators]).replace(',', '.')) || 0;

        if (!year || val === 0) return;

        // Determine Group Name based on Mode
        let groupName = '';
        if (groupByMode === 'region') {
            groupName = rowRegion;
        } else if (groupByMode === 'city') {
            groupName = rowCity;
        } else {
            groupName = String(row[idxJK]).trim();
        }

        if (!groupName) return;

        uniqueYearsSet.add(year);

        const key = `${year}___${groupName}`;
        
        if (!aggMap.has(key)) {
            aggMap.set(key, { name: groupName, year: year, value: 0 });
        }
        const item = aggMap.get(key)!;
        item.value += val;
    });

    const allYearsSorted = Array.from(uniqueYearsSet).sort((a, b) => b - a);

    // Build Legend Data (Fixed colors for years)
    const legend = allYearsSorted.map((y, idx) => ({
        year: y,
        color: YEAR_COLORS[idx % YEAR_COLORS.length]
    }));

    // Convert map to array
    const rawList = Array.from(aggMap.values());

    // Build History Map (Entity -> All Years Data) - This includes HIDDEN years too for context
    const history = new Map<string, JKSnapshot[]>();
    rawList.forEach(item => {
        if (!history.has(item.name)) {
            history.set(item.name, []);
        }
        const colorObj = legend.find(l => l.year === item.year);
        history.get(item.name)!.push({
            year: item.year,
            value: item.value,
            color: colorObj ? colorObj.color : '#ccc'
        });
    });

    // Sort history for each Entity
    history.forEach(snaps => snaps.sort((a, b) => b.year - a.year));

    // Filter and Sort for Chart Display
    const filteredList = rawList.filter(item => !disabledYears.includes(item.year));

    // SORTING LOGIC ("Staircase")
    filteredList.sort((a, b) => {
        if (b.year !== a.year) {
            return b.year - a.year; // Newer years first
        }
        return b.value - a.value; // Higher values first within the same year
    });

    // Assign Colors and Format for Chart
    const finalData: FlatDataItem[] = filteredList.map(item => {
        const legendItem = legend.find(l => l.year === item.year);
        const color = legendItem ? legendItem.color : '#ccc';
        return {
            uniqueId: `${item.name}__${item.year}`, // Unique key for X-axis
            name: item.name,
            year: item.year,
            value: item.value,
            color: color
        };
    });

    return { chartData: finalData, yearsLegend: legend, historyMap: history };
  }, [googleSheets, sheetConfigs, selectedCity, selectedRegion, disabledYears, groupByMode]);

  // --- Interaction Handlers ---
  const toggleYear = (year: number) => {
      setDisabledYears(prev => 
          prev.includes(year) ? prev.filter(y => y !== year) : [...prev, year]
      );
  };

  // --- Chart Events: Highlight Group ---
  useEffect(() => {
      const chart = chartRef.current?.getInstance();
      if (!chart) return;

      const handleMouseOver = (params: any) => {
          if (params.componentType === 'series') {
              const hoveredName = params.data.name; 
              
              // Find all indices that match this Name
              const indicesToHighlight: number[] = [];
              chartData.forEach((item, idx) => {
                  if (item.name === hoveredName) {
                      indicesToHighlight.push(idx);
                  }
              });

              // Сначала сбрасываем предыдущие состояния
              chart.dispatchAction({
                  type: 'downplay',
                  seriesIndex: 0
              });

              // Принудительно подсвечиваем всю группу
              // ECharts автоматически применит 'blur' к остальным, т.к. focus='self'
              chart.dispatchAction({
                  type: 'highlight',
                  seriesIndex: 0,
                  dataIndex: indicesToHighlight
              });
          }
      };

      const handleMouseOut = () => {
          // Сброс выделения и затемнения
          chart.dispatchAction({
              type: 'downplay',
              seriesIndex: 0
          });
      };

      chart.on('mouseover', handleMouseOver);
      chart.on('mouseout', handleMouseOut);

      return () => {
          chart.off('mouseover', handleMouseOver);
          chart.off('mouseout', handleMouseOut);
      };
  }, [chartData]);


  // --- Chart Option ---
  const option = useMemo(() => {
    const textColor = isDarkMode ? '#e2e8f0' : '#333';
    const axisColor = isDarkMode ? '#64748b' : '#999';
    const splitLineColor = isDarkMode ? '#334155' : '#e5e7eb';

    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        padding: 0,
        backgroundColor: isDarkMode ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        borderColor: isDarkMode ? '#334155' : '#e2e8f0',
        textStyle: { color: isDarkMode ? '#f8fafc' : '#1e293b' },
        formatter: (params: any) => {
            const data = params.data as FlatDataItem;
            const entityName = data.name;
            const history = historyMap.get(entityName) || [];

            let html = `<div style="padding: 10px; min-width: 180px;">`;
            html += `<div style="font-weight:bold; font-size:14px; margin-bottom:8px; border-bottom:1px solid ${isDarkMode?'#ffffff20':'#00000010'}; padding-bottom:4px;">${entityName}</div>`;
            
            history.forEach(snap => {
                const isCurrent = snap.year === data.year;
                const rowBg = isCurrent ? (isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)') : 'transparent';
                const weight = isCurrent ? 'bold' : 'normal';
                
                html += `
                    <div style="display:flex; justify-content:space-between; align-items:center; gap:15px; font-size:12px; margin-bottom:3px; background:${rowBg}; padding:2px 4px; border-radius:4px;">
                        <div style="display:flex; align-items:center; gap:6px;">
                            <span style="width:8px; height:8px; border-radius:50%; background-color:${snap.color}"></span>
                            <span style="color:${isDarkMode ? '#cbd5e1' : '#475569'}; font-weight:${weight}">${snap.year}</span>
                        </div>
                        <span style="font-weight:${weight}">${snap.value} шт.</span>
                    </div>
                `;
            });
            html += `</div>`;
            return html;
        }
      },
      grid: {
        left: '2%',
        right: '2%',
        bottom: '12%', 
        top: '5%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: chartData.map(d => d.uniqueId),
        axisLabel: { 
            color: axisColor,
            interval: 0,
            rotate: 45,
            fontSize: 10,
            formatter: (val: string) => {
                return val.split('__')[0].substring(0, 15);
            }
        },
        axisLine: { lineStyle: { color: axisColor } },
        axisTick: { alignWithLabel: true }
      },
      yAxis: {
        type: 'value',
        splitLine: { lineStyle: { color: splitLineColor, type: 'dashed' } },
        axisLabel: { color: axisColor }
      },
      dataZoom: [
        {
          type: 'slider',
          show: false,
          bottom: 10,
          height: 20,
          start: 0,
          end: Math.min(100, Math.max(5, 5000 / chartData.length)),
          borderColor: 'transparent',
          backgroundColor: isDarkMode ? '#1e293b' : '#f1f5f9',
          fillerColor: isDarkMode ? 'rgba(99, 102, 241, 0.2)' : 'rgba(99, 102, 241, 0.1)',
          handleStyle: { color: '#6366f1' },
          textStyle: { color: isDarkMode ? '#94a3b8' : '#64748b' }
        },
        {
          type: 'inside'
        }
      ],
      series: [
        {
          type: 'bar',
          data: chartData.map(d => ({
              value: d.value,
              name: d.name,
              year: d.year,
              itemStyle: { 
                  color: d.color,
                  borderRadius: [4, 4, 0, 0]
              }
          })),
          barMaxWidth: 50,
          label: {
            show: true,
            position: 'top',
            color: textColor,
            fontWeight: 'bold',
            fontSize: 10,
            formatter: (p: any) => p.value > 0 ? p.value : ''
          },
          // Configuration for highlighting group
          emphasis: {
              focus: 'self', // Используем 'self', чтобы ECharts автоматически затемнял остальные элементы при хайлайте
              itemStyle: {
                  opacity: 1,
                  shadowBlur: 10,
                  shadowColor: 'rgba(0,0,0,0.3)'
              }
          },
          blur: {
              itemStyle: {
                  opacity: 0.1 // Сильное затемнение для неактивных (не в группе)
              }
          }
        }
      ]
    };
  }, [chartData, isDarkMode, historyMap]);

  if (isLoading) {
    return (
        <div className="bg-white dark:bg-[#151923] rounded-3xl border border-gray-200 dark:border-white/10 p-10 flex items-center justify-center">
            <Loader2 className="animate-spin text-indigo-500" size={32} />
        </div>
    );
  }

  if (yearsLegend.length === 0) {
      return null;
  }

  const getButtonClass = (mode: GroupMode) => `
    px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all border
    ${groupByMode === mode 
        ? 'bg-white dark:bg-[#1e293b] text-indigo-600 dark:text-indigo-400 border-gray-200 dark:border-white/10 shadow-sm' 
        : 'text-gray-500 dark:text-gray-400 border-transparent hover:bg-gray-100 dark:hover:bg-white/5'}
  `;

  return (
    <div className="bg-white dark:bg-[#151923] rounded-3xl border border-gray-200 dark:border-white/10 shadow-sm overflow-hidden p-6">
       {/* Global Header */}
       <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-100 dark:bg-indigo-500/20 rounded-xl text-indigo-600 dark:text-indigo-400">
                <BarChart2 size={24} />
            </div>
            <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
                    Динамика ввода лифтов
                </h3>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
              {/* Group Mode Switcher */}
              <div className="flex bg-gray-100 dark:bg-white/5 rounded-xl p-1 gap-1 border border-gray-200 dark:border-white/10">
                  <button onClick={() => setGroupByMode('region')} className={getButtonClass('region')}>
                      <Globe size={14} /> Регион
                  </button>
                  <button onClick={() => setGroupByMode('city')} className={getButtonClass('city')}>
                      <MapPin size={14} /> Город
                  </button>
                  <button onClick={() => setGroupByMode('jk')} className={getButtonClass('jk')}>
                      <Building size={14} /> ЖК
                  </button>
              </div>

              {/* Interactive Custom Legend */}
              <div className="flex flex-wrap gap-2">
                  {yearsLegend.map(item => {
                      const isDisabled = disabledYears.includes(item.year);
                      return (
                        <button 
                            key={item.year} 
                            onClick={() => toggleYear(item.year)}
                            className={`
                                flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all duration-200 text-xs font-bold
                                ${isDisabled 
                                    ? 'bg-gray-100 dark:bg-white/5 text-gray-400 border-transparent opacity-50 grayscale' 
                                    : 'bg-white dark:bg-[#1e293b] border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-200 shadow-sm hover:border-indigo-300 dark:hover:border-indigo-500/50'
                                }
                            `}
                        >
                            <div 
                                className={`w-2.5 h-2.5 rounded-full transition-colors ${isDisabled ? 'bg-gray-400' : ''}`} 
                                style={{ backgroundColor: isDisabled ? undefined : item.color }}
                            ></div>
                            <span>{item.year}</span>
                        </button>
                      );
                  })}
              </div>
          </div>
       </div>

       {/* Single Chart Container */}
       <div className="h-[450px] w-full">
          {chartData.length > 0 ? (
              <EChartComponent 
                  ref={chartRef}
                  options={option} 
                  theme={isDarkMode ? 'dark' : 'light'} 
                  height="100%" 
              />
          ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                  <BarChart2 size={48} className="opacity-20 mb-2" />
                  <span>Нет данных для отображения</span>
                  <span className="text-xs opacity-70">Попробуйте включить года в легенде или сменить фильтры</span>
              </div>
          )}
       </div>
    </div>
  );
};

export default ElevatorsPerYearList;
