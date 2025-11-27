
import React, { useMemo, useState } from 'react';
import { Database, Plus, Trash2, Calculator, ArrowLeft } from 'lucide-react';
import { CardElement, ElementDataSettings, CardVariable } from '../../../types/card';
import { ChartFilter } from '../../../types/chart';
import { SheetConfig } from '../../../contexts/DataContext';
import { getMergedHeaders } from '../../../utils/chartUtils';
import { labelClass, selectClass, filterInputClass } from './styles';
import CalculatedFieldsEditor from '../helperCardConfigPanel/VariablesSection';

interface DataConfigSectionProps {
  element: CardElement;
  onUpdate: (updates: Partial<CardElement>) => void;
  googleSheets: any;
  sheetConfigs: SheetConfig[];
  globalSheetKey: string;
}

const DataConfigSection: React.FC<DataConfigSectionProps> = ({
  element,
  onUpdate,
  googleSheets,
  sheetConfigs,
  globalSheetKey
}) => {
  // Resolve Effective Data Context
  const effectiveSheetKey = element.dataSettings?.sheetKey || globalSheetKey;
  
  // Check if we are in formula mode
  const hasFormula = !!(element.dataSettings?.formula || (element.dataSettings?.variables && element.dataSettings?.variables.length > 0));
  const [isFormulaMode, setIsFormulaMode] = useState(hasFormula);

  const { availableColumns, rows } = useMemo(() => {
    if (!effectiveSheetKey || !googleSheets[effectiveSheetKey]) return { availableColumns: [], rows: [] };
    const sheetData = googleSheets[effectiveSheetKey];
    const config = sheetConfigs.find(c => c.key === effectiveSheetKey);
    const headerRows = config?.headerRows || 1;
    if (!sheetData.headers) return { availableColumns: [], rows: [] };
    const cols = getMergedHeaders(sheetData.headers, headerRows);
    return { availableColumns: cols, rows: sheetData.rows || [] };
  }, [googleSheets, effectiveSheetKey, sheetConfigs]);

  const updateDataSettings = (key: keyof ElementDataSettings, value: any) => {
    const currentSettings = element.dataSettings || {};
    onUpdate({
      dataSettings: {
        ...currentSettings,
        [key]: value
      }
    });
  };

  const updateCalculatedFields = (updates: { variables?: CardVariable[], formula?: string }) => {
    const currentSettings = element.dataSettings || {};
    const newSettings: ElementDataSettings = { ...currentSettings };
    
    if (updates.variables !== undefined) newSettings.variables = updates.variables;
    if (updates.formula !== undefined) newSettings.formula = updates.formula;
    
    onUpdate({ dataSettings: newSettings });
  };

  // Filter Helpers
  const addFilter = () => {
    const currentSettings = element.dataSettings || {};
    const currentFilters = currentSettings.filters || [];
    const newFilter: ChartFilter = {
      id: Math.random().toString(36).substr(2, 9),
      column: availableColumns[0] || '',
      operator: 'equals',
      value: ''
    };
    updateDataSettings('filters', [...currentFilters, newFilter]);
  };

  const removeFilter = (id: string) => {
    const currentSettings = element.dataSettings || {};
    const currentFilters = currentSettings.filters || [];
    updateDataSettings('filters', currentFilters.filter(f => f.id !== id));
  };

  const updateFilter = (id: string, field: keyof ChartFilter, value: any) => {
    const currentSettings = element.dataSettings || {};
    const currentFilters = currentSettings.filters || [];
    const newFilters = currentFilters.map(f => f.id === id ? { ...f, [field]: value } : f);
    updateDataSettings('filters', newFilters);
  };

  const updateFilterColumn = (id: string, newColumn: string) => {
    const currentSettings = element.dataSettings || {};
    const currentFilters = currentSettings.filters || [];
    const newFilters = currentFilters.map(f => f.id === id ? { ...f, column: newColumn, value: '' } : f);
    updateDataSettings('filters', newFilters);
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
    return Array.from(values).sort().slice(0, 100);
  };

  return (
    <div className="bg-white dark:bg-[#151923] p-3 rounded-xl border border-dashed border-indigo-200 dark:border-indigo-500/20 mb-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
          <Database size={14} />
          <span className="text-xs font-bold uppercase">Настройки данных</span>
        </div>
        
        {/* Toggle Mode */}
        <button 
            onClick={() => setIsFormulaMode(!isFormulaMode)}
            className={`px-2 py-1 rounded text-[10px] font-bold border transition-colors flex items-center gap-1 ${
                isFormulaMode 
                ? 'bg-indigo-100 text-indigo-600 border-indigo-200 dark:bg-indigo-500/20 dark:text-indigo-300 dark:border-indigo-500/30' 
                : 'bg-gray-100 text-gray-500 border-gray-200 dark:bg-white/5 dark:text-gray-400 dark:border-white/10'
            }`}
        >
            <Calculator size={10} />
            {isFormulaMode ? 'Формула' : 'Простой'}
        </button>
      </div>

      {isFormulaMode ? (
        // --- FORMULA MODE ---
        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <CalculatedFieldsEditor 
                variables={element.dataSettings?.variables || []}
                formula={element.dataSettings?.formula || ''}
                onUpdate={updateCalculatedFields}
                sheetConfigs={sheetConfigs}
                googleSheets={googleSheets}
                defaultSheetKey={globalSheetKey}
            />
        </div>
      ) : (
        // --- SIMPLE MODE ---
        <div className="space-y-3 animate-in fade-in slide-in-from-left-4 duration-300">
            {/* Sheet Override */}
            <div>
            <span className={labelClass}>Таблица (Sheet Override)</span>
            <select
                value={element.dataSettings?.sheetKey || ''}
                onChange={(e) => updateDataSettings('sheetKey', e.target.value)}
                className={selectClass}
            >
                <option value="">Как в карточке (Global)</option>
                {sheetConfigs.map(c => <option key={c.key} value={c.key}>{c.sheetName}</option>)}
            </select>
            </div>

            {/* Column Override */}
            <div>
            <span className={labelClass}>Столбец (Column)</span>
            <select
                value={element.dataSettings?.dataColumn || ''}
                onChange={(e) => updateDataSettings('dataColumn', e.target.value)}
                className={selectClass}
            >
                <option value="">Как в карточке (Global)</option>
                {availableColumns.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            </div>

            {/* Aggregation Override */}
            <div>
            <span className={labelClass}>Агрегация</span>
            <select
                value={element.dataSettings?.aggregation || ''}
                onChange={(e) => updateDataSettings('aggregation', e.target.value)}
                className={selectClass}
            >
                <option value="">Как в карточке</option>
                <option value="sum">Сумма</option>
                <option value="count">Количество</option>
                <option value="unique">Уникальные</option>
                <option value="average">Среднее</option>
                <option value="max">Максимум</option>
                <option value="min">Минимум</option>
            </select>
            </div>

            {/* FILTERS */}
            <div className="pt-2 border-t border-gray-100 dark:border-white/5 mt-2">
            <div className="flex items-center justify-between mb-3">
                <span className={labelClass}>Локальные фильтры</span>
                <button onClick={addFilter} className="p-1.5 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 rounded-lg text-indigo-600 dark:text-indigo-400 transition-colors flex items-center gap-1 text-[10px] font-bold uppercase" title="Добавить фильтр">
                <Plus size={10} /> Добавить
                </button>
            </div>

            <div className="space-y-3">
                {(element.dataSettings?.filters || []).map(filter => {
                const uniqueValues = getUniqueValues(filter.column);
                return (
                    <div key={filter.id} className="bg-gray-100 dark:bg-[#0b0f19] p-3 rounded-xl border border-gray-200 dark:border-white/5 relative group">
                    <button
                        onClick={() => removeFilter(filter.id)}
                        className="absolute top-2 right-2 text-gray-300 hover:text-red-500 transition-colors"
                    >
                        <Trash2 size={14} />
                    </button>

                    <div className="flex flex-col gap-2">
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
                                className={filterInputClass}
                                placeholder="Значение"
                            />
                            )}
                        </div>
                        </div>
                    </div>
                    </div>
                );
                })}
                {(element.dataSettings?.filters || []).length === 0 && (
                <p className="text-[10px] text-gray-400 italic text-center py-2 border border-dashed border-gray-200 dark:border-white/10 rounded-lg">Нет локальных фильтров</p>
                )}
            </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default DataConfigSection;
