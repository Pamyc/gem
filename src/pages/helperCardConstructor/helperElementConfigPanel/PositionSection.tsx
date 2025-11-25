import React from 'react';
import { Move } from 'lucide-react';
import { labelClass, inputClass } from './styles';
import { CardElementStyle } from '../../../types/card';

interface PositionSectionProps {
  style: CardElementStyle;
  onUpdate: (key: keyof CardElementStyle, value: any) => void;
}

const PositionSection: React.FC<PositionSectionProps> = ({ style, onUpdate }) => {
  return (
    <div>
      <span className={labelClass}>Позиция (X / Y)</span>
      <div className="grid grid-cols-2 gap-2">
        <div className="relative">
          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs"><Move size={10} /></span>
          <input
            type="number"
            value={style.top}
            onChange={(e) => onUpdate('top', Number(e.target.value))}
            className={`${inputClass} pl-6`}
            placeholder="Top"
          />
        </div>
        <div className="relative">
          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs"><Move size={10} className="rotate-90" /></span>
          <input
            type="number"
            value={style.left}
            onChange={(e) => onUpdate('left', Number(e.target.value))}
            className={`${inputClass} pl-6`}
            placeholder="Left"
          />
        </div>
      </div>
    </div>
  );
};

export default PositionSection;