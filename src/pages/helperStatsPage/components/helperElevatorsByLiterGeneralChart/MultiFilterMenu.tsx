
import React, { useState, useRef, useEffect } from 'react';
import { Filter, ChevronDown, ChevronRight, Check, X, Search } from 'lucide-react';
import { FilterState, FilterOptions } from './types';

interface MultiFilterMenuProps {
  filters: FilterState;
  onChange: (newFilters: FilterState) => void;
  options: FilterOptions;
}

const CATEGORIES: { key: keyof FilterState; label: string }[] = [
  { key: 'years', label: 'Год' },
  { key: 'cities', label: 'Город' },
  { key: 'jks', label: 'Жилой Комплекс' },
  { key: 'clients', label: 'Клиент' },
  { key: 'statuses', label: 'Статус сдачи' },
  { key: 'objectTypes', label: 'Тип объекта' },
];

const MultiFilterMenu: React.FC<MultiFilterMenuProps> = ({ filters, onChange, options }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<keyof FilterState | null>('years');
  const [searchTerm, setSearchTerm] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggleOption = (category: keyof FilterState, value: string) => {
    const currentValues = filters[category];
    let newValues: string[];

    if (currentValues.includes(value)) {
      newValues = currentValues.filter(v => v !== value);
    } else {
      newValues = [...currentValues, value];
    }

    onChange({ ...filters, [category]: newValues });
  };

  const handleClearCategory = (category: keyof FilterState) => {
    onChange({ ...filters, [category]: [] });
  };

  const handleSelectAllCategory = (category: keyof FilterState) => {
    // Select all available options for this category
    onChange({ ...filters, [category]: options[category] });
  };

  const getActiveCount = () => {
    return (Object.values(filters) as string[][]).reduce((acc, curr) => acc + curr.length, 0);
  };

  const activeCount = getActiveCount();

  return (
    <div className="relative z-50" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${
          activeCount > 0
            ? 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400'
            : 'bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/10'
        }`}
      >
        <Filter size={14} />
        <span>Фильтры</span>
        {activeCount > 0 && (
          <span className="bg-indigo-600 text-white text-[10px] px-1.5 rounded-full min-w-[18px] h-[18px] flex items-center justify-center">
            {activeCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-72 bg-white dark:bg-[#1e293b] rounded-xl shadow-2xl border border-gray-200 dark:border-white/10 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          
          {/* Header */}
          <div className="p-3 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-[#151923] flex justify-between items-center">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Параметры</span>
            {activeCount > 0 && (
              <button 
                onClick={() => onChange({ years: [], cities: [], jks: [], clients: [], statuses: [], objectTypes: [] })}
                className="text-[10px] text-red-500 hover:text-red-600 font-medium flex items-center gap-1"
              >
                <X size={10} /> Сбросить всё
              </button>
            )}
          </div>

          {/* Categories */}
          <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
            {CATEGORIES.map(({ key, label }) => {
              const isExpanded = expandedCategory === key;
              const selectedCount = filters[key].length;
              const availableOptions = options[key] || [];
              
              // Local search filtering
              const filteredOptions = availableOptions.filter(opt => 
                opt.toLowerCase().includes(searchTerm.toLowerCase())
              );

              return (
                <div key={key} className="border-b border-gray-100 dark:border-white/5 last:border-0">
                  <button
                    onClick={() => {
                        setExpandedCategory(isExpanded ? null : key);
                        setSearchTerm(''); // Reset search on change
                    }}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-left"
                  >
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{label}</span>
                        {selectedCount > 0 && (
                            <span className="text-[10px] bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded font-bold">
                                {selectedCount}
                            </span>
                        )}
                    </div>
                    {isExpanded ? <ChevronDown size={14} className="text-gray-400" /> : <ChevronRight size={14} className="text-gray-400" />}
                  </button>

                  {isExpanded && (
                    <div className="bg-gray-50/50 dark:bg-black/10 px-4 pb-3 pt-1">
                        {/* Search & Actions */}
                        <div className="flex gap-2 mb-2">
                            <div className="relative flex-1">
                                <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input 
                                    type="text" 
                                    placeholder="Поиск..." 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-7 pr-2 py-1 text-xs rounded border border-gray-200 dark:border-white/10 bg-white dark:bg-[#151923] text-gray-700 dark:text-gray-300 outline-none focus:border-indigo-500"
                                />
                            </div>
                            <button 
                                onClick={() => handleSelectAllCategory(key)}
                                className="text-[10px] text-indigo-500 hover:text-indigo-600 font-medium px-1"
                                title="Выбрать все"
                            >
                                Все
                            </button>
                            <button 
                                onClick={() => handleClearCategory(key)}
                                className="text-[10px] text-gray-400 hover:text-gray-500 font-medium px-1"
                                title="Сбросить"
                            >
                                Сбр.
                            </button>
                        </div>

                        {/* Options List */}
                        <div className="space-y-1 max-h-40 overflow-y-auto custom-scrollbar pr-1">
                            {filteredOptions.length > 0 ? filteredOptions.map(opt => {
                                const isSelected = filters[key].includes(opt);
                                return (
                                    <label key={opt} className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-white/5 p-1.5 rounded transition-colors group">
                                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'bg-white dark:bg-[#151923] border-gray-300 dark:border-gray-600 group-hover:border-indigo-400'}`}>
                                            {isSelected && <Check size={10} className="text-white" />}
                                        </div>
                                        <span className={`text-xs ${isSelected ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-600 dark:text-gray-400'}`}>
                                            {opt}
                                        </span>
                                        <input 
                                            type="checkbox" 
                                            className="hidden" 
                                            checked={isSelected} 
                                            onChange={() => handleToggleOption(key, opt)} 
                                        />
                                    </label>
                                );
                            }) : (
                                <div className="text-xs text-gray-400 italic text-center py-2">Ничего не найдено</div>
                            )}
                        </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiFilterMenu;
