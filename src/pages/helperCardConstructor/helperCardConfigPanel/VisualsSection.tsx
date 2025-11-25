import React from 'react';
import * as Icons from 'lucide-react';
import { CardConfig } from '../../../types/card';
import { selectClass, inputClass } from './styles';

interface VisualsSectionProps {
  config: CardConfig;
  setConfig: (c: CardConfig) => void;
}

const COLORS = ['blue', 'emerald', 'violet', 'orange', 'pink', 'red', 'cyan', 'slate'];
const ICONS = ['Users', 'DollarSign', 'Activity', 'CreditCard', 'ShoppingCart', 'TrendingUp', 'Target', 'Zap', 'ArrowUpRight', 'ArrowDownRight', 'Building', 'MapPin', 'LayoutList'];

const VisualsSection: React.FC<VisualsSectionProps> = ({ config, setConfig }) => {
  const update = (key: keyof CardConfig, value: any) => {
    setConfig({ ...config, [key]: value });
  };

  return (
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
  );
};

export default VisualsSection;
