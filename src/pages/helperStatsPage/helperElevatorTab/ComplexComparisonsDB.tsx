
import React, { useState } from 'react';
import EChartComponent from '../../../components/charts/EChartComponent';
import { Maximize2, X, Database, Loader2 } from 'lucide-react';
import { useComplexComparisonsDB, DBComparisonItem } from '../../../hooks/useComplexComparisonsDB';

interface ComplexComparisonsDBProps {
  isDarkMode: boolean;
  selectedCity: string;
  selectedYear: string;
  selectedRegion?: string;
}

const ComplexComparisonsDB: React.FC<ComplexComparisonsDBProps> = ({ isDarkMode, selectedCity, selectedYear, selectedRegion }) => {
  // Хук теперь возвращает отфильтрованные данные мгновенно из контекста
  const { data: aggregatedData, loading, error } = useComplexComparisonsDB(selectedCity, selectedYear, selectedRegion || '');
  
  const [expandedChart, setExpandedChart] = useState<'elevators' | 'floors' | null>(null);

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

      const othersItem: DBComparisonItem = {
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
        backgroundColor: isDarkMode ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
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
        top: '2%',
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
          color: '#10b981', // Emerald for DB version to distinguish
          data: seriesTotal,
          itemStyle: { 
              color: (p: any) => {
                  const item = data[p.dataIndex];
                  return item.isOthers 
                    ? (isDarkMode ? '#475569' : '#cbd5e1') 
                    : '#10b981'; 
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
          color: '#f59e0b', // Amber for DB
          data: seriesAvg,
          itemStyle: { 
              color: (p: any) => {
                  const item = data[p.dataIndex];
                  return item.isOthers 
                    ? (isDarkMode ? '#94a3b8' : '#9ca3af') 
                    : '#f59e0b';
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
      const previewData = prepareChartData(metric, 10);
      
      return (
        <div className="bg-white dark:bg-[#151923] rounded-3xl p-6 shadow-sm border border-gray-200 dark:border-white/5 h-[500px] flex flex-col group relative">
            <div className="flex justify-between items-start mb-2">
                <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight flex items-center gap-2">
                        {title}
                        <span className="bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1">
                            <Database size={10} /> DB (Memory)
                        </span>
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                       Client-side aggregation (No SQL lag)
                    </p>
                </div>
                <button 
                    onClick={() => setExpandedChart(metric)}
                    className="p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                    title="Развернуть"
                >
                    <Maximize2 size={18} />
                </button>
            </div>
            
            <div className="flex-1 w-full min-h-0 relative">
                {loading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-black/50 backdrop-blur-sm z-10 text-sm text-indigo-500 font-bold gap-2">
                        <Loader2 className="animate-spin" /> Загрузка...
                    </div>
                )}
                {error && (
                    <div className="absolute inset-0 flex items-center justify-center text-red-500 text-xs p-4 text-center">
                        {error}
                    </div>
                )}
                {!loading && !error && (
                    <EChartComponent 
                        options={getOption(metric, previewData)} 
                        theme={isDarkMode ? 'dark' : 'light'} 
                        height="100%" 
                    />
                )}
            </div>
        </div>
      );
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
        {renderChartCard('elevators', 'Количество лифтов по литерам (DB)')}
        {renderChartCard('floors', 'Количество этажей по литерам (DB)')}
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
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        {expandedChart === 'elevators' ? 'Количество лифтов по литерам' : 'Количество этажей по литерам'}
                        <span className="bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm px-2 py-0.5 rounded flex items-center gap-1">
                            <Database size={14} /> Source: PostgreSQL
                        </span>
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
              <div className="flex-1 p-6 bg-white dark:bg-[#0b0f19] overflow-hidden relative">
                 {loading ? (
                    <div className="absolute inset-0 flex items-center justify-center text-indigo-500"><Loader2 className="animate-spin" /></div>
                 ) : (
                    <EChartComponent 
                        options={getOption(expandedChart, prepareChartData(expandedChart, 0))} 
                        theme={isDarkMode ? 'dark' : 'light'} 
                        height="100%" 
                    />
                 )}
              </div>
           </div>
        </div>
      )}
    </>
  );
};

export default ComplexComparisonsDB;
