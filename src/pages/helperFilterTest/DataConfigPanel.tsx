import React, { useState } from 'react';
import { Database, Filter, Plus, Trash2, ChevronDown, ChevronRight, TableProperties } from 'lucide-react';
import { ChartConfig, ChartFilter } from '../../types/chart';
import { SheetConfig } from '../../contexts/DataContext';

interface DataConfigPanelProps {
  config: ChartConfig;
  setConfig: (c: ChartConfig) => void;
  sheetConfigs: SheetConfig[];
  availableColumns: string[];
  rows?: any[][];
}

// Reusable collapsible section
const Section: React.FC<{
  title: string;
  icon: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  defaultOpen?: boolean;
}> = ({ title, icon, isOpen, onToggle, children }) => (
  <div className="border-b border-gray-100 dark:border-white/5 last:border-0">
    <button 
      onClick={onToggle}
      className="w-full flex items-center justify-between py-3 text-left group focus:outline-none"
    >
      <div className="flex items-center gap-2 text-xs font-bold uppercase text-gray-500 dark:text-gray-400 tracking-wider group-hover:text-indigo-500 transition-colors">
        {icon} {title}
      </div>
      <div className="text-gray-400 group-hover:text-indigo-500">
        {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
      </div>
    </button>
    {isOpen && <div className="pb-4 animate-in fade-in slide-in-from-top-2 duration-200">{children}</div>}
  </div>
);

const DataConfigPanel: React.FC<DataConfigPanelProps> = ({ 
  config, 
  setConfig, 
  sheetConfigs, 
  availableColumns,
  rows = []
}) => {
  const [openSections, setOpenSections] = useState({
    source: true,
    filters: true
  });

  const toggleSection = (key: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const updateConfig = (key: keyof ChartConfig, value: any) => {
    setConfig({ ...config, [key]: value });
  };

  const addFilter = () => {
    const newFilter: ChartFilter = {
      id: Math.random().toString(36).substr(2, 9),
      column: availableColumns[0] || '',
      operator: 'equals',
      value: ''
    };
    setConfig({ ...config, filters: [...config.filters, newFilter] });
  };

  const removeFilter = (id: string) => {
    setConfig({ ...config, filters: config.filters.filter(f => f.id !== id) });
  };

  const updateFilter = (id: string, field: keyof ChartFilter, value: any) => {
    const newFilters = config.filters.map(f => 
      f.id === id ? { ...f, [field]: value } : f
    );
    setConfig({ ...config, filters: newFilters });
  };

  const updateFilterColumn = (id: string, newColumn: string) => {
    const newFilters = config.filters.map(f => 
      f.id === id ? { ...f, column: newColumn, value: '' } : f
    );
    setConfig({ ...config, filters: newFilters });
  };

  // Helper to get unique values for a column
  const getUniqueValues = (columnName: string) => {
    if (!rows || rows.length === 0 || !columnName) return [];
    const colIndex = availableColumns.indexOf(columnName);
    if (colIndex === -1) return [];

    const values = new Set<string>();
    rows.forEach(row => {
      const val = row[colIndex];
      if (val !== undefined && val !== null && val !== '') {
        values.add(String(val));
      }
    });
    return Array.from(values).sort().slice(0, 100); // Limit to 100 for performance
  };

  const selectClassName = "w-full p-2.5 rounded-xl bg-gray-50 dark:bg-[#1e2433] border border-gray-200 dark:border-white/10 text-gray-800 dark:text-gray-200 text-sm font-medium focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all appearance-none hover:bg-white dark:hover:bg-[#252b3b]";

  return (
    <div className="h-full overflow-y-auto pr-2 custom-scrollbar">
      
      {/* Section 1: Data Source */}
      <Section 
        title="Источник и Группировка" 
        icon={<Database size={14} />}
        isOpen={openSections.source}
        onToggle={() => toggleSection('source')}
      >
        <div className="space-y-4">
            {/* Sheet Select */}
            <div>
                <span className="text-xs text-gray-500 dark:text-gray-400 mb-1 block ml-1">Таблица (Sheet)</span>
                <select
                    value={config.sheetKey}
                    onChange={(e) => updateConfig('sheetKey', e.target.value)}
                    className={selectClassName}
                >
                    <option value="" className="dark:bg-[#1e2433]">Выберите таблицу</option>
                    {sheetConfigs.map(c => (
                    <option key={c.key} value={c.key} className="dark:bg-[#1e2433]">{c.sheetName}</option>
                    ))}
                </select>
            </div>

            {/* Group By (X Axis) */}
            <div>
                <span className="text-xs text-gray-500 dark:text-gray-400 mb-1 block ml-1">Группировка по (Key/Name)</span>
                <select
                    value={config.xAxisColumn}
                    onChange={(e) => updateConfig('xAxisColumn', e.target.value)}
                    className={selectClassName}
                >
                    <option value="" className="dark:bg-[#1e2433]">Без группировки (все строки)</option>
                    {availableColumns.map(c => <option key={c} value={c} className="dark:bg-[#1e2433]">{c}</option>)}
                </select>
            </div>

            {/* Value Column (Y Axis) */}
            <div>
                <span className="text-xs text-gray-500 dark:text-gray-400 mb-1 block ml-1">Столбец значений (Value)</span>
                <select
                    value={config.yAxisColumn}
                    onChange={(e) => updateConfig('yAxisColumn', e.target.value)}
                    className={selectClassName}
                >
                    <option value="" className="dark:bg-[#1e2433]">Не выбрано</option>
                    {availableColumns.map(c => <option key={c} value={c} className="dark:bg-[#1e2433]">{c}</option>)}
                </select>
            </div>

            {/* Aggregation */}
            <div>
                <span className="text-xs text-gray-500 dark:text-gray-400 mb-1 block ml-1">Метод агрегации</span>
                <select
                    value={config.aggregation}
                    onChange={(e) => updateConfig('aggregation', e.target.value)}
                    className={selectClassName}
                >
                    <option value="sum">Сумма (Sum)</option>
                    <option value="count">Количество (Count)</option>
                    <option value="average">Среднее (Avg)</option>
                    <option value="max">Максимум (Max)</option>
                    <option value="min">Минимум (Min)</option>
                </select>
            </div>
        </div>
      </Section>

      {/* Section 2: Filters */}
      <Section 
        title="Фильтрация данных" 
        icon={<Filter size={14} />}
        isOpen={openSections.filters}
        onToggle={() => toggleSection('filters')}
      >
         <div className="space-y-3">
            <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Активные фильтры</span>
                <button 
                    onClick={addFilter}
                    className="p-1.5 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 rounded-lg text-indigo-600 dark:text-indigo-400 transition-colors flex items-center gap-1 text-xs font-bold"
                >
                    <Plus size={12} /> Добавить
                </button>
            </div>

            {config.filters.length === 0 && (
                <div className="text-center py-6 border border-dashed border-gray-200 dark:border-white/10 rounded-xl">
                    <Filter size={20} className="mx-auto text-gray-300 dark:text-gray-600 mb-1" />
                    <p className="text-xs text-gray-400">Фильтры не заданы</p>
                </div>
            )}

            <div className="space-y-2">
            {config.filters.map((filter) => {
                const uniqueValues = getUniqueValues(filter.column);
                return (
                <div key={filter.id} className="bg-gray-50 dark:bg-[#1e2433] p-3 rounded-xl border border-gray-200 dark:border-white/5 flex flex-col gap-2 group relative">
                    
                    <button 
                        onClick={() => removeFilter(filter.id)} 
                        className="absolute top-2 right-2 text-gray-300 hover:text-red-500 transition-colors"
                    >
                        <Trash2 size={14} />
                    </button>

                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] uppercase text-gray-400 font-bold">Столбец</label>
                        <select
                            value={filter.column}
                            onChange={(e) => updateFilterColumn(filter.id, e.target.value)}
                            className={`${selectClassName} text-xs py-1.5 h-8`}
                        >
                            {availableColumns.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    
                    <div className="flex gap-2">
                        <div className="w-1/3">
                             <select
                                value={filter.operator}
                                onChange={(e) => updateFilter(filter.id, 'operator', e.target.value)}
                                className={`${selectClassName} text-xs py-1.5 h-8`}
                            >
                                <option value="equals">=</option>
                                <option value="contains">In</option>
                                <option value="greater">&gt;</option>
                                <option value="less">&lt;</option>
                            </select>
                        </div>
                        
                        <div className="w-2/3">
                            {uniqueValues.length > 0 ? (
                                <select
                                value={filter.value}
                                onChange={(e) => updateFilter(filter.id, 'value', e.target.value)}
                                className={`${selectClassName} text-xs py-1.5 h-8`}
                                >
                                <option value="">Значение...</option>
                                {uniqueValues.map(val => (
                                    <option key={val} value={val}>{val}</option>
                                ))}
                                </select>
                            ) : (
                                <input
                                type="text"
                                value={filter.value}
                                onChange={(e) => updateFilter(filter.id, 'value', e.target.value)}
                                placeholder="Значение"
                                className={`${selectClassName} text-xs py-1.5 h-8`}
                                />
                            )}
                        </div>
                    </div>
                </div>
                );
            })}
            </div>
         </div>
      </Section>

    </div>
  );
};

export default DataConfigPanel;