import React from 'react';
import { CardConfig } from '../../../types/card';
import { getPresetLayout } from '../../../utils/cardPresets';
import { selectClass, inputClass } from './styles';

interface PresetSectionProps {
  config: CardConfig;
  setConfig: (c: CardConfig) => void;
}

const PresetSection: React.FC<PresetSectionProps> = ({ config, setConfig }) => {
  const update = (key: keyof CardConfig, value: any) => {
    setConfig({ ...config, [key]: value });
  };

  const applyPreset = (presetName: string) => {
    if (!presetName) return;
    const layoutUpdates = getPresetLayout(presetName as any);
    setConfig({
      ...config,
      ...layoutUpdates,
      // Keep data config intact
      sheetKey: config.sheetKey,
      dataColumn: config.dataColumn,
      aggregation: config.aggregation,
      filters: config.filters
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <span className="text-xs text-gray-400 mb-1 block ml-1 font-bold uppercase tracking-wider">Загрузить пресет</span>
        <div className="relative">
          <select 
            value=""
            onChange={(e) => applyPreset(e.target.value)}
            className={selectClass}
          >
            <option value="" disabled>Выберите стиль...</option>
            <option value="classic">Classic Clean</option>
            <option value="gradient">Vibrant Gradient</option>
            <option value="minMax">Min/Max Range</option>
          </select>
          <p className="text-[10px] text-gray-400 mt-1 ml-1">
             Выбор пресета сбросит текущее расположение элементов
          </p>
        </div>
      </div>
      
      <div>
        <span className="text-xs text-gray-400 mb-1 block ml-1 font-bold uppercase tracking-wider">Название</span>
        <input 
            type="text"
            value={config.title}
            onChange={(e) => update('title', e.target.value)}
            className={inputClass}
            placeholder="Заголовок карточки"
        />
      </div>
    </div>
  );
};

export default PresetSection;
