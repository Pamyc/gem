import React, { useMemo } from 'react';
import { Plus, Trash2, Filter, BarChart, TrendingUp, Layers } from 'lucide-react';
import { ChartConfig, ChartFilter } from '../../types/chart';
import { SheetConfig } from '../../contexts/DataContext';

interface ConfigPanelProps {
  config: ChartConfig;
  setConfig: (c: ChartConfig) => void;
  sheetConfigs: SheetConfig[];
  availableColumns: string[];
  rows?: any[][]; // Данные для генерации списков фильтрации
}

const ConfigPanel: React.FC<ConfigPanelProps> = ({ config, setConfig, sheetConfigs, availableColumns, rows = [] }) => {

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

  // Fix: Atomically update column and reset value to avoid closure staleness issues
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
    return Array.from(values).sort();
  };

  // Общий стиль для селектов
  const selectClassName = "w-full p-2.5 rounded-xl bg-gray-50 dark:bg-[#1e2433] border border-gray-200 dark:border-white/10 text-gray-800 dark:text-gray-200 text-sm font-medium focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all appearance-none hover:bg-white dark:hover:bg-[#252b3b]";

  return (
    <div className="space-y-6 h-full overflow-y-auto pr-2 custom-scrollbar">
      
      {/* Data Source */}
      <div className="space-y-3">
        <label className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400 tracking-wider flex items-center gap-2">
          <Layers size={14} /> Источник
        </label>
        <div className="relative">
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
      </div>

      {/* Axes Configuration */}
      <div className="space-y-4">
         <label className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400 tracking-wider flex items-center gap-2">
          <BarChart size={14} /> Оси и Данные
        </label>
        
        <div className="grid grid-cols-1 gap-3">
          <div>
            <span className="text-xs text-gray-500 dark:text-gray-400 mb-1 block ml-1">Ось X (Категории/Дата)</span>
            <select
              value={config.xAxisColumn}
              onChange={(e) => updateConfig('xAxisColumn', e.target.value)}
              className={selectClassName}
            >
              <option value="" className="dark:bg-[#1e2433]">Не выбрано</option>
              {availableColumns.map(c => <option key={c} value={c} className="dark:bg-[#1e2433]">{c}</option>)}
            </select>
          </div>

          <div>
            <span className="text-xs text-gray-500 dark:text-gray-400 mb-1 block ml-1">Ось Y (Значения)</span>
            <select
              value={config.yAxisColumn}
              onChange={(e) => updateConfig('yAxisColumn', e.target.value)}
              className={selectClassName}
            >
              <option value="" className="dark:bg-[#1e2433]">Не выбрано</option>
              {availableColumns.map(c => <option key={c} value={c} className="dark:bg-[#1e2433]">{c}</option>)}
            </select>
          </div>

          <div>
            <span className="text-xs text-gray-500 dark:text-gray-400 mb-1 block ml-1">Разбивка (Серии)</span>
            <select
              value={config.segmentColumn}
              onChange={(e) => updateConfig('segmentColumn', e.target.value)}
              className={selectClassName}
            >
              <option value="" className="dark:bg-[#1e2433]">Без разбивки</option>
              {availableColumns.map(c => <option key={c} value={c} className="dark:bg-[#1e2433]">{c}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Aggregation Settings */}
      <div className="space-y-3">
        <label className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400 tracking-wider flex items-center gap-2">
          <TrendingUp size={14} /> Обработка
        </label>
        
        <div className="flex gap-2">
           <select
              value={config.aggregation}
              onChange={(e) => updateConfig('aggregation', e.target.value)}
              className={selectClassName}
            >
              <option value="sum" className="dark:bg-[#1e2433]">Сумма</option>
              <option value="count" className="dark:bg-[#1e2433]">Количество</option>
              <option value="average" className="dark:bg-[#1e2433]">Среднее</option>
              <option value="max" className="dark:bg-[#1e2433]">Максимум</option>
              <option value="min" className="dark:bg-[#1e2433]">Минимум</option>
            </select>
            
            <select
              value={config.chartType}
              onChange={(e) => updateConfig('chartType', e.target.value)}
              className={selectClassName}
            >
              <option value="line" className="dark:bg-[#1e2433]">Линия</option>
              <option value="bar" className="dark:bg-[#1e2433]">Столбцы</option>
              <option value="area" className="dark:bg-[#1e2433]">Область</option>
            </select>
        </div>

        <div className="flex flex-col gap-2 mt-2">
          <div className="flex items-center gap-2">
            <input 
              type="checkbox" 
              id="cumulative"
              checked={config.isCumulative} 
              onChange={(e) => updateConfig('isCumulative', e.target.checked)}
              className="w-4 h-4 rounded bg-gray-100 dark:bg-[#1e2433] border-gray-300 dark:border-white/20 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0"
            />
            <label htmlFor="cumulative" className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer select-none">
              Кумулятивный итог
            </label>
          </div>

          <div className="flex items-center gap-2">
            <input 
              type="checkbox" 
              id="dataZoom"
              checked={config.showDataZoomSlider !== false} // Default to true
              onChange={(e) => updateConfig('showDataZoomSlider', e.target.checked)}
              className="w-4 h-4 rounded bg-gray-100 dark:bg-[#1e2433] border-gray-300 dark:border-white/20 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0"
            />
            <label htmlFor="dataZoom" className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer select-none">
              Слайдер зума
            </label>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-3 pt-2 border-t border-gray-200 dark:border-white/5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400 tracking-wider flex items-center gap-2">
            <Filter size={14} /> Фильтры
          </label>
          <button 
            onClick={addFilter}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg text-indigo-500 transition-colors"
            title="Добавить фильтр"
          >
            <Plus size={16} />
          </button>
        </div>

        {config.filters.length === 0 && (
            <p className="text-xs text-gray-400 italic">Нет активных фильтров</p>
        )}

        <div className="space-y-3">
          {config.filters.map((filter) => {
            const uniqueValues = getUniqueValues(filter.column);
            
            return (
              <div key={filter.id} className="bg-gray-50 dark:bg-[#1e2433] p-3 rounded-xl border border-gray-200 dark:border-white/5 flex flex-col gap-2 group hover:border-indigo-500/30 transition-colors">
                <div className="flex gap-2">
                   <select
                      value={filter.column}
                      onChange={(e) => updateFilterColumn(filter.id, e.target.value)}
                      className="w-1/2 p-1.5 text-xs rounded-lg bg-white dark:bg-[#151923] border border-gray-200 dark:border-white/10 outline-none focus:border-indigo-500"
                    >
                      {availableColumns.map(c => <option key={c} value={c} className="dark:bg-[#1e2433]">{c}</option>)}
                    </select>
                    <select
                      value={filter.operator}
                      onChange={(e) => updateFilter(filter.id, 'operator', e.target.value)}
                      className="w-1/2 p-1.5 text-xs rounded-lg bg-white dark:bg-[#151923] border border-gray-200 dark:border-white/10 outline-none focus:border-indigo-500"
                    >
                      <option value="equals" className="dark:bg-[#1e2433]">Равно (=)</option>
                      <option value="contains" className="dark:bg-[#1e2433]">Содержит</option>
                      <option value="greater" className="dark:bg-[#1e2433]">Больше (&gt;)</option>
                      <option value="less" className="dark:bg-[#1e2433]">Меньше (&lt;)</option>
                    </select>
                    <button onClick={() => removeFilter(filter.id)} className="text-gray-400 hover:text-red-500 p-0.5">
                      <Trash2 size={14} />
                    </button>
                </div>
                
                {uniqueValues.length > 0 && uniqueValues.length < 200 ? (
                  <select
                    value={filter.value}
                    onChange={(e) => updateFilter(filter.id, 'value', e.target.value)}
                    className="w-full p-2 text-xs rounded-lg bg-white dark:bg-[#151923] border border-gray-200 dark:border-white/10 outline-none focus:border-indigo-500 appearance-none"
                  >
                    <option value="" className="dark:bg-[#1e2433]">Выберите значение...</option>
                    {uniqueValues.map(val => (
                      <option key={val} value={val} className="dark:bg-[#1e2433]">{val}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={filter.value}
                    onChange={(e) => updateFilter(filter.id, 'value', e.target.value)}
                    placeholder="Значение..."
                    className="w-full p-2 text-xs rounded-lg bg-white dark:bg-[#151923] border border-gray-200 dark:border-white/10 outline-none focus:border-indigo-500 placeholder-gray-500"
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};

export default ConfigPanel;