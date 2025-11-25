import React from 'react';
import * as Icons from 'lucide-react';
import { CardElement, CardConfig } from '../../../types/card';
import { CalculationResult } from '../../../components/cards/DynamicCard';

interface ElementContentProps {
  element: CardElement;
  config: CardConfig;
  displayData: CalculationResult;
}

const ElementContent: React.FC<ElementContentProps> = ({ element, config, displayData }) => {
  if (element.type === 'value') {
    if (element.dataBind === 'min') return <>{displayData.minValue}</>;
    if (element.dataBind === 'max') return <>{displayData.maxValue}</>;
    return <>{displayData.displayValue}</>;
  } 
  
  if (element.type === 'title') {
    return <>{config.title}</>;
  } 
  
  if (element.type === 'text') {
    return <>{element.content || 'Текст'}</>;
  } 
  
  if (element.type === 'trend') {
    const TrendIcon = config.trendDirection === 'up' ? Icons.TrendingUp : 
                      config.trendDirection === 'down' ? Icons.TrendingDown : Icons.Minus;
    return (
      <div className="flex items-center gap-1">
         <TrendIcon size={element.style.fontSize || 14} />
         <span>{config.trendValue}</span>
      </div>
    );
  } 
  
  if (element.type === 'icon') {
    const IconName = element.iconName || config.icon || 'HelpCircle';
    const IconComponent = (Icons as any)[IconName] || Icons.HelpCircle;
    // If width is explicitly set via resize, allow it to control svg size, otherwise font size
    const iconSize = typeof element.style.width === 'number' ? '100%' : (element.style.fontSize || 24);
    return <IconComponent size={iconSize} />;
  } 
  
  if (element.type === 'shape') {
    return null; 
  }

  return null;
};

export default ElementContent;