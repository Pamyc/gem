import React, { useState, useRef } from 'react';
import { ChevronDown, ChevronRight, Building } from 'lucide-react';
import { CitySummaryItem, ColorMode, SEPARATOR, STATUS_COLORS, TooltipData, JKItem, LiterItem, MetricKey, METRIC_OPTIONS } from './types';
import { getTooltipHtml } from './useChartOptions';

interface SideListProps {
  citySummary: CitySummaryItem[];
  totalValue: number;
  expandedCity: string | null;
  toggleCity: (name: string) => void;
  expandedJK: string | null;
  toggleJK: (name: string) => void;
  onHoverItem: (name: string) => void;
  onLeaveItem: (name: string) => void;
  colorMode: ColorMode;
  activeMetric: MetricKey;
}

const SHOW_DELAY = 700; // Задержка появления при покое (мс)
const HIDE_MOVE_DELAY = 70; // Задержка скрытия при движении (мс)

const SideList: React.FC<SideListProps> = ({
  citySummary,
  totalValue,
  expandedCity,
  toggleCity,
  expandedJK,
  toggleJK,
  onHoverItem,
  onLeaveItem,
  colorMode,
  activeMetric
}) => {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; content: string } | null>(null);
  const tooltipTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Get active metric label info
  const metricInfo = METRIC_OPTIONS.find(m => m.key === activeMetric);
  const metricSuffix = metricInfo?.suffix || '';
  const metricPrefix = metricInfo?.prefix || '';

  const formatValue = (val: number) => {
      const n = Math.round(val);
      return `${metricPrefix}${n.toLocaleString('ru-RU')}${metricSuffix}`;
  };

  const showTooltipInternal = (
    mouseX: number, 
    mouseY: number, 
    title: string, 
    item: CitySummaryItem | JKItem | LiterItem
  ) => {
    const data: TooltipData = {
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

    const htmlContent = getTooltipHtml(title, data, true, activeMetric);
    const tooltipHeight = 450;
    const windowHeight = window.innerHeight;

    let top = mouseY + 10;
    if (mouseY + tooltipHeight + 20 > windowHeight) {
       top = mouseY - tooltipHeight - 10;
       if (top < 10) top = 10;
    }

    setTooltip({
      x: mouseX,
      y: top,
      content: htmlContent
    });
  };

  const handleMouseEnterItem = (
      e: React.MouseEvent, 
      title: string, 
      item: CitySummaryItem | JKItem | LiterItem
  ) => {
    // Очищаем все текущие таймеры
    if (tooltipTimeoutRef.current) clearTimeout(tooltipTimeoutRef.current);
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);

    const mouseX = e.clientX;
    const mouseY = e.clientY;

    // Планируем показ через 700мс покоя
    tooltipTimeoutRef.current = setTimeout(() => {
        showTooltipInternal(mouseX, mouseY, title, item);
        tooltipTimeoutRef.current = null;
    }, SHOW_DELAY);
  };

  const handleMouseMoveItem = (
    e: React.MouseEvent, 
    title: string, 
    item: CitySummaryItem | JKItem | LiterItem
  ) => {
    // Любое движение сбрасывает таймер ПОКАЗА (нужно замереть на 700мс)
    if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current);
    }
    
    // Если тултип УЖЕ виден, планируем его скрытие через 70мс движения
    if (tooltip && !hideTimeoutRef.current) {
        hideTimeoutRef.current = setTimeout(() => {
            setTooltip(null);
            hideTimeoutRef.current = null;
        }, HIDE_MOVE_DELAY);
    }

    const mouseX = e.clientX;
    const mouseY = e.clientY;

    // Снова планируем показ — он сработает только если движение прекратится
    tooltipTimeoutRef.current = setTimeout(() => {
        // Если покой наступил, отменяем запланированное скрытие (если оно было)
        if (hideTimeoutRef.current) {
            clearTimeout(hideTimeoutRef.current);
            hideTimeoutRef.current = null;
        }
        showTooltipInternal(mouseX, mouseY, title, item);
        tooltipTimeoutRef.current = null;
    }, SHOW_DELAY);
  };

  const handleMouseLeaveItem = () => {
    if (tooltipTimeoutRef.current) clearTimeout(tooltipTimeoutRef.current);
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    
    tooltipTimeoutRef.current = setTimeout(() => {
        setTooltip(null);
        tooltipTimeoutRef.current = null;
    }, 150); 
  };

  const handleTooltipMouseEnter = () => {
      // Если курсор попал в тултип — отменяем все таймеры скрытия и перепоказа
      if (tooltipTimeoutRef.current) {
          clearTimeout(tooltipTimeoutRef.current);
          tooltipTimeoutRef.current = null;
      }
      if (hideTimeoutRef.current) {
          clearTimeout(hideTimeoutRef.current);
          hideTimeoutRef.current = null;
      }
  };

  const handleTooltipMouseLeave = () => {
      tooltipTimeoutRef.current = setTimeout(() => {
          setTooltip(null);
          tooltipTimeoutRef.current = null;
      }, 150);
  };

  return (
    <>
      <div className="w-1/3 min-w-[220px] h-full overflow-y-auto custom-scrollbar border-r border-gray-100 dark:border-white/5 pr-4 pl-2 py-2 animate-in slide-in-from-left-4 duration-500 relative">
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
                  onMouseEnter={(e) => { onHoverItem(city.name); handleMouseEnterItem(e, city.name, city); }}
                  onMouseMove={(e) => handleMouseMoveItem(e, city.name, city)}
                  onMouseLeave={() => { onLeaveItem(city.name); handleMouseLeaveItem(); }}
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
                      return (
                        <div key={`${city.name}-${jk.name}-${idx}`} className="flex flex-col">
                          <div
                            className={`flex justify-between items-center px-2 py-1.5 rounded-md transition-colors cursor-pointer group/jk ${
                              isJKExpanded ? 'bg-indigo-50 dark:bg-indigo-500/10' : 'hover:bg-gray-50 dark:hover:bg-white/5'
                            }`}
                            onMouseEnter={(e) => { onHoverItem(`${city.name}${SEPARATOR}${jk.name}`); handleMouseEnterItem(e, jk.name, jk); }}
                            onMouseMove={(e) => handleMouseMoveItem(e, jk.name, jk)}
                            onMouseLeave={() => { onLeaveItem(`${city.name}${SEPARATOR}${jk.name}`); handleMouseLeaveItem(); }}
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
                                {formatValue(jk.value)}
                              </span>
                            </div>
                          </div>

                          {isJKExpanded && (
                            <div className="pl-3 py-0.5 space-y-0.5 animate-in slide-in-from-top-1 duration-200 border-l border-gray-100 dark:border-white/5 ml-2 mb-1">
                              {jk.liters.map((liter, lIdx) => (
                                <div
                                  key={`${city.name}-${jk.name}-${liter.name}-${lIdx}`}
                                  className="flex justify-between items-center px-2 py-1 rounded-md hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-default"
                                  onMouseEnter={(e) => { onHoverItem(`${city.name}${SEPARATOR}${jk.name}${SEPARATOR}${liter.name}`); handleMouseEnterItem(e, liter.name, liter); }}
                                  onMouseMove={(e) => handleMouseMoveItem(e, liter.name, liter)}
                                  onMouseLeave={() => { onLeaveItem(`${city.name}${SEPARATOR}${jk.name}${SEPARATOR}${liter.name}`); handleMouseLeaveItem(); }}
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

      {tooltip && (
        <div
          onMouseEnter={handleTooltipMouseEnter}
          onMouseLeave={handleTooltipMouseLeave}
          style={{
            position: 'fixed',
            top: tooltip.y,
            left: tooltip.x + 15,
            zIndex: 9999,
            backgroundColor: 'rgba(30, 41, 59, 0.98)',
            border: '1px solid #334155',
            borderRadius: '16px',
            boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(12px)',
            pointerEvents: 'auto',
          }}
          dangerouslySetInnerHTML={{ __html: tooltip.content }}
        />
      )}
    </>
  );
};

export default SideList;