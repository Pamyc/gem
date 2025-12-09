
import React, { useRef, useState } from 'react';
import EChartComponent, { EChartInstance } from '../../../components/charts/EChartComponent';
import { useDataStore } from '../../../contexts/DataContext';
import { Loader2, Eye, EyeOff, Layers, CheckCircle2, Clock, Building, Briefcase, Calendar } from 'lucide-react';
import { useFinanceData } from './helperStackedBarFinanceChart/useFinanceData';
import { useChartOptions } from './helperStackedBarFinanceChart/useChartOptions';
import { useChartInteractions } from './helperStackedBarFinanceChart/useChartInteractions';

interface StackedBarFinanceChartProps {
  isDarkMode: boolean;
  selectedCity: string;
  selectedYear?: string; // Prop from parent (optional, maybe unused if we have local filter)
  selectedRegion?: string;
}

type StatusFilter = 'all' | 'yes' | 'no';
type GroupingMode = 'jk' | 'client';

const StackedBarFinanceChart: React.FC<StackedBarFinanceChartProps> = ({ isDarkMode, selectedCity, selectedRegion }) => {
  const { isLoading } = useDataStore();
  const chartRef = useRef<EChartInstance>(null);

  // --- States ---
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [groupingMode, setGroupingMode] = useState<GroupingMode>('jk');
  const [localYear, setLocalYear] = useState<string>(''); // Local year filter for this specific chart
  
  const [visibleMetrics, setVisibleMetrics] = useState({
    income: true,
    expense: true
  });

  const toggleMetric = (key: 'income' | 'expense') => {
    setVisibleMetrics(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // 1. Get processed data with filtering
  const data = useFinanceData(selectedCity, statusFilter, groupingMode, localYear, selectedRegion);

  // 2. Generate chart options (passing visibility state and grouping mode for tooltip)
  const option = useChartOptions(isDarkMode, data, visibleMetrics, groupingMode);

  // 3. Handle interactions (highlighting)
  useChartInteractions(chartRef, option);

  const titleSuffix = groupingMode === 'jk' ? '(с детализацией по ЖК)' : '(с детализацией по Заказчикам)';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <Loader2 className="animate-spin text-indigo-500" size={32} />
      </div>
    );
  }

  if (!option) {
    return (
      <div className="flex items-center justify-center h-[600px] text-gray-400">
        Данные не найдены
      </div>
    );
  }

  return (
    <div className="w-full h-[800px] flex flex-col relative">
      {/* Header Controls */}
      <div className="flex flex-wrap items-center justify-between mb-4 gap-4">
        
        {/* Title Left */}
        <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
          Структура доходов и расходов по годам <span className="text-gray-500 dark:text-gray-400 font-normal text-sm block sm:inline">{titleSuffix}</span>
        </h3>
        
        <div className="flex flex-wrap items-center gap-4">
            
            {/* 1. Grouping Toggle (JK vs Client) */}
            <div className="flex bg-gray-100 dark:bg-white/5 rounded-lg p-1 gap-1 border border-gray-200 dark:border-white/10">
                <button
                  onClick={() => setGroupingMode('jk')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                    groupingMode === 'jk'
                      ? 'bg-white dark:bg-[#1e2433] text-indigo-600 dark:text-indigo-400 shadow-sm'
                      : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                  }`}
                  title="По ЖК"
                >
                  <Building size={14} />
                  ЖК
                </button>
                <button
                  onClick={() => setGroupingMode('client')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                    groupingMode === 'client'
                      ? 'bg-white dark:bg-[#1e2433] text-indigo-600 dark:text-indigo-400 shadow-sm'
                      : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                  }`}
                  title="По Заказчикам"
                >
                  <Briefcase size={14} />
                  Заказчик
                </button>
            </div>

            {/* 2. Status Filter */}
            <div className="flex bg-gray-100 dark:bg-white/5 rounded-lg p-1 gap-1 border border-gray-200 dark:border-white/10">
                <button 
                    onClick={() => setStatusFilter('all')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                    statusFilter === 'all' 
                        ? 'bg-white dark:bg-[#1e2433] text-gray-800 dark:text-white shadow-sm' 
                        : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                    }`}
                >
                    <Layers size={14} />
                    Все
                </button>
                <button 
                    onClick={() => setStatusFilter('yes')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                    statusFilter === 'yes' 
                        ? 'bg-white dark:bg-[#1e2433] text-emerald-500 shadow-sm' 
                        : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                    }`}
                >
                    <CheckCircle2 size={14} />
                    Сданы
                </button>
                <button 
                    onClick={() => setStatusFilter('no')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                    statusFilter === 'no' 
                        ? 'bg-white dark:bg-[#1e2433] text-orange-500 shadow-sm' 
                        : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                    }`}
                >
                    <Clock size={14} />
                    В работе
                </button>
            </div>

            {/* 3. Year Filter */}
            <div className="flex items-center bg-gray-100 dark:bg-white/5 rounded-lg px-2 py-1 border border-gray-200 dark:border-white/10">
                <Calendar size={14} className="text-gray-500 dark:text-gray-400 mr-2" />
                <select
                    value={localYear}
                    onChange={(e) => setLocalYear(e.target.value)}
                    className="bg-transparent text-xs font-bold text-gray-700 dark:text-gray-300 outline-none cursor-pointer min-w-[80px]"
                >
                    <option value="" className="bg-white dark:bg-[#1e293b]">Все года</option>
                    {data?.availableYears.map(year => (
                        <option key={year} value={year} className="bg-white dark:bg-[#1e293b]">
                            {year}
                        </option>
                    ))}
                </select>
            </div>

            {/* 4. Metric Toggles */}
            <div className="flex bg-gray-100 dark:bg-white/5 rounded-lg p-1 gap-1 border border-gray-200 dark:border-white/10">
                <button
                  onClick={() => toggleMetric('income')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                    visibleMetrics.income
                      ? 'bg-white dark:bg-[#1e2433] text-emerald-500 shadow-sm'
                      : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                  }`}
                >
                  {visibleMetrics.income ? <Eye size={14} /> : <EyeOff size={14} />}
                  Доходы факт.
                </button>
                <button
                  onClick={() => toggleMetric('expense')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                    visibleMetrics.expense
                      ? 'bg-white dark:bg-[#1e2433] text-rose-500 shadow-sm'
                      : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                  }`}
                >
                  {visibleMetrics.expense ? <Eye size={14} /> : <EyeOff size={14} />}
                  Расходы факт.
                </button>
            </div>
        </div>
      </div>

      <div className="flex-1 w-full min-h-0">
        <EChartComponent
          ref={chartRef}
          options={option}
          theme={isDarkMode ? 'dark' : 'light'}
          height="100%"
        />
      </div>
    </div>
  );
};

export default StackedBarFinanceChart;
