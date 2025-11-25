
import React from 'react';
import * as Icons from 'lucide-react';
import { CardConfig } from '../../../types/card';
import { CalculationResult } from '../DynamicCard';

interface GradientCardProps {
  config: CardConfig;
  data: CalculationResult;
  containerStyle: React.CSSProperties;
}

const GradientCard: React.FC<GradientCardProps> = ({ config, data, containerStyle }) => {
  const IconComponent = (Icons as any)[config.icon] || Icons.HelpCircle;
  const TrendIcon = config.trendDirection === 'up' ? Icons.TrendingUp : 
                   config.trendDirection === 'down' ? Icons.TrendingDown : Icons.Minus;

  const getColor = (c: string) => {
     const map: any = { blue: '#3b82f6', violet: '#8b5cf6', pink: '#ec4899', orange: '#f97316', emerald: '#10b981', red: '#ef4444', cyan: '#06b6d4', slate: '#64748b' };
     return map[c] || '#3b82f6';
  };

  // Gradient Logic: Use overrides if present, otherwise use presets
  const bgStyle = config.backgroundColor 
      ? { background: config.backgroundColor } 
      : { background: `linear-gradient(135deg, ${getColor(config.gradientFrom)}, ${getColor(config.gradientTo)})` };
  
  const shadowColor = getColor(config.gradientTo);
  const borderStyle = config.borderColor ? { border: `1px solid ${config.borderColor}` } : {};

  // Typography Overrides
  const titleStyle = {
      fontSize: config.titleFontSize || undefined,
      color: config.titleColor || undefined, // default is white/80
  };

  const valueStyle = {
      fontSize: config.valueFontSize || undefined,
      color: config.valueColor || undefined, // default is white
  };
  
  const iconStyle = {
      color: config.iconColor || 'white',
  };

  const iconContainerStyle = {
      backgroundColor: config.iconBackgroundColor || 'rgba(255,255,255,0.2)',
  };

  return (
      <div 
        className="rounded-2xl p-6 text-white shadow-lg relative overflow-hidden transition-all duration-300"
        style={{ 
            ...containerStyle, 
            ...bgStyle, 
            ...borderStyle,
            boxShadow: config.backgroundColor ? 'none' : `0 10px 25px -5px ${shadowColor}40` 
        }}
      >
         {/* Decorative Blur (Only show if no custom background color is set to avoid clashes) */}
         {!config.backgroundColor && (
             <>
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-20 rounded-full blur-2xl"></div>
                <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-20 h-20 bg-black opacity-10 rounded-full blur-2xl"></div>
             </>
         )}

         <div className="relative z-10 flex flex-col h-full justify-between gap-4">
            <div className="flex justify-between items-start">
                <div 
                    className={`p-2 rounded-lg backdrop-blur-sm shrink-0 ${config.showIcon ? 'block' : 'hidden'}`}
                    style={iconContainerStyle}
                >
                    <IconComponent 
                        size={config.iconSize || 24} 
                        style={iconStyle}
                    />
                </div>
                {config.showTrend && (
                    <div className="flex items-center gap-1 text-sm font-bold bg-black/20 px-2 py-1 rounded-lg backdrop-blur-sm shrink-0 ml-auto">
                         <TrendIcon size={14} /> {config.trendValue}
                    </div>
                )}
            </div>
            
            <div className="overflow-hidden mt-auto">
                <h3 
                    className="text-4xl font-bold mb-1 tracking-tight truncate" 
                    title={String(data.displayValue)}
                    style={valueStyle}
                >
                    {data.displayValue}
                </h3>
                <p 
                    className="text-white/80 text-sm font-medium truncate"
                    style={titleStyle}
                >
                    {config.title}
                </p>
            </div>
         </div>
      </div>
  );
};

export default GradientCard;
