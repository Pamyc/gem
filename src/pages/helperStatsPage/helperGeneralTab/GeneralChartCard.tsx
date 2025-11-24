import React, { useMemo, useState } from 'react';
import { useProcessedChartData, ProcessedDataItem } from '../../../hooks/useProcessedChartData';
import { ChartConfig } from '../../../types/chart';
import { Maximize2, X } from 'lucide-react';
import { formatLargeNumber } from '../../../utils/formatUtils';

interface GeneralChartCardProps {
  config: Partial<ChartConfig>;
  children: (data: ProcessedDataItem[], isExpanded: boolean) => React.ReactNode;
  limit?: number; // 0 = показать все
  showTotal?: boolean;
  valuePrefix?: string;
  valueSuffix?: string;
}

const GeneralChartCard: React.FC<GeneralChartCardProps> = ({ 
  config, 
  children, 
  limit = 7,
  showTotal = false,
  valuePrefix = '',
  valueSuffix = ''
}) => {
  const { data, isLoading } = useProcessedChartData(config);
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Применяем лимит для отображения в карточке
  const displayData = useMemo(() => {
    if (limit === 0) return data; // Если 0, показываем все данные
    
    // Если данных меньше или равно лимиту, ничего не режем
    if (data.length <= limit) {
      return data;
    }

    // Берем топ элементов
    const topItems = data.slice(0, limit);
    
    // Суммируем остаток
    const remainingItems = data.slice(limit);
    const otherSum = remainingItems.reduce((acc, curr) => acc + curr.value, 0);

    // Если сумма остатка больше 0, добавляем пункт "Прочее"
    if (otherSum > 0) {
      return [
        ...topItems,
        { name: 'Прочее', value: otherSum }
      ];
    }
    
    return topItems;
  }, [data, limit]);

  const totalValue = useMemo(() => {
    return data.reduce((acc, curr) => acc + curr.value, 0);
  }, [data]);

  const formattedTotal = useMemo(() => {
    return formatLargeNumber(totalValue, valuePrefix) + valueSuffix;
  }, [totalValue, valuePrefix, valueSuffix]);

  return (
    <>
      {/* Small Card View */}
      <div 
        onDoubleClick={() => setIsExpanded(true)}
        className="bg-white dark:bg-[#151923] rounded-3xl p-6 shadow-sm border border-gray-200 dark:border-white/5 hover:border-indigo-500/20 dark:hover:border-indigo-500/20 transition-colors flex flex-col cursor-pointer group relative"
      >
        <div className="flex justify-between items-start mb-2">
            <div>
               <h3 className="text-lg font-bold text-gray-800 dark:text-white leading-tight">
                   {config.title}
               </h3>
               {showTotal && !isLoading && (
                   <span className="text-indigo-600 dark:text-indigo-400 font-bold text-sm bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded-md mt-1 inline-block">
                       {formattedTotal}
                   </span>
               )}
            </div>
            <button 
                onClick={(e) => { e.stopPropagation(); setIsExpanded(true); }}
                className="p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                title="Развернуть"
            >
                <Maximize2 size={18} />
            </button>
        </div>

        <div className="flex-1 min-h-[350px]">
            {isLoading ? (
                <div className="h-full flex items-center justify-center text-gray-400">Загрузка данных...</div>
            ) : displayData.length > 0 ? (
                children(displayData, false)
            ) : (
                <div className="h-full flex items-center justify-center text-gray-400">Нет данных</div>
            )}
        </div>
      </div>

      {/* Expanded Modal */}
      {isExpanded && (
        <div 
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
            onDoubleClick={() => setIsExpanded(false)}
        >
           <div 
                className="bg-white dark:bg-[#151923] w-full max-w-6xl h-[85vh] rounded-3xl shadow-2xl border border-gray-200 dark:border-white/10 flex flex-col overflow-hidden"
                onDoubleClick={(e) => e.stopPropagation()} 
           >
              <div className="p-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between bg-gray-50/50 dark:bg-[#151923]">
                 <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{config.title}</h3>
                    <div className="flex items-center gap-3 mt-1">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Полная статистика</p>
                        {showTotal && (
                            <span className="text-indigo-600 dark:text-indigo-400 font-bold text-sm bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded-md">
                                Всего: {formattedTotal}
                            </span>
                        )}
                    </div>
                 </div>
                 <button 
                   onClick={() => setIsExpanded(false)}
                   className="p-2.5 bg-gray-100 dark:bg-white/10 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/20 hover:text-gray-900 dark:hover:text-white transition-all"
                 >
                    <X size={24} />
                 </button>
              </div>
              <div className="flex-1 p-6 bg-white dark:bg-[#0b0f19] overflow-hidden">
                 {data.length > 0 ? (
                    children(data, true) 
                 ) : (
                    <div className="h-full flex items-center justify-center text-gray-400">Нет данных</div>
                 )}
              </div>
           </div>
        </div>
      )}
    </>
  );
};

export default GeneralChartCard;