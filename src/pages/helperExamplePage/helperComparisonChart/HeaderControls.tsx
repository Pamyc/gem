import React, { useState, useRef, useEffect } from 'react';
import { ArrowRightLeft, SlidersHorizontal, Check, Square } from 'lucide-react';
import MultiFilterMenu from '../../helperStatsPage/components/helperElevatorsByLiterGeneralChart/MultiFilterMenu';
import { CATEGORIES, METRICS } from './constants';
import { ComparisonCategory, ComparisonFilterState, ComparisonFilterOptions } from './types';

interface HeaderControlsProps {
  category: ComparisonCategory;
  setCategory: (c: ComparisonCategory) => void;
  filters: ComparisonFilterState;
  setFilters: (f: ComparisonFilterState) => void;
  filterOptions: ComparisonFilterOptions;
  visibleMetrics: string[];
  setVisibleMetrics: (metrics: string[]) => void;
}

const MetricSelector: React.FC<{
  visibleMetrics: string[];
  onChange: (metrics: string[]) => void;
}> = ({ visibleMetrics, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleMetric = (key: string) => {
    if (visibleMetrics.includes(key)) {
      onChange(visibleMetrics.filter(k => k !== key));
    } else {
      onChange([...visibleMetrics, key]);
    }
  };

  const toggleAll = () => {
    if (visibleMetrics.length === METRICS.length) {
      onChange([]);
    } else {
      onChange(METRICS.map(m => m.key));
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all bg-white dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10"
      >
        <SlidersHorizontal size={14} />
        <span>Показатели</span>
        {visibleMetrics.length < METRICS.length && (
          <span className="bg-indigo-600 text-white text-[10px] px-1.5 rounded-full">
            {visibleMetrics.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-[#1e293b] rounded-xl shadow-xl border border-gray-200 dark:border-white/10 z-50 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[400px]">
          <div className="p-3 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-gray-50 dark:bg-black/20">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Метрики</span>
            <button 
              onClick={toggleAll}
              className="text-[10px] text-indigo-500 hover:text-indigo-600 font-bold"
            >
              {visibleMetrics.length === METRICS.length ? 'Скрыть все' : 'Показать все'}
            </button>
          </div>
          <div className="overflow-y-auto custom-scrollbar p-1">
            {METRICS.map(m => {
              const isSelected = visibleMetrics.includes(m.key);
              return (
                <div 
                  key={m.key} 
                  onClick={() => toggleMetric(m.key)}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer rounded-lg transition-colors"
                >
                  <div className={`w-4 h-4 flex items-center justify-center rounded border ${isSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-gray-300 dark:border-gray-600'}`}>
                    {isSelected && <Check size={10} />}
                  </div>
                  <span className={`text-xs ${isSelected ? 'font-bold text-gray-800 dark:text-gray-200' : 'text-gray-500 dark:text-gray-400'}`}>
                    {m.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

const HeaderControls: React.FC<HeaderControlsProps> = ({ 
  category, setCategory, filters, setFilters, filterOptions, visibleMetrics, setVisibleMetrics
}) => {
  return (
    <div className="p-6 border-b border-gray-200 dark:border-white/5 flex flex-wrap gap-4 items-center justify-between bg-gray-50/50 dark:bg-[#1e293b]/50">
        <div className="flex items-center gap-4">
            <div className="p-2.5 bg-indigo-100 dark:bg-indigo-500/20 rounded-xl text-indigo-600 dark:text-indigo-400">
                <ArrowRightLeft size={20} />
            </div>
            <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Сравнение показателей</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Выберите категорию и два объекта</p>
            </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
            {/* Category Selector */}
            <div className="flex bg-white dark:bg-black/20 rounded-xl p-1 border border-gray-200 dark:border-white/10">
                {CATEGORIES.map(cat => {
                    const Icon = cat.icon;
                    const isActive = category === cat.value;
                    return (
                        <button
                            key={cat.value}
                            onClick={() => setCategory(cat.value)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                isActive 
                                ? 'bg-indigo-600 text-white shadow-md' 
                                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                            }`}
                        >
                            <Icon size={14} />
                            <span className="hidden sm:inline">{cat.label}</span>
                        </button>
                    )
                })}
            </div>

            {/* Metric Selector */}
            <MetricSelector visibleMetrics={visibleMetrics} onChange={setVisibleMetrics} />

            {/* Filters */}
            <MultiFilterMenu 
                filters={filters}
                onChange={setFilters}
                options={filterOptions}
            />
        </div>
    </div>
  );
};

export default HeaderControls;