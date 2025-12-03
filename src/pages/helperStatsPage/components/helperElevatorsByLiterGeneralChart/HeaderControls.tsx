
import React from 'react';
import { BarChart2, PieChart, Palette, CheckCircle2, Home, ChevronRight as ChevronRightIcon, TrendingUp } from 'lucide-react';
import { ChartType, ColorMode, MetricKey, METRIC_OPTIONS, FilterState, FilterOptions } from './types';
import MultiFilterMenu from './MultiFilterMenu';

interface HeaderControlsProps {
  colorMode: ColorMode;
  setColorMode: (mode: ColorMode) => void;
  chartType: ChartType;
  setChartType: (type: ChartType) => void;
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
  filterOptions: FilterOptions;
  breadcrumbs: string[];
  onResetZoom: () => void;
  activeMetric: MetricKey;
  setActiveMetric: (metric: MetricKey) => void;
}

const HeaderControls: React.FC<HeaderControlsProps> = ({
  colorMode,
  setColorMode,
  chartType,
  setChartType,
  filters,
  setFilters,
  filterOptions,
  breadcrumbs,
  onResetZoom,
  activeMetric,
  setActiveMetric
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
      <div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight flex items-center gap-2">
          {breadcrumbs.length > 0 ? (
             <span className="text-indigo-500">{breadcrumbs[breadcrumbs.length - 1]}</span>
          ) : (
             "Общая статистика"
          )}
          {colorMode === 'status' && (
            <span className="text-emerald-500 text-sm font-normal">(Статус сдачи)</span>
          )}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          Sunburst: Город → ЖК → Литер.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        
        {/* Metric Selector */}
        <div className="flex items-center bg-indigo-50 dark:bg-indigo-500/10 rounded-lg px-2 py-1 border border-indigo-100 dark:border-indigo-500/20">
           <TrendingUp size={14} className="text-indigo-600 dark:text-indigo-400 mr-2" />
           <select
            className="bg-transparent text-xs font-bold text-indigo-700 dark:text-indigo-300 outline-none cursor-pointer min-w-[120px] max-w-[180px]"
            value={activeMetric}
            onChange={e => setActiveMetric(e.target.value as MetricKey)}
          >
            {METRIC_OPTIONS.map(m => (
              <option key={m.key} value={m.key} className="bg-white dark:bg-[#151923] text-gray-900 dark:text-white">
                {m.label}
              </option>
            ))}
          </select>
        </div>

        {/* Breadcrumbs */}
        {chartType === 'sunburst' && (
          <div className="flex items-center gap-1 text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-white/5 px-2 py-1.5 rounded-lg border border-gray-200 dark:border-white/10">
              <button onClick={onResetZoom} className="hover:text-indigo-500 transition-colors">
                 <Home size={12} className={breadcrumbs.length === 0 ? "text-indigo-500" : "text-gray-400"} />
              </button>
              {breadcrumbs.length === 0 ? (
                  <span className="ml-1">Все города</span>
              ) : (
                  <>
                      {breadcrumbs.map((crumb, idx) => (
                          <React.Fragment key={idx}>
                              <ChevronRightIcon size={12} className="text-gray-300" />
                              <span className="whitespace-nowrap max-w-[150px] truncate">{crumb}</span>
                          </React.Fragment>
                      ))}
                  </>
              )}
          </div>
        )}

        {/* Multi Filter Menu (Replaces simple Year selector) */}
        <MultiFilterMenu 
            filters={filters} 
            onChange={setFilters} 
            options={filterOptions} 
        />

        {/* Color Mode */}
        <div className="flex bg-gray-100 dark:bg-white/5 rounded-lg p-1 gap-1 border border-gray-200 dark:border-white/10">
          <button
            onClick={() => setColorMode('jk')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
              colorMode === 'jk'
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
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
              colorMode === 'status'
                ? 'bg-white dark:bg-[#1e2433] text-emerald-500 shadow-sm'
                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
            }`}
            title="Цвет по статусу сдачи"
          >
            <CheckCircle2 size={14} />
            Сдан
          </button>
        </div>

        {/* Chart Type */}
        <div className="flex bg-gray-100 dark:bg-white/5 rounded-lg p-1 gap-1 border border-gray-200 dark:border-white/10">
          <button
            onClick={() => setChartType('bar')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
              chartType === 'bar'
                ? 'bg-white dark:bg-[#1e2433] text-indigo-500 shadow-sm'
                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
            }`}
          >
            <BarChart2 size={14} />
            Bar
          </button>
          <button
            onClick={() => setChartType('sunburst')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
              chartType === 'sunburst'
                ? 'bg-white dark:bg-[#1e2433] text-indigo-500 shadow-sm'
                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
            }`}
          >
            <PieChart size={14} />
            Sun
          </button>
        </div>
      </div>
    </div>
  );
};

export default HeaderControls;
