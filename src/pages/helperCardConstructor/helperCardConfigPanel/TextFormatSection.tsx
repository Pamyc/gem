import React from 'react';
import { CardConfig } from '../../../types/card';
import { inputClass } from './styles';

interface TextFormatSectionProps {
  config: CardConfig;
  setConfig: (c: CardConfig) => void;
}

const TextFormatSection: React.FC<TextFormatSectionProps> = ({ config, setConfig }) => {
  const update = (key: keyof CardConfig, value: any) => {
    setConfig({ ...config, [key]: value });
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <span className="text-xs text-gray-400 mb-1 block ml-1">Префикс</span>
          <input 
            type="text" 
            value={config.valuePrefix}
            onChange={(e) => update('valuePrefix', e.target.value)}
            placeholder="₽, $..."
            className={inputClass}
          />
        </div>
        <div>
          <span className="text-xs text-gray-400 mb-1 block ml-1">Суффикс</span>
          <input 
            type="text" 
            value={config.valueSuffix}
            onChange={(e) => update('valueSuffix', e.target.value)}
            placeholder=" шт, %"
            className={inputClass}
          />
        </div>
      </div>

      <div className="flex items-center gap-2 pt-1">
        <input 
          type="checkbox" 
          id="compact"
          checked={config.compactNumbers}
          onChange={(e) => update('compactNumbers', e.target.checked)}
          className="w-4 h-4 rounded bg-gray-100 dark:bg-[#1e2433] border-gray-300 dark:border-white/20 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
        />
        <label htmlFor="compact" className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
           Компактные числа (1.2k, 1M)
        </label>
      </div>
    </div>
  );
};

export default TextFormatSection;
