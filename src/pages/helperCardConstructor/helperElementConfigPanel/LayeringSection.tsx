import React from 'react';
import { Layers, ArrowUp, ArrowDown } from 'lucide-react';
import { labelClass, inputClass, sectionClass } from './styles';
import { CardElementStyle } from '../../../types/card';

interface LayeringSectionProps {
  style: CardElementStyle;
  onUpdate: (key: keyof CardElementStyle, value: any) => void;
}

const LayeringSection: React.FC<LayeringSectionProps> = ({ style, onUpdate }) => {
  return (
    <div className={sectionClass}>
      <span className={labelClass}><Layers size={10} className="inline mr-1" /> Слои и Вид</span>
      <div className="grid grid-cols-2 gap-2 mb-2">
        <div>
          <span className="text-[9px] text-gray-400 mb-0.5 block">Z-Index</span>
          <div className="flex items-center gap-1">
            <button onClick={() => onUpdate('zIndex', (style.zIndex || 1) - 1)} className="p-1.5 bg-white dark:bg-[#1e2433] rounded border border-gray-200 dark:border-white/10 hover:bg-gray-100"><ArrowDown size={12} /></button>
            <span className="text-xs font-mono w-6 text-center">{style.zIndex || 1}</span>
            <button onClick={() => onUpdate('zIndex', (style.zIndex || 1) + 1)} className="p-1.5 bg-white dark:bg-[#1e2433] rounded border border-gray-200 dark:border-white/10 hover:bg-gray-100"><ArrowUp size={12} /></button>
          </div>
        </div>
        <div>
          <span className="text-[9px] text-gray-400 mb-0.5 block">Opacity</span>
          <input
            type="number"
            step="0.1"
            min="0"
            max="1"
            value={style.opacity ?? 1}
            onChange={(e) => onUpdate('opacity', parseFloat(e.target.value))}
            className={inputClass}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <span className="text-[9px] text-gray-400 mb-0.5 block">Radius</span>
          <input
            type="number"
            value={style.borderRadius || 0}
            onChange={(e) => onUpdate('borderRadius', parseFloat(e.target.value))}
            className={inputClass}
          />
        </div>
        <div>
          <span className="text-[9px] text-gray-400 mb-0.5 block">Padding</span>
          <input
            type="number"
            value={style.padding || 0}
            onChange={(e) => onUpdate('padding', parseFloat(e.target.value))}
            className={inputClass}
          />
        </div>
      </div>
    </div>
  );
};

export default LayeringSection;