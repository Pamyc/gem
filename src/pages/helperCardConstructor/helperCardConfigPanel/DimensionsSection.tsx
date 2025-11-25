import React from 'react';
import { CardConfig } from '../../../types/card';
import { inputClass } from './styles';

interface DimensionsSectionProps {
  config: CardConfig;
  setConfig: (c: CardConfig) => void;
}

const DimensionsSection: React.FC<DimensionsSectionProps> = ({ config, setConfig }) => {
  const update = (key: keyof CardConfig, value: any) => {
    setConfig({ ...config, [key]: value });
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <span className="text-xs text-gray-400 mb-1 block ml-1">Ширина</span>
          <input 
            type="text" 
            value={config.width}
            onChange={(e) => update('width', e.target.value)}
            placeholder="100%, 300px..."
            className={inputClass}
          />
        </div>
        <div>
          <span className="text-xs text-gray-400 mb-1 block ml-1">Высота</span>
          <input 
            type="text" 
            value={config.height}
            onChange={(e) => update('height', e.target.value)}
            placeholder="auto, 200px..."
            className={inputClass}
          />
        </div>
      </div>
      <p className="text-[10px] text-gray-400 ml-1 leading-relaxed">
        Укажите <b>auto</b> для автоматической высоты (только для шаблона Custom) или фиксированное значение (напр. <b>150px</b>).
      </p>
    </div>
  );
};

export default DimensionsSection;