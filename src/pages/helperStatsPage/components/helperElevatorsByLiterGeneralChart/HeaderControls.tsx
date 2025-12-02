
import React from 'react';
import { BarChart2, PieChart, Palette, CheckCircle2, Home, ChevronRight as ChevronRightIcon } from 'lucide-react';
import { ChartType, ColorMode } from './types';

interface HeaderControlsProps {
  colorMode: ColorMode;
  setColorMode: (mode: ColorMode) => void;
  chartType: ChartType;
  setChartType: (type: ChartType) => void;
  selectedYear: string;
  setSelectedYear: (year: string) => void;
  years: string[];
  breadcrumbs: string[];
  onResetZoom: () => void;
}

const HeaderControls: React.FC<HeaderControlsProps> = ({
  colorMode,
  setColorMode,
  chartType,
  setChartType,
  selectedYear,
  setSelectedYear,
  years,
  breadcrumbs,
  onResetZoom
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
      <div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
          Количество лифтов по городам / ЖК / литерам
          {colorMode === 'status' && (
            <span className="text-emerald-500 ml-2">(Статус сдачи)</span>
          )}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          Sunburst: Город → ЖК → Литер.
          {' '}
          {colorMode === 'status'
            ? 'Цвет: Зеленый (Сдан) / Красный (В работе)'
            : 'Цвет: группировка по ЖК.'}
        </p>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        
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

        {/* Year Filter */}
        <div className="flex items-center bg-gray-100 dark:bg-white/5 rounded-lg px-2 py-1 border border-gray-200 dark:border-white/10">
          <span className="text-xs text-gray-500 dark:text-gray-400 mr-2">Год:</span>
          <select
            className="bg-transparent text-xs text-gray-700 dark:text-gray-100 outline-none cursor-pointer"
            value={selectedYear}
            onChange={e => setSelectedYear(e.target.value)}
          >
            {years.map(y => (
              <option key={y} value={y} className="bg-white dark:bg-[#151923]">
                {y}
              </option>
            ))}
          </select>
        </div>

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
            Сдан да/нет
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
            Sunburst
          </button>
        </div>
      </div>
    </div>
  );
};

export default HeaderControls;
