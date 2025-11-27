
import React, { useMemo, useState } from 'react';
import { useProcessedChartData } from '../../../hooks/useProcessedChartData';
import { Building, Loader2, MapPin, Calendar, Activity, Layers, ImageOff, Maximize2, X } from 'lucide-react';
import { getImgByName } from '../../../utils/driveUtils';

interface HousingComplexSectionProps {
  isDarkMode: boolean;
  selectedCity: string;
  selectedYear: string;
}

// Массив соответствия названия ЖК и ключа картинки
const jkImageMapping = [
  {
    name: "Октябрь парк",
    id: "oktbr_park",
  },
  // Сюда можно добавлять другие ЖК
];

const HousingComplexSection: React.FC<HousingComplexSectionProps> = ({ selectedCity, selectedYear }) => {
  const [expandedImage, setExpandedImage] = useState<string | null>(null);
  
  const config = useMemo(() => {
    const filters: any[] = [
      {
        id: "base-filter-1",
        column: "Итого (Да/Нет)",
        operator: "equals",
        value: "Нет"
      },
      {
        id: "base-filter-2",
        column: "Без разбивки на литеры (Да/Нет)",
        operator: "equals",
        value: "Да"
      }
    ]

    if (selectedCity) {
      filters.push({
        id: "city-filter",
        column: "Город",
        operator: "equals",
        value: selectedCity
      });
    }

    if (selectedYear && selectedYear !== 'Весь период') {
      filters.push({
        id: "year-filter",
        column: "Год",
        operator: "equals",
        value: selectedYear
      });
    }

    return {
      sheetKey: 'clientGrowth',
      xAxisColumn: 'ЖК',
      yAxisColumn: 'ЖК', // Just counting rows per JK
      aggregation: 'count' as const,
      filters: filters
    };
  }, [selectedCity, selectedYear]);

  const { data, isLoading } = useProcessedChartData(config);

  // Sort alphabetically
  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => a.name.localeCompare(b.name));
  }, [data]);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-gray-400 py-4">
        <Loader2 className="animate-spin" size={20} />
        <span className="text-sm">Загрузка списка ЖК...</span>
      </div>
    );
  }

  if (sortedData.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-yellow-100 dark:bg-yellow-500/20 rounded-lg text-yellow-700 dark:text-yellow-400">
            <Building size={20} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Информация по ЖК</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {sortedData.map((item) => {
          // Ищем соответствие картинки
          const mapping = jkImageMapping.find(m => m.name.toLowerCase() === item.name.toLowerCase());
          const imageUrl = mapping ? getImgByName(mapping.id, 'w1000') : null;

          return (
            <div 
              key={item.name}
              className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-500/20 rounded-3xl p-5 transition-all hover:shadow-xl hover:border-yellow-300 dark:hover:border-yellow-500/40 group flex flex-col gap-4"
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                  <h3 className="text-xl font-black text-gray-900 dark:text-white leading-tight truncate pr-2" title={item.name}>
                      {item.name}
                  </h3>
              </div>
              
              {/* Image Container */}
              <div 
                className={`w-full h-48 rounded-2xl overflow-hidden relative shadow-sm group-hover:shadow-md transition-shadow bg-gray-200 dark:bg-black/20 ${imageUrl ? 'cursor-zoom-in' : ''}`}
                onDoubleClick={() => imageUrl && setExpandedImage(imageUrl)}
                title={imageUrl ? "Дважды кликните, чтобы развернуть" : ""}
              >
                  {imageUrl ? (
                    <>
                      <img 
                          src={imageUrl} 
                          alt={item.name}
                          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-40 group-hover:opacity-30 transition-opacity"></div>
                      
                      {/* Expand Hint */}
                      <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-md text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                         <Maximize2 size={16} />
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 gap-2">
                       <ImageOff size={32} className="opacity-50" />
                       <span className="font-bold text-sm uppercase tracking-wider opacity-70">No IMG</span>
                    </div>
                  )}
              </div>

              {/* Text Grid Container */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-4 bg-white/50 dark:bg-black/20 p-4 rounded-2xl border border-yellow-100 dark:border-yellow-500/10">
                  
                  {/* Text 1 */}
                  <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 flex items-center gap-1">
                          <MapPin size={10} /> Город
                      </span>
                      <span className="font-bold text-gray-800 dark:text-gray-200 text-sm truncate">
                          {selectedCity || 'Ростов-на-Дону'}
                      </span>
                  </div>

                  {/* Text 3 (Top Right) */}
                  <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 flex items-center gap-1">
                          <Calendar size={10} /> Срок сдачи
                      </span>
                      <span className="font-bold text-gray-800 dark:text-gray-200 text-sm">
                          IV кв. 2025
                      </span>
                  </div>

                  {/* Text 2 (Bottom Left) */}
                  <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 flex items-center gap-1">
                          <Layers size={10} /> Лифтов
                      </span>
                      <span className="font-bold text-gray-800 dark:text-gray-200 text-sm">
                          {item.value} шт.
                      </span>
                  </div>

                  {/* Text 4 (Bottom Right) */}
                  <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 flex items-center gap-1">
                          <Activity size={10} /> Статус
                      </span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                          В работе
                      </span>
                  </div>

              </div>
            </div>
          );
        })}
      </div>

      {/* Lightbox Modal */}
      {expandedImage && (
        <div 
          className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setExpandedImage(null)}
        >
          <button 
            className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors p-2 bg-white/10 hover:bg-white/20 rounded-full cursor-pointer z-10"
            onClick={() => setExpandedImage(null)}
          >
            <X size={32} />
          </button>
          
          <img 
            src={expandedImage} 
            alt="Expanded view" 
            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
            onDoubleClick={() => setExpandedImage(null)}
          />
        </div>
      )}
    </div>
  );
};

export default HousingComplexSection;
