import React from 'react';
import { labelClass, inputClass, sectionClass } from './styles';
import { CardElementStyle } from '../../../types/card';

interface DimensionsSectionProps {
  style: CardElementStyle;
  onUpdate: (key: keyof CardElementStyle, value: any) => void;
}

const DimensionsSection: React.FC<DimensionsSectionProps> = ({ style, onUpdate }) => {
  return (
    <div className={sectionClass}>
      <span className={labelClass}>Размеры (Width / Height)</span>
      <div className="grid grid-cols-2 gap-2">
        <div className="relative">
          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">W</span>
          <input
            type="number"
            value={style.width === 'auto' ? '' : style.width}
            onChange={(e) => onUpdate('width', e.target.value === '' ? 'auto' : Number(e.target.value))}
            className={`${inputClass} pl-6`}
            placeholder="Auto"
          />
        </div>
        <div className="relative">
          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">H</span>
          <input
            type="number"
            value={style.height === 'auto' ? '' : style.height}
            onChange={(e) => onUpdate('height', e.target.value === '' ? 'auto' : Number(e.target.value))}
            className={`${inputClass} pl-6`}
            placeholder="Auto"
          />
        </div>
      </div>
      <p className="text-[10px] text-gray-400 mt-1 italic">Можно тянуть за углы для изменения</p>
    </div>
  );
};

export default DimensionsSection;