import React from 'react';
import * as Icons from 'lucide-react';
import { CardConfig } from '../../types/card';

interface LiveCardPreviewProps {
  config: CardConfig;
  calculatedValue?: string | number | null;
}

/**
 * @deprecated 
 * This component is now largely superseded by DynamicCard.tsx which handles both logic and rendering.
 * Keeping it here just in case you need a "dumb" renderer that accepts a value manually.
 */
const LiveCardPreview: React.FC<LiveCardPreviewProps> = ({ config, calculatedValue }) => {
  
  // Determine value to display: calculated > config placeholder > default
  const displayValue = calculatedValue !== undefined && calculatedValue !== null 
    ? `${config.valuePrefix}${calculatedValue}${config.valueSuffix}`
    : '---';

  // Dynamic Icon Component
  const IconComponent = (Icons as any)[config.icon] || Icons.HelpCircle;
  const TrendIcon = config.trendDirection === 'up' ? Icons.TrendingUp : 
                   config.trendDirection === 'down' ? Icons.TrendingDown : Icons.Minus;

  // Container Style for Size
  const containerStyle: React.CSSProperties = {
      width: config.width || '100%',
      height: config.height === 'auto' ? 'auto' : config.height,
      minHeight: config.height === 'auto' ? 'auto' : config.height, // ensure min-height for flex alignment
  };

  // --- CLASSIC TEMPLATE ---
  if (config.template === 'classic') {
    const bgMap: Record<string, string> = {
        blue: 'bg-blue-100 dark:bg-blue-900/30',
        emerald: 'bg-emerald-100 dark:bg-emerald-900/30',
        violet: 'bg-violet-100 dark:bg-violet-900/30',
        orange: 'bg-orange-100 dark:bg-orange-900/30',
        pink: 'bg-pink-100 dark:bg-pink-900/30',
        red: 'bg-red-100 dark:bg-red-900/30',
        cyan: 'bg-cyan-100 dark:bg-cyan-900/30',
        slate: 'bg-slate-100 dark:bg-slate-700/50',
    };
    
    const textMap: Record<string, string> = {
        blue: 'text-blue-600 dark:text-blue-400',
        emerald: 'text-emerald-600 dark:text-emerald-400',
        violet: 'text-violet-600 dark:text-violet-400',
        orange: 'text-orange-600 dark:text-orange-400',
        pink: 'text-pink-600 dark:text-pink-400',
        red: 'text-red-600 dark:text-red-400',
        cyan: 'text-cyan-600 dark:text-cyan-400',
        slate: 'text-slate-600 dark:text-slate-400',
    };

    const iconBg = bgMap[config.colorTheme] || bgMap.blue;
    const iconColor = textMap[config.colorTheme] || textMap.blue;

    // Trend Color Logic
    const trendColor = config.trendDirection === 'up' ? 'text-emerald-600 dark:text-emerald-400' :
                       config.trendDirection === 'down' ? 'text-red-600 dark:text-red-400' : 'text-gray-500';
    const trendBg = config.trendDirection === 'up' ? 'bg-emerald-100 dark:bg-emerald-500/20' :
                    config.trendDirection === 'down' ? 'bg-red-100 dark:bg-red-500/20' : 'bg-gray-100 dark:bg-gray-500/20';

    return (
      <div 
        className="bg-white dark:bg-[#151923] p-6 rounded-2xl shadow-lg dark:shadow-none border border-gray-200 dark:border-white/5 flex flex-col gap-3 transition-all duration-300 mx-auto max-w-full"
        style={containerStyle}
      >
        <div className="flex justify-between items-start h-full">
           <div className="overflow-hidden flex flex-col justify-center h-full">
             <p className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{config.title}</p>
             <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-1 truncate" title={String(displayValue)}>{displayValue}</h3>
           </div>
           {config.showIcon && (
             <div className={`p-3 rounded-xl ${iconBg} ${iconColor} shrink-0 ml-3`}>
                <IconComponent size={24} />
             </div>
           )}
        </div>

        {config.showTrend && (
           <div className="flex items-center gap-2 mt-auto">
              <span className={`text-xs font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shrink-0 ${trendBg} ${trendColor}`}>
                 <TrendIcon size={12} /> {config.trendValue}
              </span>
              <span className="text-xs text-gray-400 truncate">к прошлому периоду</span>
           </div>
        )}
      </div>
    );
  }

  // --- GRADIENT TEMPLATE ---
  if (config.template === 'gradient') {
      const getColor = (c: string) => {
         const map: any = { blue: '#3b82f6', violet: '#8b5cf6', pink: '#ec4899', orange: '#f97316', emerald: '#10b981', red: '#ef4444', cyan: '#06b6d4', slate: '#64748b' };
         return map[c] || '#3b82f6';
      };
      
      const gradientStyle = {
          background: `linear-gradient(135deg, ${getColor(config.gradientFrom)}, ${getColor(config.gradientTo)})`,
          ...containerStyle
      };
      
      const shadowColor = getColor(config.gradientTo);

      return (
          <div 
            className="rounded-2xl p-6 text-white shadow-xl relative overflow-hidden transition-all duration-300 mx-auto max-w-full"
            style={{ ...gradientStyle, boxShadow: `0 10px 25px -5px ${shadowColor}40` }}
          >
             {/* Decorative Blur */}
             <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-20 rounded-full blur-2xl"></div>
             <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-20 h-20 bg-black opacity-10 rounded-full blur-2xl"></div>

             <div className="relative z-10 flex flex-col h-full justify-between gap-4">
                <div className="flex justify-between items-start">
                    <div className={`p-2 bg-white/20 rounded-lg backdrop-blur-sm shrink-0 ${config.showIcon ? 'block' : 'hidden'}`}>
                        <IconComponent size={24} className="text-white" />
                    </div>
                    {config.showTrend && (
                        <div className="flex items-center gap-1 text-sm font-bold bg-black/20 px-2 py-1 rounded-lg backdrop-blur-sm shrink-0 ml-auto">
                             <TrendIcon size={14} /> {config.trendValue}
                        </div>
                    )}
                </div>
                
                <div className="overflow-hidden mt-auto">
                    <h3 className="text-4xl font-bold mb-1 tracking-tight truncate" title={String(displayValue)}>{displayValue}</h3>
                    <p className="text-white/80 text-sm font-medium truncate">{config.title}</p>
                </div>
             </div>
          </div>
      );
  }

  return null;
};

export default LiveCardPreview;