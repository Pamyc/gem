import React from 'react';
import { CardConfig } from '../../../types/card';
import { inputClass, colorInputClass } from './styles';

interface StylingSectionProps {
  config: CardConfig;
  setConfig: (c: CardConfig) => void;
}

const StylingSection: React.FC<StylingSectionProps> = ({ config, setConfig }) => {
  const update = (key: keyof CardConfig, value: any) => {
    setConfig({ ...config, [key]: value });
  };

  return (
    <div className="space-y-4">
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
  );
};

export default StylingSection;
