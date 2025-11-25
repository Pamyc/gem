import React from 'react';
import * as Icons from 'lucide-react';
import { labelClass } from './styles';

const ICONS = ['Users', 'DollarSign', 'Activity', 'CreditCard', 'ShoppingCart', 'TrendingUp', 'Target', 'Zap', 'ArrowUpRight', 'ArrowDownRight', 'Building', 'MapPin', 'LayoutList', 'CheckCircle', 'AlertCircle', 'Info', 'Settings', 'Home', 'User'];

interface IconSelectionSectionProps {
  currentIcon?: string;
  onUpdate: (iconName: string) => void;
}

const IconSelectionSection: React.FC<IconSelectionSectionProps> = ({ currentIcon, onUpdate }) => {
  return (
    <div className="mb-2">
      <span className={labelClass}>Выберите иконку</span>
      <div className="grid grid-cols-5 gap-1.5 max-h-32 overflow-y-auto custom-scrollbar p-1 bg-white dark:bg-[#1e2433] rounded-lg border border-gray-200 dark:border-white/10">
        {ICONS.map(iconName => {
          const IconComp = (Icons as any)[iconName] || Icons.HelpCircle;
          const isActive = currentIcon === iconName || (!currentIcon && iconName === 'HelpCircle');
          return (
            <button
              key={iconName}
              onClick={() => onUpdate(iconName)}
              className={`p-1.5 rounded flex items-center justify-center transition-colors ${isActive ? 'bg-indigo-100 dark:bg-indigo-500/30 text-indigo-600 dark:text-indigo-300' : 'hover:bg-gray-100 dark:hover:bg-white/5 text-gray-500'}`}
              title={iconName}
            >
              <IconComp size={16} />
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default IconSelectionSection;