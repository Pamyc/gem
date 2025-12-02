
import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Building } from 'lucide-react';
import { CitySummaryItem, ColorMode, SEPARATOR, STATUS_COLORS, TooltipData, JKItem, LiterItem } from './types';
import { getTooltipHtml } from './useChartOptions';

interface SideListProps {
  citySummary: CitySummaryItem[];
  totalElevators: number;
  expandedCity: string | null;
  toggleCity: (name: string) => void;
  expandedJK: string | null;
  toggleJK: (name: string) => void;
  onHoverItem: (name: string) => void;
  onLeaveItem: (name: string) => void;
  colorMode: ColorMode;
}

const SideList: React.FC<SideListProps> = ({
  citySummary,
  totalElevators,
  expandedCity,
  toggleCity,
  expandedJK,
  toggleJK,
  onHoverItem,
  onLeaveItem,
  colorMode
}) => {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; content: string } | null>(null);

  const handleMouseMove = (
      e: React.MouseEvent, 
      title: string, 
      item: CitySummaryItem | JKItem | LiterItem
  ) => {
    
    const data: TooltipData = {
        value: item.value,
        floors: item.floors,
        profit: item.profit,
        percent: item.percent,
        percentFloors: item.percentFloors,
        percentProfit: item.percentProfit,
        
        incomeFact: item.incomeFact,
        expenseFact: item.expenseFact,
        incomeLO: item.incomeLO,
        expenseLO: item.expenseLO,
        incomeObr: item.incomeObr,
        expenseObr: item.expenseObr,
        incomeMont: item.incomeMont,
        expenseMont: item.expenseMont,
        rentability: item.rentability,
        profitPerLift: item.profitPerLift,
    };

    const htmlContent = getTooltipHtml(title, data, true);

    // --- Dynamic Positioning Logic ---
    const tooltipHeight = 450; // Estimated height for expanded tooltip
    const windowHeight = window.innerHeight;
    const clientY = e.clientY;

    let top = clientY + 10;
    
    // Check if tooltip overflows bottom of screen
    if (clientY + tooltipHeight + 20 > windowHeight) {
       // Flip to top
       top = clientY - tooltipHeight - 10;
       
       // Safety: Ensure it doesn't go off top edge
       if (top < 10) top = 10;
    }

    setTooltip({
      x: e.clientX,
      y: top,
      content: htmlContent
    });
  };

  const handleMouseLeave = () => {
    setTooltip(null);
  };

  return (
    <>
      <div className="w-1/3 min-w-[220px] h-full overflow-y-auto custom-scrollbar border-r border-gray-100 dark:border-white/5 pr-4 pl-2 py-2 animate-in slide-in-from-left-4 duration-500 relative">
        <div className="flex items-center justify-between sticky top-0 bg-white dark:bg-[#151923] py-2 z-10 mb-2 border-b border-gray-100 dark:border-white/5">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Рейтинг городов
          </h4>
          {totalElevators > 0 && (
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-bold text-gray-900 dark:text-white bg-gray-100 dark:bg-white/10 px-2 py-0.5 rounded-md font-mono">
                {totalElevators}
              </span>
            </div>
          )}
        </div>

        <div className="space-y-1">
          {citySummary.map(city => {
            const isCityExpanded = expandedCity === city.name;
            return (
              <div key={city.name} className="flex flex-col">
                {/* Level 1: City Header */}
                <div
                  onMouseEnter={() => onHoverItem(city.name)}
                  onMouseMove={(e) => handleMouseMove(e, city.name, city)}
                  onMouseLeave={() => { onLeaveItem(city.name); handleMouseLeave(); }}
                  onClick={() => toggleCity(city.name)}
                  className={`flex items-center justify-between group p-2 rounded-lg transition-all cursor-pointer ${
                    isCityExpanded
                      ? 'bg-gray-100 dark:bg-white/10 shadow-sm'
                      : 'hover:bg-gray-50 dark:hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2 overflow-hidden flex-1">
                    <div
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: city.color }}
                    />
                    <span
                      className="text-xs font-bold text-gray-700 dark:text-gray-200 truncate"
                    >
                      {city.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 pl-2">
                    <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-white/10 px-1.5 py-0.5 rounded">
                      {city.percent}%
                    </span>
                    <span className="text-xs font-bold text-gray-900 dark:text-white font-mono">
                      {city.value}
                    </span>
                    <div className="text-gray-400 group-hover:text-indigo-500 transition-colors">
                      {isCityExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </div>
                  </div>
                </div>

                {/* Level 2: JK List */}
                {isCityExpanded && (
                  <div className="pl-3 pr-1 py-1 space-y-0.5 animate-in slide-in-from-top-1 duration-200 border-l border-gray-100 dark:border-white/5 ml-3">
                    {city.jks.map((jk, idx) => {
                      const isJKExpanded = expandedJK === jk.name;
                      return (
                        <div key={`${city.name}-${jk.name}-${idx}`} className="flex flex-col">
                          
                          <div
                            className={`flex justify-between items-center px-2 py-1.5 rounded-md transition-colors cursor-pointer group/jk ${
                              isJKExpanded ? 'bg-indigo-50 dark:bg-indigo-500/10' : 'hover:bg-gray-50 dark:hover:bg-white/5'
                            }`}
                            onMouseEnter={() => onHoverItem(`${city.name}${SEPARATOR}${jk.name}`)}
                            onMouseMove={(e) => handleMouseMove(e, jk.name, jk)}
                            onMouseLeave={() => { onLeaveItem(`${city.name}${SEPARATOR}${jk.name}`); handleMouseLeave(); }}
                            onClick={(e) => { e.stopPropagation(); toggleJK(jk.name); }}
                          >
                            <div className="flex items-center gap-2 overflow-hidden flex-1">
                              <Building size={10} className="text-gray-400" />
                              <span
                                className="text-[11px] font-medium text-gray-600 dark:text-gray-300 truncate max-w-[110px]"
                              >
                                {jk.name}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500">
                                {jk.percent}%
                              </span>
                              <span className="text-[11px] font-mono text-gray-700 dark:text-gray-300 bg-white dark:bg-white/5 px-1.5 rounded border border-gray-100 dark:border-white/10">
                                {jk.value}
                              </span>
                            </div>
                          </div>

                          {/* Level 3: Liter List */}
                          {isJKExpanded && (
                            <div className="pl-3 py-0.5 space-y-0.5 animate-in slide-in-from-top-1 duration-200 border-l border-gray-100 dark:border-white/5 ml-2 mb-1">
                              {jk.liters.map((liter, lIdx) => (
                                <div
                                  key={`${city.name}-${jk.name}-${liter.name}-${lIdx}`}
                                  className="flex justify-between items-center px-2 py-1 rounded-md hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-default"
                                  onMouseEnter={() => onHoverItem(`${city.name}${SEPARATOR}${jk.name}${SEPARATOR}${liter.name}`)}
                                  onMouseMove={(e) => handleMouseMove(e, liter.name, liter)}
                                  onMouseLeave={() => { onLeaveItem(`${city.name}${SEPARATOR}${jk.name}${SEPARATOR}${liter.name}`); handleMouseLeave(); }}
                                >
                                  <div className="flex items-center gap-2 overflow-hidden">
                                    {colorMode === 'status' && (
                                      <div
                                        className={`w-1.5 h-1.5 rounded-full shrink-0`}
                                        style={{ backgroundColor: liter.isHandedOver ? STATUS_COLORS.yes : STATUS_COLORS.no }}
                                      />
                                    )}
                                    <span className="text-[10px] text-gray-500 dark:text-gray-400 truncate max-w-[90px]">
                                      {liter.name}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-[9px] font-medium text-gray-400 dark:text-gray-500">
                                      {liter.percent}%
                                    </span>
                                    <span className="text-[10px] font-mono text-gray-600 dark:text-gray-400">
                                      {liter.value}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* RENDER THE UNIFIED TOOLTIP */}
      {tooltip && (
        <div
          style={{
            position: 'fixed',
            top: tooltip.y,
            left: tooltip.x + 15,
            zIndex: 9999,
            backgroundColor: 'rgba(30, 41, 59, 0.95)',
            border: '1px solid #334155',
            borderRadius: '16px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(8px)',
            pointerEvents: 'none',
          }}
          dangerouslySetInnerHTML={{ __html: tooltip.content }}
        />
      )}
    </>
  );
};

export default SideList;
