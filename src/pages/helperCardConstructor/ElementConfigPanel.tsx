import React from 'react';
import { CardElement } from '../../types/card';
import { SheetConfig } from '../../contexts/DataContext';
import HeaderSection from './helperElementConfigPanel/HeaderSection';
import DataConfigSection from './helperElementConfigPanel/DataConfigSection';
import TextContentSection from './helperElementConfigPanel/TextContentSection';
import IconSelectionSection from './helperElementConfigPanel/IconSelectionSection';
import PositionSection from './helperElementConfigPanel/PositionSection';
import DimensionsSection from './helperElementConfigPanel/DimensionsSection';
import TypographySection from './helperElementConfigPanel/TypographySection';
import ColorSection from './helperElementConfigPanel/ColorSection';
import LayeringSection from './helperElementConfigPanel/LayeringSection';

interface ElementConfigPanelProps {
  element: CardElement;
  onUpdate: (updates: Partial<CardElement['style']> | Partial<CardElement>) => void;
  onDelete: () => void;
  // Context for resolving data columns based on selection
  googleSheets: any;
  sheetConfigs: SheetConfig[];
  globalSheetKey: string;
}

const ElementConfigPanel: React.FC<ElementConfigPanelProps> = ({ 
  element, 
  onUpdate, 
  onDelete, 
  googleSheets, 
  sheetConfigs, 
  globalSheetKey 
}) => {
  
  const updateStyle = (key: keyof CardElement['style'], value: any) => {
     onUpdate({ style: { ...element.style, [key]: value } });
  };

  const updateElement = (updates: Partial<CardElement>) => {
    onUpdate(updates);
  };

  return (
    <div className="bg-gray-50 dark:bg-[#0b0f19] p-4 rounded-xl border border-gray-200 dark:border-white/10 space-y-3 animate-in fade-in slide-in-from-right-4 h-full overflow-y-auto custom-scrollbar">
       
       {/* Header */}
       <HeaderSection type={element.type} onDelete={onDelete} />

       {/* DATA CONFIGURATION (Only for Value type) */}
       {element.type === 'value' && (
         <DataConfigSection 
           element={element}
           onUpdate={updateElement}
           googleSheets={googleSheets}
           sheetConfigs={sheetConfigs}
           globalSheetKey={globalSheetKey}
         />
       )}

       {/* Content Edit for Text */}
       {element.type === 'text' && (
         <TextContentSection 
           content={element.content}
           onUpdate={(content) => updateElement({ content })}
         />
       )}

       {/* Icon Selection */}
       {element.type === 'icon' && (
         <IconSelectionSection 
           currentIcon={element.iconName}
           onUpdate={(iconName) => updateElement({ iconName })}
         />
       )}

       {/* Position */}
       <PositionSection style={element.style} onUpdate={updateStyle} />

       {/* Dimensions */}
       <DimensionsSection style={element.style} onUpdate={updateStyle} />

       {/* Typography */}
       {element.type !== 'icon' && element.type !== 'shape' && (
         <TypographySection style={element.style} onUpdate={updateStyle} />
       )}

       {/* Colors */}
       <ColorSection style={element.style} onUpdate={updateStyle} />

       {/* Alignment & Layering */}
       <LayeringSection style={element.style} onUpdate={updateStyle} />

    </div>
  );
};

export default ElementConfigPanel;