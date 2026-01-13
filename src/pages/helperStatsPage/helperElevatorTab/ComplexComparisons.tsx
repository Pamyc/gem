
import React, { useMemo, useState } from 'react';
import EChartComponent from '../../../components/charts/EChartComponent';
import { useDataStore } from '../../../contexts/DataContext';
import { getMergedHeaders } from '../../../utils/chartUtils';
import { Maximize2, X } from 'lucide-react';

interface ComplexComparisonsProps {
  isDarkMode: boolean;
  selectedCity: string;
  selectedYear: string;
  selectedRegion?: string;
}

// Helper for pluralization
const getPluralLiter = (n: number) => {
  n = Math.abs(n);
  if (n % 10 === 1 && n % 100 !== 11) return 'литер';
  if ([2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100)) return 'литера';
  return 'литеров';
};

const ComplexComparisons: React.FC<ComplexComparisonsProps> = ({ isDarkMode, selectedCity, selectedYear, selectedRegion }) => {
  const { googleSheets, sheetConfigs } = useDataStore();
  
  // State for modal expansion
  const [expandedChart, setExpandedChart] = useState<'elevators' | 'floors' | null>(null);

  const aggregatedData = useMemo(() => {
    const sheetKey = 'clientGrowth';
    const sheetData = googleSheets[sheetKey];

    if (!sheetData || !sheetData.headers || !sheetData.rows) return [];

    const config = sheetConfigs.find(c => c.key === sheetKey);
    const headerRowsCount = config?.headerRows || 1;
    const headers = getMergedHeaders(sheetData.headers, headerRowsCount);

    // Indices
    const idxJK = headers.indexOf('ЖК');
    const idxCity = headers.indexOf('Город');
    const idxRegion = headers.indexOf('Регион');
    const idxYear = headers.indexOf('Год');
    const idxElevators = headers.indexOf('Кол-во лифтов');
    const idxFloors = headers.indexOf('Кол-во этажей');
    const idxTotal = headers.indexOf('Итого (Да/Нет)');
    const idxNoBreakdown = headers.indexOf('Без разбивки на литеры (Да/Нет)');
    const idxOneLiter = headers.indexOf('Отдельный литер (Да/Нет)');

    if (idxJK === -1) return [];

    const groups = new Map<string, any[]>();

    // 1. Group by JK
    sheetData.rows.forEach(row => {
      // Exclude Grand Total
      if (idxTotal !== -1) {
         const val = String(row[idxTotal]).trim().toLowerCase();
         if (val !== 'нет') return;
      }

      // Filter by Region/City/Year
      if (selectedRegion && idxRegion !== -1 && String(row[idxRegion]) !== selectedRegion) return;
      if (selectedCity && idxCity !== -1 && String(row[idxCity]) !== selectedCity) return;
      if (selectedYear && selectedYear !== 'Весь период' && idxYear !== -1 && String(row[idxYear]) !== selectedYear) return;

      const jkName = String(row[idxJK] || '').trim();
      if (!jkName) return;

      if (!groups.has(jkName)) {
        groups.set(jkName, []);
      }
      groups.get(jkName)?.push(row);
    });

    // 2. Aggregate
    const result: any[] = [];

    groups.forEach((rows, jkName) => {
      // Calculate Liters Count (Using "Отдельный литер" logic)
      let liters = 0;
      if (idxOneLiter !== -1) {
         liters = rows.filter(r => String(r[idxOneLiter]).trim().toLowerCase() === 'да').length;
      } else {
         const detailRows = idxNoBreakdown !== -1
            ? rows.filter(r => String(r[idxNoBreakdown]).trim().toLowerCase() === 'нет')
            : rows;
         liters = detailRows.length;
      }
      // If 0 but data exists, assume 1 complex
      if (liters === 0 && rows.length > 0) liters = 1;

      // Calculate Sums (Using "Без разбивки на литеры" logic for totals)
      const sumRows = idxNoBreakdown !== -1 
        ? rows.filter(r => String(r[idxNoBreakdown]).trim().toLowerCase() === 'да')
        : rows;

      const totalElevators = sumRows.reduce((sum, r) => sum + (parseFloat(String(r[idxElevators]).replace(',', '.')) || 0), 0);
      const totalFloors = sumRows.reduce((sum, r) => sum + (parseFloat(String(r[idxFloors]).replace(',', '.')) || 0), 0);

      // Averages
      const avgElevators = liters > 0 ? parseFloat((totalElevators / liters).toFixed(1)) : 0;
      const avgFloors = liters > 0 ? parseFloat((totalFloors / liters).toFixed(1)) : 0;

      result.push({
        name: jkName,
        liters,
        totalElevators,
        avgElevators,
        totalFloors,
        avgFloors,
        // Short label for chart axis
        label: jkName, 
        // Full description for tooltips
        description: `${liters} ${getPluralLiter(liters)}`
      });
    });

    return result;

  }, [googleSheets, sheetConfigs, selectedCity, selectedYear, selectedRegion]);

  // Logic to prepare data: Sort, Slice Top 10, Aggregate "Others", Reverse for ECharts
  const prepareChartData = (metric: 'elevators' | 'floors', limit: number) => {
      const isElevator = metric === 'elevators';
      const sortKey = isElevator ? 'totalElevators' : 'totalFloors';
      
      // 1. Sort Descending
      const sorted = [...aggregatedData].sort((a, b) => b[sortKey] - a[sortKey]);

      // 2. Return full list if no limit or data fits limit
      if (limit === 0 || sorted.length <= limit) {
          // Reverse for ECharts Y-axis rendering (Bottom-to-Top drawing)
          return [...sorted].reverse();
      }

      // 3. Slice and Dice
      const topItems = sorted.slice(0, limit);
      const restItems = sorted.slice(limit);

      // 4. Aggregate Others
      const restTotalElevators = restItems.reduce((acc, curr) => acc + curr.totalElevators, 0);
      const restTotalFloors = restItems.reduce((acc, curr) => acc + curr.totalFloors, 0);
      const restLiters = restItems.reduce((acc, curr) => acc + curr.liters, 0);
      
      // Weighted averages for "Others"
      const restAvgElevators = restLiters > 0 ? parseFloat((restTotalElevators / restLiters).toFixed(1)) : 0;
      const restAvgFloors = restLiters > 0 ? parseFloat((restTotalFloors / restLiters).toFixed(1)) : 0;

      const othersItem = {
          name: 'Остальные...',
          liters: restLiters,
          totalElevators: restTotalElevators,
          avgElevators: restAvgElevators,
          totalFloors: restTotalFloors,
          avgFloors: restAvgFloors,
          label: `Остальные (${restItems.length} ЖК)`,
          description: `Суммарно по ${restItems.length} ЖК`,
          isOthers: true
      };

      const finalData = [...topItems, othersItem];
      // Reverse for ECharts
      return finalData.reverse();
  };

  const getOption = (metric: 'elevators' | 'floors', data: any[]) => {
    const isElevator = metric === 'elevators';
    const totalKey = isElevator ? 'totalElevators' : 'totalFloors';
    const avgKey = isElevator ? 'avgElevators' : 'avgFloors';
    const legend1 = isElevator ? 'Кол-во лифтов' : 'Кол-во этажей';
    const legend2 = isElevator ? 'Кол-во лифтов на 1 литер' : 'Кол-во этажей на 1 литер';

    const categories = data.map(d => d.label);
    const seriesTotal = data.map(d => d[totalKey]);
    const seriesAvg = data.map(d => d[avgKey]);

    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        backgroundColor: isDarkMode ? 'rgba(21, 25, 35, 0.9)' : 'rgba(255, 255, 255, 0.95)',
        borderColor: isDarkMode ? '#334155' : '#e2e8f0',
        textStyle: { color: isDarkMode ? '#f8fafc' : '#1e293b' },
        formatter: (params: any) => {
            const dataIndex = params[0].dataIndex;
            const item = data[dataIndex];
            let html = `<div style="font-weight:bold; margin-bottom:4px;">${item.name}</div>`;
            html += `<div style="font-size:11px; color: ${isDarkMode ? '#94a3b8' : '#64748b'}; margin-bottom:8px;">${item.description}</div>`;
            
            params.forEach((p: any) => {
               if (p.value > 0) {
                   html += `
                   <div style="display:flex; justify-content:space-between; align-items:center; gap:15px; font-size:12px;">
                      <span style="color:${p.color}">● ${p.seriesName}</span>
                      <span style="font-weight:bold">${p.value}</span>
                   </div>`;
               }
            });
            return html;
        }
      },
      legend: {
        data: [legend1, legend2],
        bottom: 0,
        left: 'center',
        textStyle: { color: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 12 }
      },
      grid: {
        left: '1%',
        right: '10%',
        bottom: '8%',
        top: '2%', // Removed title from inside chart
        containLabel: true
      },
      xAxis: {
        type: 'value',
        splitLine: { lineStyle: { color: isDarkMode ? '#334155' : '#e2e8f0', type: 'dashed' } },
        axisLabel: { color: isDarkMode ? '#94a3b8' : '#64748b' }
      },
      yAxis: {
        type: 'category',
        data: categories,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { 
            color: (val: string) => {
                // Highlight "Others" label
                if (val.startsWith('Остальные')) return isDarkMode ? '#a78bfa' : '#7c3aed';
                return isDarkMode ? '#e2e8f0' : '#1e293b';
            },
            fontWeight: 'bold',
            fontSize: 12,
            lineHeight: 16,
            interval: 0,
            formatter: (val: string) => val.length > 15 ? val.substring(0, 15) + '...' : val
        }
      },
      series: [
        {
          name: legend1,
          type: 'bar',
          color: '#3b82f6', // Explicit Blue for Legend
          data: seriesTotal,
          itemStyle: { 
              color: (p: any) => {
                  const item = data[p.dataIndex];
                  return item.isOthers 
                    ? (isDarkMode ? '#475569' : '#cbd5e1') // Gray for others
                    : '#3b82f6'; // Blue for Top
              }, 
              borderRadius: [0, 4, 4, 0] 
          },
          label: {
            show: true,
            position: 'right',
            color: isDarkMode ? '#e2e8f0' : '#1e293b',
            fontWeight: 'bold',
            formatter: (p: any) => p.value > 0 ? p.value : ''
          },
          barGap: '20%'
        },
        {
          name: legend2,
          type: 'bar',
          color: '#f43f5e', // Explicit Pink for Legend (Fixes Green issue)
          data: seriesAvg,
          itemStyle: { 
              color: (p: any) => {
                  const item = data[p.dataIndex];
                  return item.isOthers 
                    ? (isDarkMode ? '#94a3b8' : '#9ca3af') // Lighter gray for others avg
                    : '#f43f5e'; // Pink for Top avg
              }, 
              borderRadius: [0, 4, 4, 0] 
          },
          label: {
            show: true,
            position: 'right',
            color: isDarkMode ? '#e2e8f0' : '#1e293b',
            fontWeight: 'bold',
            formatter: (p: any) => p.value > 0 ? p.value : ''
          }
        }
      ]
    };
  };

  const renderChartCard = (metric: 'elevators' | 'floors', title: string) => {
      // Limit 10 -> 10 items + 1 "others" = 11 total
      const previewData = prepareChartData(metric, 10);
      
      return (
        <div className="bg-white dark:bg-[#151923] rounded-3xl p-6 shadow-sm border border-gray-200 dark:border-white/5 h-[500px] flex flex-col group relative">
            <div className="flex justify-between items-start mb-2">
                <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                        {title}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Топ-10 ЖК + Остальные</p>
                </div>
                <button 
                    onClick={() => setExpandedChart(metric)}
                    className="p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                    title="Развернуть"
                >
                    <Maximize2 size={18} />
                </button>
            </div>
            
            <div className="flex-1 w-full min-h-0">
                <EChartComponent 
                    options={getOption(metric, previewData)} 
                    theme={isDarkMode ? 'dark' : 'light'} 
                    height="100%" 
                />
            </div>
        </div>
      );
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
        {/* Chart 1: Elevators */}
        {renderChartCard('elevators', 'Количество лифтов по литерам')}

        {/* Chart 2: Floors */}
        {renderChartCard('floors', 'Количество этажей по литерам')}
      </div>

      {/* Expanded Modal */}
      {expandedChart && (
        <div 
            className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setExpandedChart(null)}
        >
           <div 
                className="bg-white dark:bg-[#151923] w-full max-w-6xl h-[85vh] rounded-3xl shadow-2xl border border-gray-200 dark:border-white/10 flex flex-col overflow-hidden"
                onClick={(e) => e.stopPropagation()} 
           >
              <div className="p-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between bg-gray-50/50 dark:bg-[#151923]">
                 <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {expandedChart === 'elevators' ? 'Количество лифтов по литерам' : 'Количество этажей по литерам'}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Полный список ЖК</p>
                 </div>
                 <button 
                   onClick={() => setExpandedChart(null)}
                   className="p-2.5 bg-gray-100 dark:bg-white/10 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/20 hover:text-gray-900 dark:hover:text-white transition-all"
                 >
                    <X size={24} />
                 </button>
              </div>
              <div className="flex-1 p-6 bg-white dark:bg-[#0b0f19] overflow-hidden">
                 {/* No limit for full view */}
                 <EChartComponent 
                    options={getOption(expandedChart, prepareChartData(expandedChart, 0))} 
                    theme={isDarkMode ? 'dark' : 'light'} 
                    height="100%" 
                 />
              </div>
           </div>
        </div>
      )}
    </>
  );
};

export default ComplexComparisons;
