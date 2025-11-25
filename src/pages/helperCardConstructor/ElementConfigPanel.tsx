
import React, { useMemo } from 'react';
import { Square, Trash2, Move, Type, Palette, Database, Plus, Layers, ArrowUp, ArrowDown } from 'lucide-react';
import { CardElement, ElementDataSettings } from '../../types/card';
import { ChartFilter } from '../../types/chart';
import * as Icons from 'lucide-react';
import { SheetConfig } from '../../contexts/DataContext';
import { getMergedHeaders } from '../../utils/chartUtils';

interface ElementConfigPanelProps {
  element: CardElement;
  onUpdate: (updates: Partial<CardElement['style']> | Partial<CardElement>) => void;
  onDelete: () => void;
  // Context for resolving data columns based on selection
  googleSheets: any;
  sheetConfigs: SheetConfig[];
  globalSheetKey: string;
}

const ICONS = ['Users', 'DollarSign', 'Activity', 'CreditCard', 'ShoppingCart', 'TrendingUp', 'Target', 'Zap', 'ArrowUpRight', 'ArrowDownRight', 'Building', 'MapPin', 'LayoutList', 'CheckCircle', 'AlertCircle', 'Info', 'Settings', 'Home', 'User'];

const ElementConfigPanel: React.FC<ElementConfigPanelProps> = ({ 
  element, 
  onUpdate, 
  onDelete, 
  googleSheets, 
  sheetConfigs, 
  globalSheetKey 
}) => {
  
  // 1. Resolve Effective Data Context
  const effectiveSheetKey = element.dataSettings?.sheetKey || globalSheetKey;
  
  const { availableColumns, rows } = useMemo(() => {
     if (!effectiveSheetKey || !googleSheets[effectiveSheetKey]) return { availableColumns: [], rows: [] };
     
     const sheetData = googleSheets[effectiveSheetKey];
     const config = sheetConfigs.find(c => c.key === effectiveSheetKey);
     const headerRows = config?.headerRows || 1;
     
     if (!sheetData.headers) return { availableColumns: [], rows: [] };

     const cols = getMergedHeaders(sheetData.headers, headerRows);
     return { availableColumns: cols, rows: sheetData.rows || [] };
  }, [googleSheets, effectiveSheetKey, sheetConfigs]);


  const updateStyle = (key: keyof CardElement['style'], value: any) => {
     onUpdate({ style: { ...element.style, [key]: value } });
  };

  const updateProp = (key: keyof CardElement, value: any) => {
    onUpdate({ [key]: value });
  };

  const updateDataSettings = (key: keyof ElementDataSettings, value: any) => {
      const currentSettings = element.dataSettings || {};
      onUpdate({ 
          dataSettings: { 
              ...currentSettings,
              [key]: value
          } 
      });
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

  const inputClass = "w-full px-2 py-1.5 rounded-lg bg-white dark:bg-[#1e2433] border border-gray-200 dark:border-white/10 text-gray-800 dark:text-gray-200 text-xs font-medium focus:ring-2 focus:ring-indigo-500/50 outline-none";
  const selectClass = "w-full px-2 py-1.5 rounded-lg bg-white dark:bg-[#1e2433] border border-gray-200 dark:border-white/10 text-gray-800 dark:text-gray-200 text-xs font-medium focus:ring-2 focus:ring-indigo-500/50 outline-none appearance-none cursor-pointer";
  const filterInputClass = "w-full px-2 py-1.5 rounded-lg bg-white dark:bg-[#151923] border border-gray-200 dark:border-white/10 text-gray-800 dark:text-gray-200 text-xs font-medium focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all appearance-none cursor-pointer h-9";
  const labelClass = "text-[10px] uppercase text-gray-400 font-bold mb-1 block";
  const sectionClass = "border-t border-gray-100 dark:border-white/5 pt-3 mt-3";

  return (
    <div className="bg-gray-50 dark:bg-[#0b0f19] p-4 rounded-xl border border-gray-200 dark:border-white/10 space-y-3 animate-in fade-in slide-in-from-right-4 h-full overflow-y-auto custom-scrollbar">
       
       {/* Header */}
       <div className="flex justify-between items-center border-b border-gray-200 dark:border-white/5 pb-2 mb-2">
          <span className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
             <Square size={12} className="text-indigo-500" />
             {element.type.toUpperCase()}
          </span>
          <button onClick={onDelete} className="text-red-400 hover:text-red-500 transition-colors p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20" title="Удалить элемент (Del)">
             <Trash2 size={14} />
          </button>
       </div>

       {/* DATA CONFIGURATION (Only for Value type) */}
       {element.type === 'value' && (
           <div className="bg-white dark:bg-[#151923] p-3 rounded-xl border border-dashed border-indigo-200 dark:border-indigo-500/20 mb-4 shadow-sm">
                <div className="flex items-center gap-2 mb-3 text-indigo-600 dark:text-indigo-400">
                    <Database size={14} />
                    <span className="text-xs font-bold uppercase">Настройки данных</span>
                </div>
                
                <div className="space-y-3">
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
           </div>
       )}

       {/* Content Edit for Text */}
       {element.type === 'text' && (
          <div>
             <span className={labelClass}>Текст</span>
             <input 
               type="text" 
               value={element.content || ''}
               onChange={(e) => updateProp('content', e.target.value)}
               className={inputClass}
             />
          </div>
       )}

       {/* Icon Selection */}
       {element.type === 'icon' && (
           <div className="mb-2">
               <span className={labelClass}>Выберите иконку</span>
               <div className="grid grid-cols-5 gap-1.5 max-h-32 overflow-y-auto custom-scrollbar p-1 bg-white dark:bg-[#1e2433] rounded-lg border border-gray-200 dark:border-white/10">
                   {ICONS.map(iconName => {
                       const IconComp = (Icons as any)[iconName] || Icons.HelpCircle;
                       const isActive = element.iconName === iconName || (!element.iconName && iconName === 'HelpCircle');
                       return (
                           <button 
                                key={iconName}
                                onClick={() => updateProp('iconName', iconName)}
                                className={`p-1.5 rounded flex items-center justify-center transition-colors ${isActive ? 'bg-indigo-100 dark:bg-indigo-500/30 text-indigo-600 dark:text-indigo-300' : 'hover:bg-gray-100 dark:hover:bg-white/5 text-gray-500'}`}
                                title={iconName}
                           >
                               <IconComp size={16} />
                           </button>
                       );
                   })}
               </div>
           </div>
       )}

       {/* Position */}
       <div>
          <span className={labelClass}>Позиция (X / Y)</span>
          <div className="grid grid-cols-2 gap-2">
             <div className="relative">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs"><Move size={10}/></span>
                <input 
                    type="number" 
                    value={element.style.top}
                    onChange={(e) => updateStyle('top', Number(e.target.value))}
                    className={`${inputClass} pl-6`}
                    placeholder="Top"
                />
             </div>
             <div className="relative">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs"><Move size={10} className="rotate-90"/></span>
                <input 
                    type="number" 
                    value={element.style.left}
                    onChange={(e) => updateStyle('left', Number(e.target.value))}
                    className={`${inputClass} pl-6`}
                    placeholder="Left"
                />
             </div>
          </div>
       </div>

       {/* Dimensions */}
       <div className={sectionClass}>
          <span className={labelClass}>Размеры (Width / Height)</span>
          <div className="grid grid-cols-2 gap-2">
             <div className="relative">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">W</span>
                <input 
                    type="number" 
                    value={element.style.width === 'auto' ? '' : element.style.width}
                    onChange={(e) => updateStyle('width', e.target.value === '' ? 'auto' : Number(e.target.value))}
                    className={`${inputClass} pl-6`}
                    placeholder="Auto"
                />
             </div>
             <div className="relative">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">H</span>
                <input 
                    type="number" 
                    value={element.style.height === 'auto' ? '' : element.style.height}
                    onChange={(e) => updateStyle('height', e.target.value === '' ? 'auto' : Number(e.target.value))}
                    className={`${inputClass} pl-6`}
                    placeholder="Auto"
                />
             </div>
          </div>
          <p className="text-[10px] text-gray-400 mt-1 italic">Можно тянуть за углы для изменения</p>
       </div>

       {/* Typography */}
       {element.type !== 'icon' && element.type !== 'shape' && (
           <div className={sectionClass}>
              <span className={labelClass}><Type size={10} className="inline mr-1"/> Шрифт</span>
              <div className="grid grid-cols-2 gap-2 mb-2">
                 <input 
                    type="number" 
                    value={element.style.fontSize || 14}
                    onChange={(e) => updateStyle('fontSize', Number(e.target.value))}
                    placeholder="Size"
                    className={inputClass}
                 />
                 <select
                    value={element.style.fontWeight || 'normal'}
                    onChange={(e) => updateStyle('fontWeight', e.target.value)}
                    className={inputClass}
                 >
                    <option value="300">Light</option>
                    <option value="normal">Normal</option>
                    <option value="500">Medium</option>
                    <option value="bold">Bold</option>
                    <option value="900">Black</option>
                 </select>
              </div>
              <select
                    value={element.style.textAlign || 'left'}
                    onChange={(e) => updateStyle('textAlign', e.target.value)}
                    className={inputClass}
                 >
                    <option value="left">Left Align</option>
                    <option value="center">Center Align</option>
                    <option value="right">Right Align</option>
                 </select>
           </div>
       )}

       {/* Colors */}
       <div className={sectionClass}>
          <span className={labelClass}><Palette size={10} className="inline mr-1"/> Цвета</span>
          <div className="grid grid-cols-2 gap-2">
             <div>
                <span className="text-[9px] text-gray-400 mb-0.5 block">Основной</span>
                <div className="flex items-center gap-1">
                   <input 
                     type="color" 
                     value={element.style.color || '#000000'}
                     onChange={(e) => updateStyle('color', e.target.value)}
                     className="w-6 h-6 rounded cursor-pointer border border-gray-200 dark:border-white/10 p-0.5 bg-transparent"
                   />
                   <input 
                     type="text"
                     value={element.style.color || ''}
                     onChange={(e) => updateStyle('color', e.target.value)}
                     className={inputClass}
                     placeholder="inherit"
                   />
                </div>
             </div>
             <div>
                <span className="text-[9px] text-gray-400 mb-0.5 block">Фон</span>
                <div className="flex items-center gap-1">
                   <input 
                     type="color" 
                     value={element.style.backgroundColor || '#ffffff'}
                     onChange={(e) => updateStyle('backgroundColor', e.target.value)}
                     className="w-6 h-6 rounded cursor-pointer border border-gray-200 dark:border-white/10 p-0.5 bg-transparent"
                   />
                   <div className="text-[10px] text-gray-400 truncate">
                      {element.style.backgroundColor || 'none'}
                   </div>
                </div>
             </div>
          </div>
       </div>

       {/* Alignment & Layering */}
       <div className={sectionClass}>
          <span className={labelClass}><Layers size={10} className="inline mr-1"/> Слои и Вид</span>
          <div className="grid grid-cols-2 gap-2 mb-2">
             <div>
                 <span className="text-[9px] text-gray-400 mb-0.5 block">Z-Index</span>
                 <div className="flex items-center gap-1">
                    <button onClick={() => updateStyle('zIndex', (element.style.zIndex || 1) - 1)} className="p-1.5 bg-white dark:bg-[#1e2433] rounded border border-gray-200 dark:border-white/10 hover:bg-gray-100"><ArrowDown size={12}/></button>
                    <span className="text-xs font-mono w-6 text-center">{element.style.zIndex || 1}</span>
                    <button onClick={() => updateStyle('zIndex', (element.style.zIndex || 1) + 1)} className="p-1.5 bg-white dark:bg-[#1e2433] rounded border border-gray-200 dark:border-white/10 hover:bg-gray-100"><ArrowUp size={12}/></button>
                 </div>
             </div>
             <div>
                 <span className="text-[9px] text-gray-400 mb-0.5 block">Opacity</span>
                 <input 
                    type="number" 
                    step="0.1"
                    min="0"
                    max="1"
                    value={element.style.opacity ?? 1}
                    onChange={(e) => updateStyle('opacity', parseFloat(e.target.value))}
                    className={inputClass}
                 />
             </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
             <div>
                 <span className="text-[9px] text-gray-400 mb-0.5 block">Radius</span>
                 <input 
                    type="number" 
                    value={element.style.borderRadius || 0}
                    onChange={(e) => updateStyle('borderRadius', parseFloat(e.target.value))}
                    className={inputClass}
                 />
             </div>
             <div>
                 <span className="text-[9px] text-gray-400 mb-0.5 block">Padding</span>
                 <input 
                    type="number" 
                    value={element.style.padding || 0}
                    onChange={(e) => updateStyle('padding', parseFloat(e.target.value))}
                    className={inputClass}
                 />
             </div>
          </div>
       </div>

    </div>
  );
};

export default ElementConfigPanel;
