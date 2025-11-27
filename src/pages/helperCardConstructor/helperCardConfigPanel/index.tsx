
import React, { useState } from 'react';
import { Palette, Type, Database, PaintBucket, LayoutTemplate, Scaling } from 'lucide-react';
import { CardConfig } from '../../../types/card';
import { SheetConfig } from '../../../contexts/DataContext';
import { useDataStore } from '../../../contexts/DataContext';

import CollapsibleSection from './CollapsibleSection';
import PresetSection from './PresetSection';
import DataSourceSection from './DataSourceSection';
import TextFormatSection from './TextFormatSection';
import VisualsSection from './VisualsSection';
import StylingSection from './StylingSection';
import DimensionsSection from './DimensionsSection';

interface CardConfigPanelProps {
  config: CardConfig;
  setConfig: (c: CardConfig) => void;
  sheetConfigs?: SheetConfig[];
  availableColumns?: string[];
  rows?: any[][];
}

const CardConfigPanel: React.FC<CardConfigPanelProps> = ({ 
  config, 
  setConfig,
  sheetConfigs = [],
  availableColumns = [],
  rows = [] 
}) => {
  const { googleSheets } = useDataStore();
  
  const [openSections, setOpenSections] = useState({
    preset: true,
    dimensions: false,
    source: true,
    text: false,
    visuals: false,
    styling: false
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <div className="h-full overflow-y-auto pr-2 custom-scrollbar">
      
      {/* 1. Preset Selection */}
      <CollapsibleSection 
        title="Макет и Стиль" 
        icon={<LayoutTemplate size={14} />} 
        isOpen={openSections.preset} 
        onToggle={() => toggleSection('preset')}
      >
        <PresetSection config={config} setConfig={setConfig} />
      </CollapsibleSection>

      {/* 2. Dimensions */}
      <CollapsibleSection 
        title="Размеры" 
        icon={<Scaling size={14} />} 
        isOpen={openSections.dimensions} 
        onToggle={() => toggleSection('dimensions')}
      >
        <DimensionsSection config={config} setConfig={setConfig} />
      </CollapsibleSection>

      {/* 3. Data Source Settings */}
      <CollapsibleSection 
        title="Основной источник" 
        icon={<Database size={14} />} 
        isOpen={openSections.source} 
        onToggle={() => toggleSection('source')}
      >
        <DataSourceSection 
          config={config} 
          setConfig={setConfig} 
          sheetConfigs={sheetConfigs}
          availableColumns={availableColumns}
          rows={rows}
        />
      </CollapsibleSection>

      {/* 4. Text & Formatting */}
      <CollapsibleSection 
        title="Текст и Формат" 
        icon={<Type size={14} />} 
        isOpen={openSections.text} 
        onToggle={() => toggleSection('text')}
      >
        <TextFormatSection config={config} setConfig={setConfig} />
      </CollapsibleSection>

      {/* 5. Visuals */}
      <CollapsibleSection 
        title="Визуализация" 
        icon={<Palette size={14} />} 
        isOpen={openSections.visuals} 
        onToggle={() => toggleSection('visuals')}
      >
        <VisualsSection config={config} setConfig={setConfig} />
      </CollapsibleSection>

      {/* 6. Styling Overrides */}
      <CollapsibleSection 
        title="Фон и Рамка" 
        icon={<PaintBucket size={14} />} 
        isOpen={openSections.styling} 
        onToggle={() => toggleSection('styling')}
      >
        <StylingSection config={config} setConfig={setConfig} />
      </CollapsibleSection>

    </div>
  );
};

export default CardConfigPanel;
