import React, { useMemo, useState } from 'react';
import { useProcessedChartData, ProcessedDataItem } from '../../../hooks/useProcessedChartData';
import { ChartConfig } from '../../../types/chart';
import { Maximize2, X } from 'lucide-react';
import { formatLargeNumber } from '../../../utils/formatUtils';

interface GeneralChartCardProps {
  config: Partial<ChartConfig>;
  children: (data: ProcessedDataItem[]) => React.ReactNode;
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
  
  // Подсчет общей суммы для заголовка
  const totalValue = useMemo(() => {
    return data.reduce((acc, curr) => acc + curr.value, 0);
  }, [data]);

  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      <div 
        className="bg-white dark:bg-[#151923] rounded-3xl p-6 shadow-sm border border-gray-200 dark:border-white/5 hover:border-indigo-500/20 dark:hover:border-indigo-500/20 transition-colors relative group cursor-pointer flex flex-col h-full"
        onDoubleClick={() => setIsExpanded(true)}
        title="Дважды кликните, чтобы развернуть"
      >
        
        {/* Header (Title + Total) */}
        {(config.title || showTotal) && (
          <div className="mb-4 flex flex-wrap items-baseline gap-x-2 gap-y-1 z-10 relative pr-8">
             {config.title && (
               <h3 className="text-lg font-bold text-gray-800 dark:text-white leading-tight">
                  {config.title}
               </h3>
             )}
             {showTotal && !isLoading && (
               <span className="text-lg font-bold text-indigo-500 dark:text-indigo-400 leading-tight whitespace-nowrap">
                  ({formatLargeNumber(totalValue, valuePrefix)}{valueSuffix})
               </span>
             )}
          </div>
        )}

        {/* Кнопка развернуть (видна при наведении) */}
        {!isLoading && data.length > 0 && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(true);
            }}
            className="absolute top-6 right-6 z-20 p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 bg-white/50 dark:bg-black/20 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-all opacity-0 group-hover:opacity-100 backdrop-blur-sm"
            title="Развернуть"
          >
            <Maximize2 size={18} />
          </button>
        )}

        <div className="flex-1 w-full min-h-0">
          {isLoading ? (
            <div className="h-[350px] flex items-center justify-center text-gray-400">Загрузка данных...</div>
          ) : displayData.length > 0 ? (
            children(displayData)
          ) : (
            <div className="h-[350px] flex items-center justify-center text-gray-400">Нет данных</div>
          )}
        </div>
      </div>

      {/* Модальное окно с полными данными */}
      {isExpanded && (
        <div 
           className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
           onDoubleClick={() => setIsExpanded(false)}
        >
           <div 
             className="bg-white dark:bg-[#151923] w-full max-w-6xl h-[85vh] rounded-3xl shadow-2xl border border-gray-200 dark:border-white/10 flex flex-col overflow-hidden relative"
             onClick={(e) => e.stopPropagation()} 
             title="Дважды кликните по фону, чтобы свернуть"
           >
              
              <div 
                className="p-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between bg-gray-50/50 dark:bg-[#151923]"
                onDoubleClick={() => setIsExpanded(false)} 
              >
                 <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{config.title || 'Статистика'}</h3>
                      {showTotal && (
                         <span className="text-2xl font-bold text-indigo-500 dark:text-indigo-400">
                           ({formatLargeNumber(totalValue, valuePrefix)}{valueSuffix})
                         </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Полная статистика ({data.length} записей)</p>
                 </div>
                 <button 
                   onClick={() => setIsExpanded(false)}
                   className="p-2.5 bg-gray-100 dark:bg-white/10 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/20 hover:text-gray-900 dark:hover:text-white transition-all"
                 >
                    <X size={24} />
                 </button>
              </div>
              
              <div className="flex-1 p-6 bg-white dark:bg-[#0b0f19] overflow-hidden">
                 {/* В развернутом виде передаем полные данные (data) */}
                 {children(data)}
              </div>
           </div>
        </div>
      )}
    </>
  );
};

export default GeneralChartCard;