
import React from 'react';
import * as Icons from 'lucide-react';
import { CardConfig } from '../../../types/card';
import { CalculationResult } from '../DynamicCard';

interface MinMaxCardProps {
  config: CardConfig;
  data: CalculationResult;
  containerStyle: React.CSSProperties;
}

const MinMaxCard: React.FC<MinMaxCardProps> = ({ config, data, containerStyle }) => {
  const IconComponent = (Icons as any)[config.icon] || Icons.HelpCircle;
  const ArrowDown = Icons.ArrowDownRight;
  const ArrowUp = Icons.ArrowUpRight;

  const getColor = (c: string) => {
    const map: any = { blue: '#3b82f6', violet: '#8b5cf6', pink: '#ec4899', orange: '#f97316', emerald: '#10b981', red: '#ef4444', cyan: '#06b6d4', slate: '#64748b' };
    return map[c] || '#3b82f6';
 };

  // Background Logic
  let bgStyle: React.CSSProperties = {};
  if (config.backgroundColor) {
      bgStyle = { background: config.backgroundColor };
  } else if (config.gradientFrom && config.gradientTo) {
      bgStyle = { background: `linear-gradient(135deg, ${getColor(config.gradientFrom)}, ${getColor(config.gradientTo)})` };
  } else {
      bgStyle = { background: 'linear-gradient(to bottom right, #111827, #1e293b, #111827)' };
  }

  const borderStyle = config.borderColor ? { border: `1px solid ${config.borderColor}` } : {};

  // Typography Overrides
  const titleStyle = {
      fontSize: config.titleFontSize || undefined,
      color: config.titleColor || undefined,
  };

  const valueStyle = {
      fontSize: config.valueFontSize || undefined,
      color: config.valueColor || undefined,
  };

  const iconStyle = {
      color: config.iconColor || undefined, // Inherits parent color usually if undefined
  };

  return (
      <div 
         className="rounded-2xl p-6 text-white shadow-lg relative overflow-hidden border border-white/10 transition-all duration-300"
         style={{ 
             ...containerStyle, 
             ...bgStyle, 
             ...borderStyle,
             boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)' 
         }}
      >
         {/* Decorative Blur */}
         <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-blue-500 opacity-10 rounded-full blur-2xl"></div>

         <div className="flex flex-col h-full justify-between relative z-10">
             <div className="flex items-center gap-2 mb-4 opacity-80">
                <IconComponent 
                    size={config.iconSize || 20} 
                    style={iconStyle}
                />
                <span className="font-semibold text-sm" style={titleStyle}>{config.title}</span>
             </div>

             <div className="flex items-center gap-3 mb-2 mt-auto">
                <div className="flex items-center gap-1 text-rose-400">
                    <ArrowDown size={config.valueFontSize ? parseFloat(config.valueFontSize) * 0.6 : 20} />
                    <span className="text-2xl font-bold" style={valueStyle}>{data.minValue}</span>
                </div>
                <span className="text-gray-500 text-xl font-light">—</span>
                <div className="flex items-center gap-1 text-emerald-400">
                    <ArrowUp size={config.valueFontSize ? parseFloat(config.valueFontSize) * 0.6 : 20} />
                    <span className="text-2xl font-bold" style={valueStyle}>{data.maxValue}</span>
                </div>
             </div>
             
             <p className="text-gray-400 text-xs font-medium opacity-60">Min / Max Range</p>
         </div>
      </div>
  );
};

export default MinMaxCard;
