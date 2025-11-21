import React, { useState } from 'react';
import { Palette, Type, Database, Filter, Plus, Trash2, Layout, ChevronDown, ChevronRight, Maximize } from 'lucide-react';
import { CardConfig } from '../../types/card';
import { SheetConfig } from '../../contexts/DataContext';
import { ChartFilter } from '../../types/chart';

interface CardConfigPanelProps {
  config: CardConfig;
  setConfig: (c: CardConfig) => void;
  sheetConfigs?: SheetConfig[];
  availableColumns?: string[];
  rows?: any[][];
}

const COLORS = ['blue', 'emerald', 'violet', 'orange', 'pink', 'red', 'cyan', 'slate'];
const ICONS = ['Users', 'DollarSign', 'Activity', 'CreditCard', 'ShoppingCart', 'TrendingUp', 'Target', 'Zap'];

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
    source: true,
    text: false,
    visuals: false,
    size: false
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const update = (key: keyof CardConfig, value: any) => {
    setConfig({ ...config, [key]: value });
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

  return (
    <div className="h-full overflow-y-auto pr-2 custom-scrollbar">
      
      {/* 1. Template Selection (Top Level) */}
      <div className="mb-4">
        <span className="text-xs text-gray-400 mb-1 block ml-1 font-bold uppercase tracking-wider">Шаблон</span>
        <div className="relative">
          <select 
            value={config.template}
            onChange={(e) => update('template', e.target.value)}
            className={selectClass}
          >
            <option value="classic">Classic Clean</option>
            <option value="gradient">Vibrant Gradient</option>
          </select>
        </div>
      </div>

      {/* 2. Data Source Settings */}
      <Section 
        title="Источник данных" 
        icon={<Database size={14} />} 
        isOpen={openSections.source} 
        onToggle={() => toggleSection('source')}
      >
        <div className="space-y-3">
             {/* Sheet Selector */}
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

            {/* Column Selector */}
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

            {/* Aggregation */}
            <div>
                <span className="text-xs text-gray-400 mb-1 block ml-1">Агрегация</span>
                <select
                    value={config.aggregation}
                    onChange={(e) => update('aggregation', e.target.value)}
                    className={selectClass}
                >
                    <option value="sum">Сумма (Sum)</option>
                    <option value="count">Количество (Count)</option>
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
                  className="p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded text-indigo-500 transition-colors"
                  title="Добавить фильтр"
                >
                  <Plus size={14} />
                </button>
            </div>

            {config.filters.length === 0 && (
                <p className="text-[10px] text-gray-400 italic">Нет фильтров</p>
            )}

            <div className="space-y-2">
                {config.filters.map((filter) => {
                  const uniqueValues = getUniqueValues(filter.column);
                  return (
                    <div key={filter.id} className="bg-gray-50 dark:bg-[#1e2433] p-2 rounded-lg border border-gray-200 dark:border-white/5 flex flex-col gap-2">
                        <div className="flex gap-2">
                            <select
                              value={filter.column}
                              onChange={(e) => updateFilterColumn(filter.id, e.target.value)}
                              className={`${selectClass} text-xs py-1 px-1 h-7`}
                            >
                              {availableColumns.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                            <button onClick={() => removeFilter(filter.id)} className="text-gray-400 hover:text-red-500 p-0.5 shrink-0">
                              <Trash2 size={12} />
                            </button>
                        </div>
                        
                        <div className="flex gap-2">
                            <select
                              value={filter.operator}
                              onChange={(e) => updateFilter(filter.id, 'operator', e.target.value)}
                              className={`${selectClass} w-1/3 text-xs py-1 px-1 h-7`}
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
                                className={`${selectClass} w-2/3 text-xs py-1 px-1 h-7`}
                              >
                                <option value="">...</option>
                                {uniqueValues.map(val => (
                                  <option key={val} value={val}>{val}</option>
                                ))}
                              </select>
                            ) : (
                              <input
                                type="text"
                                value={filter.value}
                                onChange={(e) => updateFilter(filter.id, 'value', e.target.value)}
                                placeholder="..."
                                className={`${inputClass} w-2/3 text-xs py-1 px-1 h-7`}
                              />
                            )}
                        </div>
                    </div>
                  );
                })}
            </div>
         </div>
      </Section>

      {/* 3. Text Settings */}
      <Section 
        title="Текст и Формат" 
        icon={<Type size={14} />} 
        isOpen={openSections.text} 
        onToggle={() => toggleSection('text')}
      >
        <div className="space-y-3">
            <div>
                <span className="text-xs text-gray-400 mb-1 block ml-1">Заголовок</span>
                <input 
                    type="text" 
                    value={config.title}
                    onChange={(e) => update('title', e.target.value)}
                    className={inputClass}
                />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <span className="text-xs text-gray-400 mb-1 block ml-1">Префикс</span>
                    <input 
                        type="text" 
                        value={config.valuePrefix}
                        onChange={(e) => update('valuePrefix', e.target.value)}
                        className={inputClass}
                        placeholder="₽ "
                    />
                </div>
                <div>
                    <span className="text-xs text-gray-400 mb-1 block ml-1">Суффикс</span>
                    <input 
                        type="text" 
                        value={config.valueSuffix}
                        onChange={(e) => update('valueSuffix', e.target.value)}
                        className={inputClass}
                        placeholder=" шт."
                    />
                </div>
            </div>
        </div>
      </Section>

      {/* 4. Visual Settings */}
      <Section 
        title="Внешний вид" 
        icon={<Palette size={14} />} 
        isOpen={openSections.visuals} 
        onToggle={() => toggleSection('visuals')}
      >
        <div className="space-y-3">
             <div className="flex items-center gap-2">
                <input 
                    type="checkbox"
                    id="showIcon"
                    checked={config.showIcon}
                    onChange={(e) => update('showIcon', e.target.checked)}
                    className="w-4 h-4 rounded bg-gray-100 dark:bg-[#1e2433] border-gray-300 dark:border-white/20 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="showIcon" className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer">Иконка</label>
            </div>
            
            {config.showIcon && (
                <select 
                    value={config.icon}
                    onChange={(e) => update('icon', e.target.value)}
                    className={selectClass}
                >
                    {ICONS.map(icon => <option key={icon} value={icon}>{icon}</option>)}
                </select>
            )}

            <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-white/5 mt-2">
                <input 
                    type="checkbox"
                    id="showTrend"
                    checked={config.showTrend}
                    onChange={(e) => update('showTrend', e.target.checked)}
                    className="w-4 h-4 rounded bg-gray-100 dark:bg-[#1e2433] border-gray-300 dark:border-white/20 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="showTrend" className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer">Тренды</label>
            </div>

            {config.showTrend && (
                <div className="grid grid-cols-2 gap-2 pl-3 border-l-2 border-gray-100 dark:border-white/5">
                    <div>
                        <span className="text-xs text-gray-400 mb-1 block">Значение</span>
                        <input 
                            type="text" 
                            value={config.trendValue}
                            onChange={(e) => update('trendValue', e.target.value)}
                            className={inputClass}
                        />
                    </div>
                    <div>
                        <span className="text-xs text-gray-400 mb-1 block">Вектор</span>
                        <select 
                            value={config.trendDirection}
                            onChange={(e) => update('trendDirection', e.target.value)}
                            className={selectClass}
                        >
                            <option value="up">Рост</option>
                            <option value="down">Падение</option>
                            <option value="neutral">Нейтр.</option>
                        </select>
                    </div>
                </div>
            )}

            {/* Classic Theme Colors */}
            {config.template === 'classic' && (
                <div className="pt-2">
                    <span className="text-xs text-gray-400 mb-2 block ml-1">Цветовая тема</span>
                    <div className="grid grid-cols-4 gap-2">
                        {COLORS.map(color => (
                            <button
                                key={color}
                                onClick={() => update('colorTheme', color)}
                                className={`h-8 rounded-lg border-2 transition-all ${
                                    config.colorTheme === color ? 'border-gray-500 dark:border-white scale-110' : 'border-transparent'
                                }`}
                                style={{ backgroundColor: `var(--color-${color}-500, ${getColorCode(color)})` }}
                                title={color}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Gradient Theme Colors */}
            {config.template === 'gradient' && (
                <div className="grid grid-cols-2 gap-3 pt-2">
                    <div>
                        <span className="text-xs text-gray-400 mb-1 block ml-1">Градиент От</span>
                        <select 
                            value={config.gradientFrom}
                            onChange={(e) => update('gradientFrom', e.target.value)}
                            className={selectClass}
                        >
                             {COLORS.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div>
                        <span className="text-xs text-gray-400 mb-1 block ml-1">Градиент До</span>
                        <select 
                            value={config.gradientTo}
                            onChange={(e) => update('gradientTo', e.target.value)}
                            className={selectClass}
                        >
                             {COLORS.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                </div>
            )}
        </div>
      </Section>

      {/* 5. Size Settings (New) */}
      <Section 
        title="Размер" 
        icon={<Maximize size={14} />} 
        isOpen={openSections.size} 
        onToggle={() => toggleSection('size')}
      >
        <div className="grid grid-cols-2 gap-3">
            <div>
                <span className="text-xs text-gray-400 mb-1 block ml-1">Ширина</span>
                <select 
                    value={config.width}
                    onChange={(e) => update('width', e.target.value)}
                    className={selectClass}
                >
                    <option value="100%">Full (100%)</option>
                    <option value="50%">1/2 (50%)</option>
                    <option value="33%">1/3 (33%)</option>
                    <option value="25%">1/4 (25%)</option>
                    <option value="300px">300px</option>
                    <option value="400px">400px</option>
                    <option value="500px">500px</option>
                </select>
            </div>
            <div>
                <span className="text-xs text-gray-400 mb-1 block ml-1">Высота</span>
                <select 
                    value={config.height}
                    onChange={(e) => update('height', e.target.value)}
                    className={selectClass}
                >
                    <option value="auto">Auto</option>
                    <option value="150px">150px</option>
                    <option value="200px">200px</option>
                    <option value="250px">250px</option>
                    <option value="300px">300px</option>
                    <option value="100%">100%</option>
                </select>
            </div>
        </div>
      </Section>

    </div>
  );
};

function getColorCode(colorName: string) {
    const map: Record<string, string> = {
        blue: '#3b82f6', emerald: '#10b981', violet: '#8b5cf6', 
        orange: '#f97316', pink: '#ec4899', red: '#ef4444', 
        cyan: '#06b6d4', slate: '#64748b'
    };
    return map[colorName] || '#ccc';
}

export default CardConfigPanel;