
import React from 'react';
import * as Icons from 'lucide-react';
import { CardConfig, CardElement } from '../../../../types/card';
import { CalculationResult } from '../../DynamicCard';
import { GoogleSheetsData, SheetConfig } from '../../../../contexts/DataContext';
import { calculateCardMetrics } from '../../../../utils/cardCalculation';

interface CardElementRendererProps {
  element: CardElement;
  config: CardConfig;
  globalData: CalculationResult;
  googleSheets: GoogleSheetsData;
  sheetConfigs: SheetConfig[];
}

const CardElementRenderer: React.FC<CardElementRendererProps> = ({ 
  element, 
  config, 
  globalData,
  googleSheets,
  sheetConfigs
}) => {
  
  // Determine data source for this element (Global vs Local Override)
  let elementData = globalData;
  
  // Check if element has overrides. If so, recalculate metrics specifically for this element.
  if (element.dataSettings && element.type === 'value') {
      elementData = calculateCardMetrics(googleSheets, sheetConfigs, config, element.dataSettings);
  }

  const { style } = element;

  // Common Style Props
  const commonStyle: React.CSSProperties = {
      position: 'absolute',
      top: style.top,
      left: style.left,
      zIndex: style.zIndex || 1,
      opacity: style.opacity,
      color: style.color,
      backgroundColor: style.backgroundColor,
      fontSize: style.fontSize,
      fontWeight: style.fontWeight,
      borderRadius: style.borderRadius,
      padding: style.padding,
      textAlign: style.textAlign,
      width: style.width === 'auto' ? 'auto' : style.width,
      height: style.height === 'auto' ? 'auto' : style.height,
      whiteSpace: 'nowrap',
      display: 'flex',
      alignItems: 'center',
      justifyContent: style.textAlign === 'center' ? 'center' : (style.textAlign === 'right' ? 'flex-end' : 'flex-start')
  };

  // --- RENDER BY TYPE ---

  if (element.type === 'title') {
      return (
          <div style={commonStyle}>
              {config.title}
          </div>
      );
  }

  if (element.type === 'value') {
      let content = elementData.displayValue;
      if (element.dataBind === 'min') content = elementData.minValue;
      if (element.dataBind === 'max') content = elementData.maxValue;

      return (
          <div style={commonStyle}>
              {content}
          </div>
      );
  }

  if (element.type === 'text') {
      return (
          <div style={commonStyle}>
              {element.content || ''}
          </div>
      );
  }

  if (element.type === 'icon') {
      const IconName = element.iconName || config.icon || 'HelpCircle';
      const IconComponent = (Icons as any)[IconName] || Icons.HelpCircle;
      
      // Adjust size logic: if width/height are set, icon should fit container
      const iconSize = (typeof style.width === 'number') ? '60%' : (style.fontSize || 24);
      
      return (
          <div style={{...commonStyle, justifyContent: 'center'}}>
              <IconComponent size={iconSize} />
          </div>
      );
  }

  if (element.type === 'trend') {
      const TrendIcon = config.trendDirection === 'up' ? Icons.TrendingUp : 
                        config.trendDirection === 'down' ? Icons.TrendingDown : Icons.Minus;
      return (
          <div style={{...commonStyle, gap: '4px'}}>
              <TrendIcon size={style.fontSize || 14} />
              <span>{config.trendValue}</span>
          </div>
      );
  }

  return null;
};

export default CardElementRenderer;
