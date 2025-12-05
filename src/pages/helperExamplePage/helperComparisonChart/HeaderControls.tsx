
import React from 'react';
import { ArrowRightLeft } from 'lucide-react';
import MultiFilterMenu from '../../helperStatsPage/components/helperElevatorsByLiterGeneralChart/MultiFilterMenu';
import { CATEGORIES } from './constants';
import { ComparisonCategory, ComparisonFilterState, ComparisonFilterOptions } from './types';

interface HeaderControlsProps {
  category: ComparisonCategory;
  setCategory: (c: ComparisonCategory) => void;
  filters: ComparisonFilterState;
  setFilters: (f: ComparisonFilterState) => void;
  filterOptions: ComparisonFilterOptions;
}

const HeaderControls: React.FC<HeaderControlsProps> = ({ 
  category, setCategory, filters, setFilters, filterOptions 
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
