
import React from 'react';
import { ChevronDown, ChevronRight, Building } from 'lucide-react';
import { CitySummaryItem, ColorMode, SEPARATOR, STATUS_COLORS, TooltipData, JKItem, LiterItem, MetricKey, METRIC_OPTIONS } from './types';

interface SideListProps {
  citySummary: CitySummaryItem[];
  totalValue: number;
  expandedCity: string | null;
  toggleCity: (name: string) => void;
  expandedJK: string | null;
  toggleJK: (name: string) => void;
  onHoverItem: (name: string) => void; // For chart highlight
  onLeaveItem: (name: string) => void; // For chart highlight
  onHoverData: (title: string, data: TooltipData | null) => void; // Used for tooltip updates (via context menu now)
  colorMode: ColorMode;
  activeMetric: MetricKey;
}

const SideList: React.FC<SideListProps> = ({
  citySummary,
  totalValue,
  expandedCity,
  toggleCity,
  expandedJK,
  toggleJK,
  onHoverItem,
  onLeaveItem,
  onHoverData,
  colorMode,
  activeMetric
}) => {

  const metricInfo = METRIC_OPTIONS.find(m => m.key === activeMetric);
  const metricSuffix = metricInfo?.suffix || '';
  const metricPrefix = metricInfo?.prefix || '';

  const formatValue = (val: number) => {
      const n = Math.round(val);
      return `${metricPrefix}${n.toLocaleString('ru-RU')}${metricSuffix}`;
  };

  const buildTooltipData = (item: CitySummaryItem | JKItem | LiterItem): TooltipData => {
      return {
        value: item.elevators,
        floors: item.floors,
        profit: item.profit,
        percent: item.percent,
        incomeFact: item.incomeFact,
        expenseFact: item.expenseFact,
        incomeLO: item.incomeLO,
        expenseLO: item.expenseLO,
        incomeObr: item.incomeObr,
        expenseObr: item.expenseObr,
        incomeMont: item.incomeMont,
        expenseMont: item.expenseMont,
        profitPerLift: item.profitPerLift,
        clients: item.clients || [],
        cities: item.cities || [],
        jks: item.jks || [],
        statuses: item.statuses || [],
        objectTypes: item.objectTypes || [],
        years: item.years || []
      };
  };

  // RIGHT CLICK HANDLER (Context Menu)
  const handleRightClick = (e: React.MouseEvent, name: string, item: CitySummaryItem | JKItem | LiterItem) => {
      e.preventDefault(); // Prevent browser menu
      onHoverData(item.name || name, buildTooltipData(item));
  };

  // Hover only highlights chart, does NOT update tooltip
  const handleMouseEnter = (name: string) => {
      onHoverItem(name);
  };

  const handleMouseLeave = (name: string) => {
      onLeaveItem(name);
  };

  return (
    <div className="w-1/4 min-w-[200px] h-full overflow-y-auto custom-scrollbar border-r border-gray-100 dark:border-white/5 pr-2 pl-1 py-2 animate-in slide-in-from-left-4 duration-500 relative">
        <div className="flex items-center justify-between sticky top-0 bg-white dark:bg-[#151923] py-2 z-10 mb-2 border-b border-gray-100 dark:border-white/5">
          <div className="flex flex-col">
             <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
               Рейтинг городов
             </h4>
             <span className="text-[10px] text-indigo-500 font-bold truncate max-w-[120px]">
               {metricInfo?.label}
             </span>
          </div>
          
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-bold text-gray-900 dark:text-white bg-gray-100 dark:bg-white/10 px-2 py-0.5 rounded-md font-mono">
              {formatValue(totalValue)}
            </span>
          </div>
        </div>

        <div className="space-y-1">
          {citySummary.map(city => {
            const isCityExpanded = expandedCity === city.name;
            return (
              <div key={city.name} className="flex flex-col">
                <div
                  onMouseEnter={() => handleMouseEnter(city.name)}
                  onMouseLeave={() => handleMouseLeave(city.name)}
                  onContextMenu={(e) => handleRightClick(e, city.name, city)}
                  onClick={() => toggleCity(city.name)}
                  className={`flex items-center justify-between group p-2 rounded-lg transition-all cursor-pointer ${
                    isCityExpanded
                      ? 'bg-gray-100 dark:bg-white/10 shadow-sm'
                      : 'hover:bg-gray-50 dark:hover:bg-white/5'
                  }`}
                  title="Правая кнопка: Инфо"
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
                      {formatValue(city.value)}
                    </span>
                    <div className="text-gray-400 group-hover:text-indigo-500 transition-colors">
                      {isCityExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </div>
                  </div>
                </div>

                {isCityExpanded && (
                  <div className="pl-3 pr-1 py-1 space-y-0.5 animate-in slide-in-from-top-1 duration-200 border-l border-gray-100 dark:border-white/5 ml-3">
                    {city.childrenJKs.map((jk, idx) => {
                      const isJKExpanded = expandedJK === jk.name;
                      const jkUniqueId = `${city.name}${SEPARATOR}${jk.name}`;
                      
                      return (
                        <div key={`${city.name}-${jk.name}-${idx}`} className="flex flex-col">
                          <div
                            className={`flex justify-between items-center px-2 py-1.5 rounded-md transition-colors cursor-pointer group/jk ${
                              isJKExpanded ? 'bg-indigo-50 dark:bg-indigo-500/10' : 'hover:bg-gray-50 dark:hover:bg-white/5'
                            }`}
                            onMouseEnter={() => handleMouseEnter(jkUniqueId)}
                            onMouseLeave={() => handleMouseLeave(jkUniqueId)}
                            onContextMenu={(e) => handleRightClick(e, jkUniqueId, jk)}
                            onClick={(e) => { e.stopPropagation(); toggleJK(jk.name); }}
                            title="Правая кнопка: Инфо"
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
                                {formatValue(jk.value)}
                              </span>
                            </div>
                          </div>

                          {isJKExpanded && (
                            <div className="pl-3 py-0.5 space-y-0.5 animate-in slide-in-from-top-1 duration-200 border-l border-gray-100 dark:border-white/5 ml-2 mb-1">
                              {jk.liters.map((liter, lIdx) => {
                                  const literUniqueId = `${city.name}${SEPARATOR}${jk.name}${SEPARATOR}${liter.name}`;
                                  return (
                                    <div
                                      key={`${city.name}-${jk.name}-${liter.name}-${lIdx}`}
                                      className="flex justify-between items-center px-2 py-1 rounded-md hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-default"
                                      onMouseEnter={() => handleMouseEnter(literUniqueId)}
                                      onMouseLeave={() => handleMouseLeave(literUniqueId)}
                                      onContextMenu={(e) => handleRightClick(e, literUniqueId, liter)}
                                      title="Правая кнопка: Инфо"
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
                                          {formatValue(liter.value)}
                                        </span>
                                      </div>
                                    </div>
                                  );
                              })}
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
  );
};

export default SideList;
