import React from 'react';
import { Palette } from 'lucide-react';
import { labelClass, inputClass, sectionClass } from './styles';
import { CardElementStyle } from '../../../types/card';

interface ColorSectionProps {
  style: CardElementStyle;
  onUpdate: (key: keyof CardElementStyle, value: any) => void;
}

const ColorSection: React.FC<ColorSectionProps> = ({ style, onUpdate }) => {
  return (
    <div className={sectionClass}>
      <span className={labelClass}><Palette size={10} className="inline mr-1" /> Цвета</span>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <span className="text-[9px] text-gray-400 mb-0.5 block">Основной</span>
          <div className="flex items-center gap-1">
            <input
              type="color"
              value={style.color || '#000000'}
              onChange={(e) => onUpdate('color', e.target.value)}
              className="w-6 h-6 rounded cursor-pointer border border-gray-200 dark:border-white/10 p-0.5 bg-transparent"
            />
            <input
              type="text"
              value={style.color || ''}
              onChange={(e) => onUpdate('color', e.target.value)}
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
              value={style.backgroundColor || '#ffffff'}
              onChange={(e) => onUpdate('backgroundColor', e.target.value)}
              className="w-6 h-6 rounded cursor-pointer border border-gray-200 dark:border-white/10 p-0.5 bg-transparent"
            />
            <div className="text-[10px] text-gray-400 truncate">
              {style.backgroundColor || 'none'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorSection;