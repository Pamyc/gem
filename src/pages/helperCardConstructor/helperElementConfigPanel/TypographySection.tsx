import React from 'react';
import { Type } from 'lucide-react';
import { labelClass, inputClass, sectionClass } from './styles';
import { CardElementStyle } from '../../../types/card';

interface TypographySectionProps {
  style: CardElementStyle;
  onUpdate: (key: keyof CardElementStyle, value: any) => void;
}

const TypographySection: React.FC<TypographySectionProps> = ({ style, onUpdate }) => {
  return (
    <div className={sectionClass}>
      <span className={labelClass}><Type size={10} className="inline mr-1" /> Шрифт</span>
      <div className="grid grid-cols-2 gap-2 mb-2">
        <input
          type="number"
          value={style.fontSize || 14}
          onChange={(e) => onUpdate('fontSize', Number(e.target.value))}
          placeholder="Size"
          className={inputClass}
        />
        <select
          value={style.fontWeight || 'normal'}
          onChange={(e) => onUpdate('fontWeight', e.target.value)}
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
        value={style.textAlign || 'left'}
        onChange={(e) => onUpdate('textAlign', e.target.value)}
        className={inputClass}
      >
        <option value="left">Left Align</option>
        <option value="center">Center Align</option>
        <option value="right">Right Align</option>
      </select>
    </div>
  );
};

export default TypographySection;