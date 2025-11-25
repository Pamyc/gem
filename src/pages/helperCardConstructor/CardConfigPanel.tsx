
import React, { useState } from 'react';
import { Palette, Type, Database, Filter, Plus, Trash2, ChevronDown, ChevronRight, PaintBucket, LayoutTemplate } from 'lucide-react';
import { CardConfig } from '../../types/card';
import { SheetConfig } from '../../contexts/DataContext';
import { ChartFilter } from '../../types/chart';
import { getPresetLayout } from '../../utils/cardPresets';

interface CardConfigPanelProps {
  config: CardConfig;
  setConfig: (c: CardConfig) => void;
  sheetConfigs?: SheetConfig[];
  availableColumns?: string[];
  rows?: any[][];
}

const COLORS = ['blue', 'emerald', 'violet', 'orange', 'pink', 'red', 'cyan', 'slate'];
const ICONS = ['Users', 'DollarSign', 'Activity', 'CreditCard', 'ShoppingCart', 'TrendingUp', 'Target', 'Zap', 'ArrowUpRight', 'ArrowDownRight', 'Building', 'MapPin', 'LayoutList'];

// Collapsible Section Component
const Section: React.FC<{
  title: string;
  icon: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
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

const CardConfigPanel: React.FC<CardConfigPanelProps> = ({ 
  config, 
  setConfig,
  sheetConfigs = [],
  availableColumns = [],
  rows = [] 
}) => {
  
  // State for Accordion Sections
  const [openSections, setOpenSections] = useState({
    preset: true,
    source: true,
    text: false,
    visuals: false,
    size: false,
    styling: false
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const update = (key: keyof CardConfig, value: any) => {
    setConfig({ ...config, [key]: value });
  };

  const applyPreset = (presetName: string) => {
     if (!presetName) return;
     const layoutUpdates = getPresetLayout(presetName as any);
     // Merge current data config with new layout
     setConfig({
        ...config,
        ...layoutUpdates,
        // Keep data config intact
        sheetKey: config.sheetKey,
        dataColumn: config.dataColumn,
        aggregation: config.aggregation,
        filters: config.filters
     });
  };

  // Filter Management
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

  const inputClass = "w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-[#1e2433] border border-gray-200 dark:border-white/10 text-gray-800 dark:text-gray-200 text-sm font-medium focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all";
  const selectClass = "w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-[#1e2433] border border-gray-200 dark:border-white/10 text-gray-800 dark:text-gray-200 text-sm font-medium focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all appearance-none cursor-pointer";
  const filterInputClass = "w-full px-3 py-2 rounded-lg bg-white dark:bg-[#151923] border border-gray-200 dark:border-white/10 text-gray-800 dark:text-gray-200 text-xs font-medium focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all appearance-none cursor-pointer h-9";
  const colorInputClass = "w-10 h-10 rounded-lg border border-gray-200 dark:border-white/10 p-1 cursor-pointer bg-gray-50 dark:bg-[#1e2433]";

  return (
    <div className="h-full overflow-y-auto pr-2 custom-scrollbar">
      
      {/* 1. Preset Selection */}
      <Section 
        title="Макет и Стиль" 
        icon={<LayoutTemplate size={14} />} 
        isOpen={openSections.preset} 
        onToggle={() => toggleSection('preset')}
      >
        <div className="space-y-4">
          <div>
            <span className="text-xs text-gray-400 mb-1 block ml-1 font-bold uppercase tracking-wider">Загрузить пресет</span>
            <div className="relative">
              <select 
                value=""
                onChange={(e) => applyPreset(e.target.value)}
                className={selectClass}
              >
                <option value="" disabled>Выберите стиль...</option>
                <option value="classic">Classic Clean</option>
                <option value="gradient">Vibrant Gradient</option>
                <option value="minMax">Min/Max Range</option>
              </select>
              <p className="text-[10px] text-gray-400 mt-1 ml-1">
                 Выбор пресета сбросит текущее расположение элементов
              </p>
            </div>
          </div>
          
          <div>
            <span className="text-xs text-gray-400 mb-1 block ml-1 font-bold uppercase tracking-wider">Название</span>
            <input 
                type="text"
                value={config.title}
                onChange={(e) => update('title', e.target.value)}
                className={inputClass}
                placeholder="Заголовок карточки"
            />
          </div>
        </div>
      </Section>

      {/* 2. Data Source Settings */}
      <Section 
        title="Источник данных" 
        icon={<Database size={14} />} 
        isOpen={openSections.source} 
        onToggle={() => toggleSection('source')}
      >
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

         {/* Filtering */}
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
      </Section>

      {/* 3. Text & Formatting */}
      <Section 
        title="Текст и Формат" 
        icon={<Type size={14} />} 
        isOpen={openSections.text} 
        onToggle={() => toggleSection('text')}
      >
         <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
                <div>
                   <span className="text-xs text-gray-400 mb-1 block ml-1">Префикс</span>
                   <input 
                      type="text" 
                      value={config.valuePrefix}
                      onChange={(e) => update('valuePrefix', e.target.value)}
                      placeholder="₽, $..."
                      className={inputClass}
                   />
                </div>
                <div>
                   <span className="text-xs text-gray-400 mb-1 block ml-1">Суффикс</span>
                   <input 
                      type="text" 
                      value={config.valueSuffix}
                      onChange={(e) => update('valueSuffix', e.target.value)}
                      placeholder=" шт, %"
                      className={inputClass}
                   />
                </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input 
                type="checkbox" 
                id="compact"
                checked={config.compactNumbers}
                onChange={(e) => update('compactNumbers', e.target.checked)}
                className="w-4 h-4 rounded bg-gray-100 dark:bg-[#1e2433] border-gray-300 dark:border-white/20 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
              <label htmlFor="compact" className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                 Компактные числа (1.2k, 1M)
              </label>
           </div>
         </div>
      </Section>

      {/* 4. Visuals */}
      <Section 
        title="Визуализация" 
        icon={<Palette size={14} />} 
        isOpen={openSections.visuals} 
        onToggle={() => toggleSection('visuals')}
      >
        <div className="space-y-4">
            
            {/* Gradient Config */}
            <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 dark:bg-[#1e2433] rounded-xl border border-gray-100 dark:border-white/5">
                <div>
                    <span className="text-[10px] uppercase text-gray-400 font-bold mb-1 block">Градиент от</span>
                    <select 
                        value={config.gradientFrom}
                        onChange={(e) => update('gradientFrom', e.target.value)}
                        className={`${selectClass} text-xs py-1.5`}
                    >
                        <option value="">Нет</option>
                        {COLORS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
                <div>
                    <span className="text-[10px] uppercase text-gray-400 font-bold mb-1 block">Градиент до</span>
                    <select 
                        value={config.gradientTo}
                        onChange={(e) => update('gradientTo', e.target.value)}
                        className={`${selectClass} text-xs py-1.5`}
                    >
                        <option value="">Нет</option>
                        {COLORS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
            </div>

            {/* Icon Config */}
            <div>
               <div className="flex items-center justify-between mb-2">
                   <span className="text-xs text-gray-400 ml-1">Иконка по умолчанию</span>
               </div>
               
               <div className="grid grid-cols-5 gap-2 bg-gray-50 dark:bg-[#1e2433] p-3 rounded-xl border border-gray-100 dark:border-white/5 max-h-[120px] overflow-y-auto custom-scrollbar">
                   {ICONS.map(iconName => (
                       <button
                         key={iconName}
                         onClick={() => update('icon', iconName)}
                         className={`p-2 rounded-lg flex items-center justify-center transition-all ${
                             config.icon === iconName 
                                ? 'bg-indigo-100 dark:bg-indigo-500/30 text-indigo-600 dark:text-indigo-300' 
                                : 'hover:bg-gray-200 dark:hover:bg-white/10 text-gray-500'
                         }`}
                         title={iconName}
                       >
                            <div className="text-[10px] font-bold truncate">{iconName.substring(0, 2)}</div>
                       </button>
                   ))}
               </div>
               <p className="text-[10px] text-gray-400 mt-1 ml-1">
                  Это глобальная иконка. Вы также можете настроить иконку для каждого элемента отдельно.
               </p>
            </div>

            {/* Trend Config */}
            <div>
               <div className="flex items-center justify-between mb-2">
                   <span className="text-xs text-gray-400 ml-1">Тренд (Данные)</span>
               </div>

               <div className="grid grid-cols-2 gap-3">
                    <div>
                       <span className="text-[10px] uppercase text-gray-400 font-bold mb-1 block">Значение</span>
                       <input 
                          type="text" 
                          value={config.trendValue}
                          onChange={(e) => update('trendValue', e.target.value)}
                          placeholder="+5%"
                          className={`${inputClass} text-xs py-1.5`}
                       />
                    </div>
                    <div>
                       <span className="text-[10px] uppercase text-gray-400 font-bold mb-1 block">Направление</span>
                       <select 
                            value={config.trendDirection}
                            onChange={(e) => update('trendDirection', e.target.value)}
                            className={`${selectClass} text-xs py-1.5`}
                        >
                            <option value="up">Рост (Good)</option>
                            <option value="down">Падение (Bad)</option>
                            <option value="neutral">Нейтрально</option>
                        </select>
                    </div>
               </div>
            </div>
        </div>
      </Section>

      {/* 5. Styling Overrides */}
      <Section 
        title="Фон и Рамка" 
        icon={<PaintBucket size={14} />} 
        isOpen={openSections.styling} 
        onToggle={() => toggleSection('styling')}
      >
        <div className="space-y-4">
            
            {/* Card Background & Border */}
            <div className="grid grid-cols-2 gap-3">
               <div>
                  <span className="text-[10px] uppercase text-gray-400 font-bold mb-1 block">Фон (Hex/RGBA)</span>
                  <div className="flex items-center gap-2">
                     <input 
                       type="color" 
                       value={config.backgroundColor || '#ffffff'}
                       onChange={(e) => update('backgroundColor', e.target.value)}
                       className={colorInputClass}
                     />
                     <input 
                        type="text" 
                        value={config.backgroundColor || ''}
                        onChange={(e) => update('backgroundColor', e.target.value)}
                        placeholder="default"
                        className={`${inputClass} text-xs`}
                     />
                  </div>
               </div>
               <div>
                  <span className="text-[10px] uppercase text-gray-400 font-bold mb-1 block">Бордер</span>
                  <input 
                    type="text" 
                    value={config.borderColor || ''}
                    onChange={(e) => update('borderColor', e.target.value)}
                    placeholder="#e5e7eb"
                    className={`${inputClass} text-xs`}
                  />
               </div>
            </div>
        </div>
      </Section>
    </div>
  );
};

export default CardConfigPanel;
