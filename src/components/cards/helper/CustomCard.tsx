import React, { useMemo } from 'react';
import * as Icons from 'lucide-react';
import { CardConfig, CardElement } from '../../../types/card';
import { CalculationResult } from '../DynamicCard';
import { useDataStore } from '../../../contexts/DataContext';
import { calculateCardMetrics } from '../../../utils/cardCalculation';

interface CustomCardProps {
  config: CardConfig;
  globalData: CalculationResult;
  containerStyle: React.CSSProperties;
}

const CustomCard: React.FC<CustomCardProps> = ({ config, globalData, containerStyle }) => {
  const { googleSheets, sheetConfigs } = useDataStore();
  
  // Helper for gradients
  const getColor = (c: string) => {
     const map: any = { blue: '#3b82f6', violet: '#8b5cf6', pink: '#ec4899', orange: '#f97316', emerald: '#10b981', red: '#ef4444', cyan: '#06b6d4', slate: '#64748b', fuchsia: '#d946ef', amber: '#f59e0b', teal: '#14b8a6', purple: '#a855f7' };
     return map[c] || c || '#3b82f6';
  };

  // Determine Background
  let backgroundStyle = config.backgroundColor || '#ffffff';
  if (config.gradientFrom && config.gradientTo && !config.backgroundColor) {
      backgroundStyle = `linear-gradient(135deg, ${getColor(config.gradientFrom)}, ${getColor(config.gradientTo)})`;
  }

  // Base Container Style
  const baseStyle: React.CSSProperties = {
    ...containerStyle,
    position: 'relative',
    overflow: 'hidden',
    background: backgroundStyle, // Use background shorthand to support gradients
    border: config.borderColor ? `1px solid ${config.borderColor}` : undefined,
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    borderRadius: '1rem',
  };

  const renderElement = (el: CardElement) => {
    // Determine data source for this element (Global vs Local Override)
    let elementData = globalData;
    
    // Check if element has overrides
    if (el.dataSettings && el.type === 'value') {
        elementData = calculateCardMetrics(googleSheets, sheetConfigs, config, el.dataSettings);
    }

    const style: React.CSSProperties = {
      position: 'absolute',
      top: `${el.style.top}px`,
      left: `${el.style.left}px`,
      width: el.style.width === 'auto' ? 'auto' : `${el.style.width}px`,
      height: el.style.height === 'auto' ? 'auto' : `${el.style.height}px`,
      fontSize: el.style.fontSize ? `${el.style.fontSize}px` : undefined,
      fontWeight: el.style.fontWeight || 'normal',
      color: el.style.color,
      backgroundColor: el.style.backgroundColor,
      borderRadius: el.style.borderRadius ? `${el.style.borderRadius}px` : undefined,
      zIndex: el.style.zIndex || 1,
      opacity: el.style.opacity,
      textAlign: el.style.textAlign || 'left',
      padding: el.style.padding ? `${el.style.padding}px` : undefined,
      whiteSpace: 'nowrap',
      lineHeight: 1.2,
    };

    // Determine Content
    let content: React.ReactNode = null;

    if (el.type === 'value') {
       if (el.dataBind === 'min') content = elementData.minValue;
       else if (el.dataBind === 'max') content = elementData.maxValue;
       else content = elementData.displayValue;
    } else if (el.type === 'title') {
      content = config.title;
    } else if (el.type === 'text') {
      content = el.content || 'Текст';
    } else if (el.type === 'trend') {
      const TrendIcon = config.trendDirection === 'up' ? Icons.TrendingUp : 
                        config.trendDirection === 'down' ? Icons.TrendingDown : Icons.Minus;
      content = (
        <div className="flex items-center gap-1">
           <TrendIcon size={el.style.fontSize ? el.style.fontSize : 14} />
           <span>{config.trendValue}</span>
        </div>
      );
    } else if (el.type === 'icon') {
      const IconName = el.iconName || config.icon || 'HelpCircle';
      const IconComponent = (Icons as any)[IconName] || Icons.HelpCircle;
      // Icon size is either explicit width or derived from font size
      const iconSize = typeof el.style.width === 'number' ? '100%' : (el.style.fontSize || 24);
      content = <IconComponent size={iconSize} />;
      
      // If auto width/height, reset them so div shrinks to icon
      if (el.style.width === 'auto') style.width = undefined;
      if (el.style.height === 'auto') style.height = undefined;

    } else if (el.type === 'shape') {
        // Shapes default to 100x100 if auto
        if (el.style.width === 'auto') style.width = '100px';
        if (el.style.height === 'auto') style.height = '100px';
    }

    return (
      <div key={el.id} style={style}>
        {content}
      </div>
    );
  };

  return (
    <div style={baseStyle}>
      {config.elements.map(renderElement)}
    </div>
  );
};

export default CustomCard;