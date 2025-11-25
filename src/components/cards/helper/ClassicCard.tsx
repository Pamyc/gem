
import React from 'react';
import * as Icons from 'lucide-react';
import { CardConfig } from '../../../types/card';
import { CalculationResult } from '../DynamicCard';

interface ClassicCardProps {
  config: CardConfig;
  data: CalculationResult;
  containerStyle: React.CSSProperties;
}

const ClassicCard: React.FC<ClassicCardProps> = ({ config, data, containerStyle }) => {
  const IconComponent = (Icons as any)[config.icon] || Icons.HelpCircle;
  
  const TrendIcon = config.trendDirection === 'up' ? Icons.TrendingUp : 
                   config.trendDirection === 'down' ? Icons.TrendingDown : Icons.Minus;

  // --- Style Defaults based on Theme (Fallback) ---
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

  // Default Tailwind Classes
  const defaultIconBgClass = bgMap[config.colorTheme] || bgMap.blue;
  const defaultIconColorClass = textMap[config.colorTheme] || textMap.blue;
  const defaultTrendBgClass = config.trendDirection === 'up' ? 'bg-emerald-100 dark:bg-emerald-500/20' :
                  config.trendDirection === 'down' ? 'bg-red-100 dark:bg-red-500/20' : 'bg-gray-100 dark:bg-gray-500/20';
  const defaultTrendColorClass = config.trendDirection === 'up' ? 'text-emerald-600 dark:text-emerald-400' :
                     config.trendDirection === 'down' ? 'text-red-600 dark:text-red-400' : 'text-gray-500';

  // --- Overrides ---
  const customBgStyle = config.backgroundColor ? { backgroundColor: config.backgroundColor } : {};
  const customBorderStyle = config.borderColor ? { borderColor: config.borderColor } : {};
  
  const titleStyle = {
      fontSize: config.titleFontSize || undefined,
      color: config.titleColor || undefined,
  };

  const valueStyle = {
      fontSize: config.valueFontSize || undefined,
      color: config.valueColor || undefined,
  };

  const iconContainerStyle = {
      backgroundColor: config.iconBackgroundColor || undefined,
  };
  const iconStyle = {
      color: config.iconColor || undefined,
  };

  return (
    <div 
      className="bg-white dark:bg-[#151923] p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-white/5 flex flex-col gap-3 transition-all duration-300"
      style={{ ...containerStyle, ...customBgStyle, ...customBorderStyle }}
    >
      <div className="flex justify-between items-start h-full">
         <div className="overflow-hidden flex flex-col justify-center h-full">
           <p 
              className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate"
              style={titleStyle}
           >
              {config.title}
           </p>
           <h3 
              className="text-3xl font-bold text-gray-900 dark:text-white mt-1 truncate" 
              title={String(data.displayValue)}
              style={valueStyle}
           >
              {data.displayValue}
           </h3>
         </div>
         
         {config.showIcon && (
           <div 
              className={`p-3 rounded-xl shrink-0 ml-3 ${!config.iconBackgroundColor ? defaultIconBgClass : ''}`}
              style={iconContainerStyle}
           >
              <IconComponent 
                  size={config.iconSize || 24} 
                  className={!config.iconColor ? defaultIconColorClass : ''}
                  style={iconStyle}
              />
           </div>
         )}
      </div>

      {config.showTrend && (
         <div className="flex items-center gap-2 mt-auto">
            <span className={`text-xs font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shrink-0 ${defaultTrendBgClass} ${defaultTrendColorClass}`}>
               <TrendIcon size={12} /> {config.trendValue}
            </span>
            <span className="text-xs text-gray-400 truncate">к прошлому периоду</span>
         </div>
      )}
    </div>
  );
};

export default ClassicCard;
