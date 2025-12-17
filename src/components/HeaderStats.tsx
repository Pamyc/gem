
import React, { useMemo, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useDataStore } from '../contexts/DataContext';
import { calculateCardMetrics } from '../utils/cardCalculation';
import { TrendingUp, TrendingDown, Activity, Percent, ArrowUpFromLine, Layers, MapPin, CheckCircle2, MousePointer2 } from 'lucide-react';
import { getMergedHeaders } from '../utils/chartUtils';

const HeaderStats: React.FC = () => {
  const { googleSheets, sheetConfigs } = useDataStore();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Состояние режима группировки: по регионам или по городам
  const [groupingMode, setGroupingMode] = useState<'region' | 'city'>('region');

  const metricsConfigs = useMemo(() => {
    // Базовые фильтры
    const baseFilters = [
      { id: "total", column: "Итого (Да/Нет)", operator: "equals" as const, value: "Нет" },
      { id: "breakdown", column: "Без разбивки на литеры (Да/Нет)", operator: "equals" as const, value: "Да" }
    ];
    
    // Фильтры для финансовых показателей (сданные объекты)
    const financialFilters = [
        ...baseFilters,
        { id: "handed", column: "Сдан да/нет", operator: "equals" as const, value: "да" }
    ];
    
    return [
      {
        label: "Валовая прибыль",
        icon: TrendingUp,
        colorClass: "text-violet-600 dark:text-violet-400",
        bgClass: "bg-violet-50 dark:bg-violet-500/10",
        borderClass: "border-violet-100 dark:border-violet-500/20",
        config: {
          template: 'custom', title: '', sheetKey: 'clientGrowth', dataColumn: 'Валовая', aggregation: 'sum',
          filters: baseFilters,
          valuePrefix: '', valueSuffix: ' ₽', compactNumbers: false
        }
      },
      {
        label: "Расходы",
        icon: TrendingDown,
        colorClass: "text-violet-600 dark:text-violet-400",
        bgClass: "bg-violet-50 dark:bg-violet-500/10",
        borderClass: "border-violet-100 dark:border-violet-500/20",
        config: {
          template: 'custom', title: '', sheetKey: 'clientGrowth', dataColumn: 'Расходы + Итого + Факт', aggregation: 'sum',
          filters: baseFilters,
          valuePrefix: '', valueSuffix: ' ₽', compactNumbers: false
        }
      },
      {
        label: "Диапазон прибыли",
        icon: Activity,
        colorClass: "text-violet-600 dark:text-violet-400",
        bgClass: "bg-violet-50 dark:bg-violet-500/10",
        borderClass: "border-violet-100 dark:border-violet-500/20",
        config: {
          template: 'custom', title: '', sheetKey: 'clientGrowth', dataColumn: 'Валовая', aggregation: 'max', 
          filters: financialFilters,
          valuePrefix: '', valueSuffix: ' ₽', compactNumbers: false
        }
      },
      {
        label: "Рентабельность",
        icon: Percent,
        colorClass: "text-violet-600 dark:text-violet-400",
        bgClass: "bg-violet-50 dark:bg-violet-500/10",
        borderClass: "border-violet-100 dark:border-violet-500/20",
        config: {
          template: 'custom', title: '', sheetKey: 'clientGrowth', dataColumn: 'Рентабельность', aggregation: 'average',
          filters: financialFilters,
          valuePrefix: '', valueSuffix: '%', compactNumbers: false
        }
      },
      {
        label: "Кол-во лифтов",
        icon: ArrowUpFromLine,
        colorClass: "text-violet-600 dark:text-violet-400",
        bgClass: "bg-violet-50 dark:bg-violet-500/10",
        borderClass: "border-violet-100 dark:border-violet-500/20",
        config: {
          template: 'custom', title: '', sheetKey: 'clientGrowth', dataColumn: 'Кол-во лифтов', aggregation: 'sum',
          filters: baseFilters,
          valuePrefix: '', valueSuffix: ' шт.', compactNumbers: false
        }
      },
      {
        label: "Кол-во этажей",
        icon: Layers,
        colorClass: "text-violet-600 dark:text-violet-400",
        bgClass: "bg-violet-50 dark:bg-violet-500/10",
        borderClass: "border-violet-100 dark:border-violet-500/20",
        config: {
          template: 'custom', title: '', sheetKey: 'clientGrowth', dataColumn: 'Кол-во этажей', aggregation: 'sum',
          filters: baseFilters,
          valuePrefix: '', valueSuffix: ' эт.', compactNumbers: false
        }
      },
      {
        label: "Всего городов",
        icon: MapPin,
        colorClass: "text-violet-600 dark:text-violet-400",
        bgClass: "bg-violet-50 dark:bg-violet-500/10",
        borderClass: "border-violet-100 dark:border-violet-500/20",
        config: {
          template: 'custom', title: '', sheetKey: 'clientGrowth', dataColumn: 'Город', aggregation: 'unique',
          filters: baseFilters,
          valuePrefix: '', valueSuffix: '', compactNumbers: false
        }
      },
      {
        label: "Закрытых договоров",
        icon: CheckCircle2,
        colorClass: "text-violet-600 dark:text-violet-400",
        bgClass: "bg-violet-50 dark:bg-violet-500/10",
        borderClass: "border-violet-100 dark:border-violet-500/20",
        config: {
          template: 'custom', title: '', sheetKey: 'clientGrowth', dataColumn: 'Сдан да/нет', aggregation: 'count',
          filters: [
             ...baseFilters,
             { id: "handed_count", column: "Сдан да/нет", operator: "equals" as const, value: "Да" }
          ],
          valuePrefix: '', valueSuffix: '', compactNumbers: false
        }
      },
    ];
  }, []);

  // --- Calculate Matrix Data for Tooltip ---
  const matrixData = useMemo(() => {
      const sheetKey = 'clientGrowth';
      const sheetData = googleSheets[sheetKey];
      if (!sheetData || !sheetData.rows) return null;

      const config = sheetConfigs.find(c => c.key === sheetKey);
      const headers = getMergedHeaders(sheetData.headers, config?.headerRows || 1);

      // Indices
      const idxRegion = headers.indexOf('Регион');
      const idxCity = headers.indexOf('Город'); // Needed for grouping switch
      
      const idxValovaya = headers.indexOf('Валовая');
      const idxRashody = headers.indexOf('Расходы + Итого + Факт');
      const idxRentability = headers.indexOf('Рентабельность');
      const idxLifts = headers.indexOf('Кол-во лифтов');
      const idxFloors = headers.indexOf('Кол-во этажей');
      const idxStatus = headers.indexOf('Сдан да/нет');
      
      const idxTotal = headers.indexOf('Итого (Да/Нет)');
      const idxBreakdown = headers.indexOf('Без разбивки на литеры (Да/Нет)');

      // Определяем столбец группировки на основе режима
      const groupColIndex = groupingMode === 'region' ? idxRegion : idxCity;

      if (groupColIndex === -1) return null;

      // Map: GroupName -> Metrics
      const groupsMap = new Map<string, {
          valovaya: number;
          rashody: number;
          minProfit: number;
          maxProfit: number;
          hasProfitData: boolean;
          rentSum: number;
          rentCount: number;
          lifts: number;
          floors: number;
          cities: Set<string>;
          closedCount: number;
      }>();

      sheetData.rows.forEach(row => {
          const groupName = String(row[groupColIndex] || '').trim();
          if (!groupName) return;

          // Check Base Filters (Exclude totals)
          const isTotal = String(row[idxTotal] || '').toLowerCase() === 'нет';
          if (!isTotal) return; 

          // Check Breakdown
          const isBreakdown = String(row[idxBreakdown] || '').toLowerCase() === 'да';
          if (!isBreakdown) return;

          if (!groupsMap.has(groupName)) {
              groupsMap.set(groupName, {
                  valovaya: 0, rashody: 0, 
                  minProfit: Infinity, maxProfit: -Infinity, hasProfitData: false,
                  rentSum: 0, rentCount: 0,
                  lifts: 0, floors: 0, cities: new Set(), closedCount: 0
              });
          }
          const entry = groupsMap.get(groupName)!;

          // Helper to get number
          const getVal = (idx: number) => parseFloat(String(row[idx]).replace(/\s/g, '').replace(',', '.')) || 0;

          // Base Metrics
          entry.valovaya += getVal(idxValovaya);
          entry.rashody += getVal(idxRashody);
          entry.lifts += getVal(idxLifts);
          entry.floors += getVal(idxFloors);
          
          if (idxCity !== -1) {
             const city = String(row[idxCity] || '').trim();
             if (city) entry.cities.add(city);
          }

          // Financial Metrics (Require Status = Yes for Profit/Rent)
          const isHanded = String(row[idxStatus]).toLowerCase() === 'да';
          if (isHanded) {
              const profit = getVal(idxValovaya);
              entry.minProfit = Math.min(entry.minProfit, profit);
              entry.maxProfit = Math.max(entry.maxProfit, profit);
              entry.hasProfitData = true;

              entry.rentSum += getVal(idxRentability);
              entry.rentCount += 1;
              entry.closedCount += 1;
          }
      });

      // 1. Convert Map to Array
      let allGroups = Array.from(groupsMap.entries()).map(([name, data]) => ({ name, data }));

      // 2. Sort based on Hovered Metric (Top-4 Logic)
      // Default to Profit (0) if not hovering
      const sortKey = hoveredIndex ?? 0;
      
      allGroups.sort((a, b) => {
          let valA = 0, valB = 0;
          switch(sortKey) {
              case 0: // Валовая
                  valA = a.data.valovaya; valB = b.data.valovaya; break;
              case 1: // Расходы
                  valA = a.data.rashody; valB = b.data.rashody; break;
              case 2: // Диапазон (сортируем по максимуму для топа)
                  valA = a.data.hasProfitData ? a.data.maxProfit : 0;
                  valB = b.data.hasProfitData ? b.data.maxProfit : 0;
                  break;
              case 3: // Рентабельность (средняя)
                  valA = a.data.rentCount > 0 ? a.data.rentSum / a.data.rentCount : 0;
                  valB = b.data.rentCount > 0 ? b.data.rentSum / b.data.rentCount : 0;
                  break;
              case 4: // Лифты
                  valA = a.data.lifts; valB = b.data.lifts; break;
              case 5: // Этажи
                  valA = a.data.floors; valB = b.data.floors; break;
              case 6: // Города (уникальные)
                  valA = a.data.cities.size; valB = b.data.cities.size; break;
              case 7: // Закрытые договоры
                  valA = a.data.closedCount; valB = b.data.closedCount; break;
              default:
                  valA = a.data.valovaya; valB = b.data.valovaya;
          }
          return valB - valA; // Descending
      });

      // 3. Slice Top 4 and Aggregate "Others"
      const top4 = allGroups.slice(0, 4);
      const others = allGroups.slice(4);

      if (others.length > 0) {
          const otherData = {
              valovaya: 0, rashody: 0,
              minProfit: Infinity, maxProfit: -Infinity, hasProfitData: false,
              rentSum: 0, rentCount: 0,
              lifts: 0, floors: 0, cities: new Set<string>(), closedCount: 0
          };

          others.forEach(item => {
              otherData.valovaya += item.data.valovaya;
              otherData.rashody += item.data.rashody;
              
              if (item.data.hasProfitData) {
                  otherData.hasProfitData = true;
                  otherData.minProfit = Math.min(otherData.minProfit, item.data.minProfit);
                  otherData.maxProfit = Math.max(otherData.maxProfit, item.data.maxProfit);
              }

              otherData.rentSum += item.data.rentSum;
              otherData.rentCount += item.data.rentCount;
              otherData.lifts += item.data.lifts;
              otherData.floors += item.data.floors;
              item.data.cities.forEach(c => otherData.cities.add(c));
              otherData.closedCount += item.data.closedCount;
          });

          top4.push({ name: 'Другие...', data: otherData });
      }

      // 4. Transform to Display Columns
      const columns = top4.map(({ name, data }) => {
          const minP = data.hasProfitData ? data.minProfit : 0;
          const maxP = data.hasProfitData ? data.maxProfit : 0;
          const avgRent = data.rentCount > 0 ? data.rentSum / data.rentCount : 0;

          // Форматируем числа:
          const fmtMoney = (v: number) => Math.round(v).toLocaleString('ru-RU') + ' ₽';
          const fmtNum = (v: number) => v.toLocaleString('ru-RU');

          return {
              name: name,
              metrics: [
                  fmtMoney(data.valovaya), // Валовая
                  fmtMoney(data.rashody),  // Расходы
                  `${fmtNum(Math.round(minP))} - ${fmtNum(Math.round(maxP))} ₽`, // Диапазон
                  avgRent.toFixed(1) + '%', // Рентабельность
                  fmtNum(data.lifts) + ' шт.', // Лифты
                  fmtNum(data.floors) + ' эт.', // Этажи
                  data.cities.size.toString(), // Городов (для города всегда 1, но логика универсальна)
                  data.closedCount.toString() // Закрытых
              ]
          };
      });

      const rowLabels = [
          "Валовая прибыль",
          "Расходы",
          "Диапазон прибыли",
          "Рентабельность",
          "Кол-во лифтов",
          "Кол-во этажей",
          "Всего городов",
          "Закрытых договоров"
      ];

      return { columns, rowLabels };
  }, [googleSheets, sheetConfigs, groupingMode, hoveredIndex]);

  // Main Card Metrics (Single values)
  const displayMetrics = useMemo(() => {
    return metricsConfigs.map(item => {
        const data = calculateCardMetrics(googleSheets, sheetConfigs, item.config as any);
        let displayValue = data.displayValue;
        
        if (item.label === "Диапазон прибыли") {
            const minStr = (data.rawMin || 0).toLocaleString('ru-RU');
            const maxStr = (data.rawMax || 0).toLocaleString('ru-RU');
            const suffix = item.config.valueSuffix || '';
            displayValue = `${minStr} - ${maxStr}${suffix}`;
        } 
        
        return { ...item, value: displayValue };
    });
  }, [googleSheets, sheetConfigs, metricsConfigs]);

  const handleMouseMove = (e: React.MouseEvent) => {
      // Track absolute mouse position relative to viewport
      setMousePos({ x: e.clientX, y: e.clientY });
  };

  // Helper to calculate position to keep tooltip on screen
  const getTooltipPosition = () => {
      if (!matrixData) return {};
      
      // Estimated dimensions
      const estWidth = (matrixData.columns.length * 130) + 180;
      const estHeight = (matrixData.rowLabels.length * 35) + 80;
      
      const padding = 20;
      const x = mousePos.x;
      const y = mousePos.y;
      
      // Horizontal flip check
      const left = (x + estWidth + padding > window.innerWidth) 
          ? x - estWidth - padding 
          : x + padding;
          
      // Vertical flip check
      const top = (y + estHeight + padding > window.innerHeight)
          ? y - estHeight - padding
          : y + padding;

      return { left: `${left}px`, top: `${top}px` };
  };

  return (
    <div 
        ref={containerRef}
        className="w-full grid grid-cols-4 gap-4 py-2 relative"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredIndex(null)}
    >
      {displayMetrics.map((m, idx) => (
        <div 
            key={idx} 
            className={`flex flex-col justify-center min-w-0 p-3 rounded-2xl border ${m.bgClass} ${m.borderClass} transition-colors cursor-pointer hover:shadow-md select-none`}
            onMouseEnter={() => setHoveredIndex(idx)}
            onMouseDown={(e) => {
                if (e.button === 1) { // Middle Click
                    e.preventDefault(); // Prevent scroll icon
                    setGroupingMode(prev => prev === 'region' ? 'city' : 'region');
                }
            }}
            title="Нажмите колесико мыши для смены группировки (Регионы / Города)"
        >
           <div className="flex items-center gap-2 mb-1">
              <m.icon size={16} className={`shrink-0 ${m.colorClass}`} />
              <span className={`text-[10px] uppercase font-bold tracking-wider truncate ${m.colorClass} opacity-80`}>
                {m.label}
              </span>
           </div>
           <div 
             className="text-base font-bold text-gray-900 dark:text-white leading-none truncate font-mono tracking-tight pl-6" 
             title={m.value}
           >
              {m.value}
           </div>
        </div>
      ))}

      {/* GLOBAL FIXED TOOLTIP PORTAL */}
      {hoveredIndex !== null && matrixData && createPortal(
          <div 
            className="fixed z-[100000] pointer-events-none bg-slate-900/95 text-white backdrop-blur-xl rounded-xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.9)] border border-white/10 p-4 animate-in fade-in zoom-in-95 duration-100"
            style={{ 
                ...getTooltipPosition()
            }}
          >
             <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/10">
                <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                        {groupingMode === 'region' ? 'Топ-4 Регионов + Остальные' : 'Топ-4 Городов + Остальные'}
                    </h4>
                    <span className="flex items-center gap-1 text-[9px] text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">
                        <MousePointer2 size={10} />
                        middle click
                    </span>
                </div>
             </div>
             
             <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse whitespace-nowrap">
                     <thead>
                         <tr>
                             <th className="p-2 text-[10px] font-bold text-gray-500 uppercase border-b border-white/10 bg-black/20">
                                 Показатель
                             </th>
                             {matrixData.columns.map((col, cIdx) => (
                                 <th 
                                    key={col.name} 
                                    className={`p-2 text-[10px] font-bold uppercase border-b border-white/10 text-right min-w-[120px] ${
                                        col.name === 'Другие...' ? 'text-gray-500 italic' : 'text-indigo-400'
                                    }`}
                                 >
                                     {col.name}
                                 </th>
                             ))}
                         </tr>
                     </thead>
                     <tbody>
                         {matrixData.rowLabels.map((label, rIdx) => {
                             const isHighlighted = rIdx === hoveredIndex;
                             return (
                                 <tr 
                                    key={label} 
                                    className={`transition-colors ${isHighlighted ? 'bg-indigo-500/20' : 'hover:bg-white/5'}`}
                                 >
                                     <td className={`p-2 text-xs font-bold border-b border-white/5 ${isHighlighted ? 'text-white' : 'text-gray-400'}`}>
                                         {label}
                                     </td>
                                     {matrixData.columns.map((col, cIdx) => (
                                         <td 
                                            key={col.name} 
                                            className={`p-2 text-xs font-mono text-right border-b border-white/5 ${
                                                isHighlighted 
                                                    ? (col.name === 'Другие...' ? 'text-gray-400 font-bold' : 'text-white font-bold') 
                                                    : (col.name === 'Другие...' ? 'text-gray-500' : 'text-gray-300')
                                            }`}
                                         >
                                             {col.metrics[rIdx]}
                                         </td>
                                     ))}
                                 </tr>
                             );
                         })}
                     </tbody>
                 </table>
             </div>
          </div>,
          document.body
      )}
    </div>
  );
};

export default HeaderStats;
