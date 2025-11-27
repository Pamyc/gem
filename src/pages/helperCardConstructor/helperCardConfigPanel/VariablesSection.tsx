
import React, { useMemo, useState } from 'react';
import { CardVariable } from '../../../types/card';
import { SheetConfig } from '../../../contexts/DataContext';
import { ChartFilter } from '../../../types/chart';
import { getMergedHeaders } from '../../../utils/chartUtils';
import { Plus, Trash2, Calculator, ChevronDown, ChevronRight } from 'lucide-react';
import { inputClass, selectClass, filterInputClass } from './styles';

interface CalculatedFieldsEditorProps {
  variables: CardVariable[];
  formula: string;
  onUpdate: (updates: { variables?: CardVariable[], formula?: string }) => void;
  sheetConfigs: SheetConfig[];
  googleSheets: any;
  defaultSheetKey?: string;
}

const VariableItem: React.FC<{
  variable: CardVariable;
  onUpdate: (v: CardVariable) => void;
  onDelete: () => void;
  sheetConfigs: SheetConfig[];
  googleSheets: any;
}> = ({ variable, onUpdate, onDelete, sheetConfigs, googleSheets }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Helper to get columns for the selected sheet of this variable
  const availableColumns = useMemo(() => {
    if (!variable.sheetKey || !googleSheets[variable.sheetKey]) return [];
    const sheetData = googleSheets[variable.sheetKey];
    const config = sheetConfigs.find(c => c.key === variable.sheetKey);
    const headerRows = config?.headerRows || 1;
    return getMergedHeaders(sheetData.headers, headerRows);
  }, [googleSheets, sheetConfigs, variable.sheetKey]);

  // Helper to get rows for filter values
  const rows = useMemo(() => {
      if (!variable.sheetKey || !googleSheets[variable.sheetKey]) return [];
      return googleSheets[variable.sheetKey].rows || [];
  }, [googleSheets, variable.sheetKey]);

  const updateVar = (key: keyof CardVariable, value: any) => {
    onUpdate({ ...variable, [key]: value });
  };

  // Filter Management
  const addFilter = () => {
    const newFilter: ChartFilter = {
      id: Math.random().toString(36).substr(2, 9),
      column: availableColumns[0] || '',
      operator: 'equals',
      value: ''
    };
    updateVar('filters', [...variable.filters, newFilter]);
  };

  const removeFilter = (id: string) => {
    updateVar('filters', variable.filters.filter(f => f.id !== id));
  };

  const updateFilter = (id: string, field: keyof ChartFilter, value: any) => {
    const newFilters = variable.filters.map(f => 
      f.id === id ? { ...f, [field]: value } : f
    );
    updateVar('filters', newFilters);
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
    <div className="bg-gray-50 dark:bg-[#1e2433] rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden mb-2">
      <div className="flex items-center justify-between p-2">
        <div 
            className="flex items-center gap-2 cursor-pointer flex-1"
            onClick={() => setIsExpanded(!isExpanded)}
        >
            <div className="bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 w-6 h-6 rounded flex items-center justify-center text-xs font-bold font-mono">
                {variable.name || '?'}
            </div>
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                {variable.name ? `Переменная {${variable.name}}` : 'Новая переменная'}
            </span>
            {isExpanded ? <ChevronDown size={14} className="text-gray-400"/> : <ChevronRight size={14} className="text-gray-400"/>}
        </div>
        <button onClick={onDelete} className="text-gray-400 hover:text-red-500 p-1">
            <Trash2 size={14} />
        </button>
      </div>

      {isExpanded && (
        <div className="p-3 border-t border-gray-100 dark:border-white/5 space-y-3 bg-white dark:bg-[#151923]">
            {/* Name Input */}
            <div>
               <label className="text-[10px] uppercase text-gray-400 font-bold mb-1 block">Имя (латиница, без пробелов)</label>
               <input 
                 type="text"
                 value={variable.name}
                 onChange={(e) => updateVar('name', e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                 className={inputClass}
                 placeholder="a, b, total_sales..."
               />
            </div>

            {/* Data Source */}
            <div>
                <label className="text-[10px] uppercase text-gray-400 font-bold mb-1 block">Таблица</label>
                <select
                    value={variable.sheetKey}
                    onChange={(e) => updateVar('sheetKey', e.target.value)}
                    className={selectClass}
                >
                    <option value="" disabled>Выберите...</option>
                    {sheetConfigs.map(c => (
                    <option key={c.key} value={c.key}>{c.sheetName}</option>
                    ))}
                </select>
            </div>

            <div>
                <label className="text-[10px] uppercase text-gray-400 font-bold mb-1 block">Столбец</label>
                <select
                    value={variable.dataColumn}
                    onChange={(e) => updateVar('dataColumn', e.target.value)}
                    className={selectClass}
                    disabled={!variable.sheetKey}
                >
                    <option value="">Не выбрано</option>
                    {availableColumns.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>

            <div>
                <label className="text-[10px] uppercase text-gray-400 font-bold mb-1 block">Агрегация</label>
                <select
                    value={variable.aggregation}
                    onChange={(e) => updateVar('aggregation', e.target.value)}
                    className={selectClass}
                >
                    <option value="sum">Сумма</option>
                    <option value="count">Количество</option>
                    <option value="unique">Уникальные</option>
                    <option value="average">Среднее</option>
                    <option value="max">Максимум</option>
                    <option value="min">Минимум</option>
                </select>
            </div>

            {/* Filters */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <label className="text-[10px] uppercase text-gray-400 font-bold">Фильтры ({variable.filters.length})</label>
                    <button onClick={addFilter} className="text-[10px] text-indigo-500 font-bold flex items-center gap-1 hover:underline">
                        <Plus size={10} /> Добавить
                    </button>
                </div>
                
                <div className="space-y-2">
                    {variable.filters.map(filter => {
                        const uniqueValues = getUniqueValues(filter.column);
                        return (
                            <div key={filter.id} className="p-2 rounded border border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-[#1e2433] relative">
                                <button 
                                    onClick={() => removeFilter(filter.id)}
                                    className="absolute top-1 right-1 text-gray-400 hover:text-red-500"
                                >
                                    <Trash2 size={10} />
                                </button>
                                <div className="space-y-1 pr-4">
                                    <select
                                        value={filter.column}
                                        onChange={(e) => updateFilter(filter.id, 'column', e.target.value)}
                                        className={`${filterInputClass} text-[10px] h-6 py-0 px-1`}
                                    >
                                        {availableColumns.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                    <div className="flex gap-1">
                                        <select
                                            value={filter.operator}
                                            onChange={(e) => updateFilter(filter.id, 'operator', e.target.value)}
                                            className={`${filterInputClass} w-1/3 text-[10px] h-6 py-0 px-1`}
                                        >
                                            <option value="equals">=</option>
                                            <option value="contains">In</option>
                                            <option value="greater">&gt;</option>
                                            <option value="less">&lt;</option>
                                        </select>
                                        {uniqueValues.length > 0 ? (
                                            <select
                                                value={filter.value}
                                                onChange={(e) => updateFilter(filter.id, 'value', e.target.value)}
                                                className={`${filterInputClass} w-2/3 text-[10px] h-6 py-0 px-1`}
                                            >
                                                <option value="">Значение...</option>
                                                {uniqueValues.map(val => <option key={val} value={val}>{val}</option>)}
                                            </select>
                                        ) : (
                                            <input
                                                type="text"
                                                value={filter.value}
                                                onChange={(e) => updateFilter(filter.id, 'value', e.target.value)}
                                                className={`${filterInputClass} w-2/3 text-[10px] h-6 py-0 px-1`}
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

const CalculatedFieldsEditor: React.FC<CalculatedFieldsEditorProps> = ({ 
  variables, 
  formula, 
  onUpdate, 
  sheetConfigs, 
  googleSheets,
  defaultSheetKey 
}) => {
  
  const addVariable = () => {
    const newVar: CardVariable = {
        id: Math.random().toString(36).substr(2, 9),
        name: 'a',
        sheetKey: defaultSheetKey || (sheetConfigs[0]?.key || ''),
        dataColumn: '',
        aggregation: 'sum',
        filters: []
    };
    const currentVars = variables || [];
    // Ensure unique name
    let nameSuffix = 0;
    while (currentVars.find(v => v.name === newVar.name)) {
        nameSuffix++;
        newVar.name = String.fromCharCode(97 + nameSuffix); // a, b, c...
    }
    
    onUpdate({ variables: [...currentVars, newVar] });
  };

  const removeVariable = (id: string) => {
    const currentVars = variables || [];
    onUpdate({ variables: currentVars.filter(v => v.id !== id) });
  };

  const updateVariable = (updatedVar: CardVariable) => {
    const currentVars = variables || [];
    onUpdate({ variables: currentVars.map(v => v.id === updatedVar.id ? updatedVar : v) });
  };

  return (
    <div className="space-y-4">
       
       {/* 1. Variable List */}
       <div className="space-y-2">
          {(variables || []).map(v => (
              <VariableItem 
                key={v.id} 
                variable={v} 
                onUpdate={updateVariable} 
                onDelete={() => removeVariable(v.id)}
                sheetConfigs={sheetConfigs}
                googleSheets={googleSheets}
              />
          ))}
          
          <button 
            onClick={addVariable}
            className="w-full py-2 border-2 border-dashed border-indigo-200 dark:border-indigo-500/20 rounded-xl text-indigo-500 text-xs font-bold flex items-center justify-center gap-2 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors"
          >
             <Plus size={14} /> Добавить переменную
          </button>
       </div>

       {/* 2. Formula Input */}
       <div className="pt-2 border-t border-gray-100 dark:border-white/5">
          <div className="flex items-center gap-2 mb-2">
             <Calculator size={14} className="text-indigo-500" />
             <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Формула расчета</span>
          </div>
          <div className="relative">
             <input 
                type="text" 
                value={formula || ''}
                onChange={(e) => onUpdate({ formula: e.target.value })}
                placeholder="{a} / {b}"
                className={`${inputClass} font-mono text-sm`}
             />
             <p className="text-[10px] text-gray-400 mt-1">
                Используйте имена переменных в фигурных скобках. Пример: <code>{`{a} / {b} * 100`}</code>
             </p>
          </div>
       </div>

    </div>
  );
};

export default CalculatedFieldsEditor;
