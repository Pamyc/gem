
import React, { useMemo, useState } from 'react';
import { CardConfig } from '../../../../types/card';
import { CalculationResult } from '../../DynamicCard';
import { useDataStore } from '../../../../contexts/DataContext';
import CardElementRenderer from './CardElementRenderer';
import DetailsModal from './DetailsModal';

interface CustomCardProps {
  config: CardConfig;
  globalData: CalculationResult;
  containerStyle: React.CSSProperties;
}

const CustomCard: React.FC<CustomCardProps> = ({ config, globalData, containerStyle }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { googleSheets, sheetConfigs } = useDataStore();
  
  // Helper for gradients
  const getColor = (c: string) => {
     const map: any = { blue: '#3b82f6', violet: '#8b5cf6', pink: '#ec4899', orange: '#f97316', emerald: '#10b981', red: '#ef4444', cyan: '#06b6d4', slate: '#64748b', fuchsia: '#d946ef', amber: '#f59e0b', teal: '#14b8a6', purple: '#a855f7' };
     return map[c] || c || '#3b82f6';
  };

  // Determine Background
  let backgroundStyle = config.backgroundColor || '#ffffff';
  if (config.gradientFrom && config.gradientTo && (!config.backgroundColor || config.backgroundColor === '#ffffff')) {
      backgroundStyle = `linear-gradient(135deg, ${getColor(config.gradientFrom)}, ${getColor(config.gradientTo)})`;
  }

  // Calculate Auto Height for Absolute Layout
  const computedHeight = useMemo(() => {
    if (config.height !== 'auto') return undefined;
    if (!config.elements || config.elements.length === 0) return 150; // Default min height

    let maxBottom = 0;
    
    config.elements.forEach(el => {
      const top = el.style.top || 0;
      let height = 0;
      
      // Try to determine height
      if (typeof el.style.height === 'number') {
        height = el.style.height;
      } else {
        // Estimation for auto-height elements based on content type
        if (el.type === 'icon') {
            const width = typeof el.style.width === 'number' ? el.style.width : 0;
            const fontSize = el.style.fontSize || 24;
            const baseSize = width || fontSize;
            const padding = el.style.padding || 0;
            height = baseSize + (padding * 2);
        } else {
            // Text / Value / Title / Trend
            const fontSize = el.style.fontSize || 14;
            // Line height approximation (~1.4x)
            const padding = el.style.padding || 0;
            height = (fontSize * 1.4) + (padding * 2);
        }
      }
      
      if (top + height > maxBottom) {
        maxBottom = top + height;
      }
    });

    // Add some bottom padding
    return Math.max(maxBottom + 24, 100); 
  }, [config.elements, config.height]);


  // Base Container Style
  const baseStyle: React.CSSProperties = {
    ...containerStyle,
    position: 'relative',
    overflow: 'hidden',
    background: backgroundStyle, // Use background shorthand to support gradients
    border: config.borderColor ? `1px solid ${config.borderColor}` : undefined,
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    borderRadius: '1rem',
    // Apply computed height if auto is requested
    height: computedHeight ? `${computedHeight}px` : containerStyle.height,
    minHeight: computedHeight ? `${computedHeight}px` : containerStyle.minHeight,
    cursor: 'pointer', // Indicate clickable
    userSelect: 'none'
  };

  // Calculate Data Contexts for Modal (Support multiple data sources like Min/Max and Variables)
  const dataContexts = useMemo(() => {
    const contexts: Array<{ name: string, config: CardConfig }> = [];

    // Helper to add context with deduplication
    const addContext = (name: string, ctxConfig: CardConfig) => {
        const isDuplicate = contexts.some(ctx => 
            ctx.config.sheetKey === ctxConfig.sheetKey && 
            ctx.config.dataColumn === ctxConfig.dataColumn &&
            ctx.config.aggregation === ctxConfig.aggregation &&
            JSON.stringify(ctx.config.filters) === JSON.stringify(ctxConfig.filters)
        );

        if (!isDuplicate) {
            contexts.push({ name, config: ctxConfig });
        }
    };

    // 1. Scan elements for data bindings
    config.elements.forEach((el, idx) => {
        // We are interested in elements that define a data source (Value type)
        if (el.type === 'value' && el.dataSettings) {
             
             // A. Check for Variables (Formula Mode)
             if (el.dataSettings.variables && el.dataSettings.variables.length > 0) {
                 el.dataSettings.variables.forEach(variable => {
                     if (variable.sheetKey && variable.dataColumn) {
                         const variableConfig: CardConfig = {
                             ...config,
                             sheetKey: variable.sheetKey,
                             dataColumn: variable.dataColumn,
                             aggregation: variable.aggregation,
                             filters: variable.filters || []
                         };
                         addContext(`Переменная {${variable.name}}`, variableConfig);
                     }
                 });
             }

             // B. Check for Standard Data Binding (Simple Mode)
             const sheetKey = el.dataSettings.sheetKey || (el.dataSettings.variables ? '' : config.sheetKey);
             const dataColumn = el.dataSettings.dataColumn || (el.dataSettings.variables ? '' : config.dataColumn);
             
             // Only add if explicit sheet/column exists AND it's not just a container for variables
             // (If it has variables, the direct dataSettings might be empty/unused)
             if (sheetKey && dataColumn) {
                 const mergedConfig: CardConfig = {
                     ...config,
                     sheetKey,
                     dataColumn,
                     aggregation: el.dataSettings.aggregation || config.aggregation,
                     filters: el.dataSettings.filters || config.filters
                 };
                 
                 let name = el.dataBind ? el.dataBind.toUpperCase() : `Значение ${idx + 1}`;
                 
                 // Formatting friendly names
                 if (el.dataBind === 'min') name = 'Минимум';
                 else if (el.dataBind === 'max') name = 'Максимум';
                 else if (el.dataBind === 'value' || !el.dataBind) {
                    name = dataColumn; 
                 }

                 addContext(name, mergedConfig);
             }
        }
    });

    // 2. If no element-specific contexts found, check global config
    if (contexts.length === 0 && config.sheetKey && config.dataColumn) {
         contexts.push({ name: 'Общие данные', config: config });
    }
    
    return contexts;
  }, [config]);

  return (
    <>
      <div 
        style={baseStyle} 
        onDoubleClick={() => setIsModalOpen(true)}
        className="group hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
        title="Двойной клик для просмотра деталей"
      >
        {config.elements.map(el => (
          <CardElementRenderer 
            key={el.id} 
            element={el} 
            config={config} 
            globalData={globalData} 
            googleSheets={googleSheets}
            sheetConfigs={sheetConfigs}
          />
        ))}
      </div>

      <DetailsModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        config={config} // Default fallback
        dataContexts={dataContexts}
      />
    </>
  );
};

export default CustomCard;
