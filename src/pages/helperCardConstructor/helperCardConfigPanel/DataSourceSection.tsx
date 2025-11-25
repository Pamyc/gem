import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { CardConfig } from '../../../types/card';
import { SheetConfig } from '../../../contexts/DataContext';
import { ChartFilter } from '../../../types/chart';
import { selectClass, filterInputClass } from './styles';

interface DataSourceSectionProps {
  config: CardConfig;
  setConfig: (c: CardConfig) => void;
  sheetConfigs: SheetConfig[];
  availableColumns: string[];
  rows: any[][];
}

const DataSourceSection: React.FC<DataSourceSectionProps> = ({ 
  config, 
  setConfig, 
  sheetConfigs, 
  availableColumns, 
  rows 
}) => {
  const update = (key: keyof CardConfig, value: any) => {
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

  const getUniqueValues = (columnName: string) => {
    if (!rows || rows.length === 0 || !columnName) return [];
    const colIndex = availableColumns.indexOf(columnName);
    if (colIndex === -1) return [];
    const values = new Set<string>();
    rows.forEach(row => {
      const val = row[colIndex];
      if (val !== undefined && val !== null && val !== '') values.add(String(val));
    });
    return Array.from(values).sort().slice(0, 200);
  };

  return (
    <>
      <div className="space-y-3">
        <div>
          <span className="text-xs text-gray-400 mb-1 block ml-1">Таблица</span>
          <select
            value={config.sheetKey}
            onChange={(e) => update('sheetKey', e.target.value)}
            className={selectClass}
          >
            <option value="" disabled>Выберите таблицу...</option>
            {sheetConfigs.map(c => (
              <option key={c.key} value={c.key}>{c.sheetName}</option>
            ))}
          </select>
        </div>

        <div>
          <span className="text-xs text-gray-400 mb-1 block ml-1">Столбец значений</span>
          <select
            value={config.dataColumn}
            onChange={(e) => update('dataColumn', e.target.value)}
            className={selectClass}
            disabled={!config.sheetKey}
          >
            <option value="">Не выбрано</option>
            {availableColumns.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div>
          <span className="text-xs text-gray-400 mb-1 block ml-1">Агрегация</span>
          <select
            value={config.aggregation}
            onChange={(e) => update('aggregation', e.target.value)}
            className={selectClass}
          >
            <option value="sum">Сумма (Sum)</option>
            <option value="count">Количество (Count)</option>
            <option value="unique">Уникальные (Unique)</option>
            <option value="average">Среднее (Avg)</option>
            <option value="max">Максимум (Max)</option>
            <option value="min">Минимум (Min)</option>
          </select>
        </div>
      </div>

      <div className="space-y-3 pt-3 border-t border-gray-100 dark:border-white/5 mt-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Фильтры</span>
          <button 
            onClick={addFilter}
            className="p-1.5 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 rounded-lg text-indigo-600 dark:text-indigo-400 transition-colors flex items-center gap-1 text-[10px] font-bold uppercase"
            title="Добавить фильтр"
          >
            <Plus size={12} /> Добавить
          </button>
        </div>

        {config.filters.length === 0 && (
          <div className="text-center py-4 border border-dashed border-gray-200 dark:border-white/10 rounded-xl bg-gray-50/50 dark:bg-[#1e2433]/50">
            <p className="text-[10px] text-gray-400 italic">Нет активных фильтров</p>
          </div>
        )}

        <div className="space-y-3">
          {config.filters.map((filter) => {
            const uniqueValues = getUniqueValues(filter.column);
            return (
              <div key={filter.id} className="bg-gray-100 dark:bg-[#1e2433] p-3 rounded-xl border border-gray-200 dark:border-white/5 flex flex-col gap-3 shadow-sm relative group">
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
                    className={filterInputClass}
                  >
                    {availableColumns.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                
                <div className="flex gap-2">
                  <div className="w-1/3">
                    <select
                      value={filter.operator}
                      onChange={(e) => updateFilter(filter.id, 'operator', e.target.value)}
                      className={filterInputClass}
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
                        className={filterInputClass}
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
                        className={filterInputClass}
                      />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default DataSourceSection;
