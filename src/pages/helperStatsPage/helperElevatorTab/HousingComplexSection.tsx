
import React, { useMemo, useState } from 'react';
import { useDataStore } from '../../../contexts/DataContext';
import { Loader2, MapPin, Maximize2, Users, Building, ArrowUpFromLine, Layers, X, FileSignature, Building2, User } from 'lucide-react';
import { getImgByName } from '../../../utils/driveUtils';
import { getMergedHeaders } from '../../../utils/chartUtils';
import DetailsModal from '../../../components/cards/helper/helperCustomCard/DetailsModal';
import { CardConfig } from '../../../types/card';
import { ChartFilter } from '../../../types/chart';

interface HousingComplexSectionProps {
  isDarkMode: boolean;
  selectedCity: string;
  selectedYear: string;
  selectedRegion?: string;
}

// Массив соответствия названия ЖК и ключа картинки
const jkImageMapping = [
  { name: "Октябрь парк", id: "oktbr_park" },
  { name: "Архитектор", id: "arhi" },
  { name: "Цитрус", id: "citrus" },
  { name: "Долина", id: "dolina" },
  { name: "Движение", id: "dvigenie" },
  { name: "Эстет", id: "estet" },
  { name: "1777", id: "kvartal1777" },
  { name: "Левобережье", id: "levober" },
  { name: "Лучший", id: "luchshiy" },
  { name: "Моне", id: "mone" },
  { name: "Основа", id: "osnova" },
  { name: "Печерин", id: "pecherin" },
  { name: "Персона", id: "persona" },
  { name: "Полет", id: "polet" },
  { name: "Сияние", id: "sijanie" },
  { name: "Софи", id: "sofi" },
  { name: "Усадьба", id: "usadba" },
  { name: "Высота", id: "visota" },
  { name: "Золотой берег", id: "zolotoi" },
  { name: "Фонтаны", id: "fontani" },
  { name: "Южный парк", id: "yugniy" },
  { name: "Моя легенда", id: "legenda" },
  { name: "Первый", id: "perviy" },
  { name: "ФОК", id: "fok" },
  { name: "Медцентр", id: "medicina" },
  { name: "Западный обход ТЦ", id: "tc" },
  { name: "Левобережье (ТЦ)", id: "tc" },
  { name: "Детский сад", id: "sadik" },
  { name: "Садик 450 мест", id: "sadik" },
  { name: "ДОО", id: "sadik" },
  { name: "Школа 1750 мест", id: "skola" },
  { name: "Сбер школа", id: "sberskola" },
  { name: "Школа (учебный корпус)", id: "skola" },
  { name: "Полет (школа)", id: "skola" },
];

interface JKAggregatedData {
  name: string;
  client: string;
  elevators: number;
  floors: number;
  liters: number;
  city: string;
}

const HousingComplexSection: React.FC<HousingComplexSectionProps> = ({ selectedCity, selectedYear, isDarkMode, selectedRegion }) => {
  const { googleSheets, sheetConfigs, isLoading } = useDataStore();
  const [selectedJK, setSelectedJK] = useState<JKAggregatedData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // State for Image Preview (Lightbox)
  const [viewImage, setViewImage] = useState<string | null>(null);

  const processedData = useMemo<JKAggregatedData[]>(() => {
    const sheetKey = 'clientGrowth';
    const sheetData = googleSheets[sheetKey];

    if (!sheetData || !sheetData.headers || !sheetData.rows) return [];

    const config = sheetConfigs.find(c => c.key === sheetKey);
    const headerRowsCount = config?.headerRows || 1;
    const headers = getMergedHeaders(sheetData.headers, headerRowsCount);

    // Indices
    const idxJK = headers.indexOf('ЖК');
    const idxCity = headers.indexOf('Город');
    const idxRegion = headers.indexOf('Регион');
    const idxYear = headers.indexOf('Год');
    const idxClient = headers.indexOf('Клиент');
    const idxElevators = headers.indexOf('Кол-во лифтов');
    const idxFloors = headers.indexOf('Кол-во этажей');
    const idxTotal = headers.indexOf('Итого (Да/Нет)');
    const idxNoBreakdown = headers.indexOf('Без разбивки на литеры (Да/Нет)');
    const idxOneLiter = headers.indexOf('Отдельный литер (Да/Нет)'); // For accurate liters count

    if (idxJK === -1) return [];

    const groups = new Map<string, any[]>();

    // 1. Filter and Group
    sheetData.rows.forEach(row => {
      // Base Filter: Итого = Нет (Exclude grand totals)
      if (idxTotal !== -1) {
        const val = String(row[idxTotal]).trim().toLowerCase();
        if (val !== 'нет') return;
      }

      // Context Filters
      if (selectedRegion && idxRegion !== -1 && String(row[idxRegion]) !== selectedRegion) return;
      if (selectedCity && idxCity !== -1 && String(row[idxCity]) !== selectedCity) return;
      if (selectedYear && selectedYear !== 'Весь период' && idxYear !== -1 && String(row[idxYear]) !== selectedYear) return;

      const jkName = String(row[idxJK] || '').trim();
      if (!jkName) return;

      if (!groups.has(jkName)) {
        groups.set(jkName, []);
      }
      groups.get(jkName)?.push(row);
    });

    // 2. Aggregate per Group
    const result: JKAggregatedData[] = [];

    groups.forEach((rows, jkName) => {
      let client = '';
      let city = '';

      // Get Metadata from first available row
      if (rows.length > 0) {
        if (idxClient !== -1) client = String(rows[0][idxClient] || '');
        if (idxCity !== -1) city = String(rows[0][idxCity] || '');
      }

      // Logic for Liters:
      // Try to use "Отдельный литер (Да/Нет)" column first (as per modal fix)
      let litersCount = 0;
      if (idxOneLiter !== -1) {
        litersCount = rows.filter(r => String(r[idxOneLiter]).trim().toLowerCase() === 'да').length;
      } else {
        // Fallback logic: count rows that are NOT aggregations (detail rows)
        const detailRows = idxNoBreakdown !== -1
          ? rows.filter(r => String(r[idxNoBreakdown]).trim().toLowerCase() === 'нет')
          : rows;
        litersCount = detailRows.length;
      }

      // If count is 0 but we have data for the JK, assume 1 (the main building/complex itself).
      if (litersCount === 0 && rows.length > 0) {
        litersCount = 1;
      }

      // Summing metrics - use rows where "Без разбивки на литеры" is "Да" to match Modal/KPI logic (Sums from Aggregate Rows)
      const sumRows = idxNoBreakdown !== -1
        ? rows.filter(r => String(r[idxNoBreakdown]).trim().toLowerCase() === 'да')
        : rows;

      const elevators = sumRows.reduce((sum, r) => sum + (parseFloat(String(r[idxElevators]).replace(',', '.')) || 0), 0);
      const floors = sumRows.reduce((sum, r) => sum + (parseFloat(String(r[idxFloors]).replace(',', '.')) || 0), 0);

      result.push({
        name: jkName,
        client,
        city,
        elevators,
        floors,
        liters: litersCount
      });
    });

    return result.sort((a, b) => a.name.localeCompare(b.name));

  }, [googleSheets, sheetConfigs, selectedCity, selectedYear, selectedRegion]);

  // --- CONSTRUCT MODAL DATA CONTEXTS ---
  const modalContexts = useMemo<{ name: string; config: CardConfig }[]>(() => {
    if (!selectedJK) return [];

    // Common filters for this JK
    const baseFilters: ChartFilter[] = [
      { id: 'f_jk', column: 'ЖК', operator: 'equals', value: selectedJK.name },
      { id: 'f_total', column: 'Итого (Да/Нет)', operator: 'equals', value: 'Нет' },
    ];

    if (selectedRegion) {
      baseFilters.push({ id: 'f_region', column: 'Регион', operator: 'equals', value: selectedRegion });
    }
    if (selectedCity) {
      baseFilters.push({ id: 'f_city', column: 'Город', operator: 'equals', value: selectedCity });
    }
    if (selectedYear && selectedYear !== 'Весь период') {
      baseFilters.push({ id: 'f_year', column: 'Год', operator: 'equals', value: selectedYear });
    }

    // Dummy default config for structure
    const defaultConfig: CardConfig = {
      template: 'custom',
      title: selectedJK.name,
      sheetKey: 'clientGrowth',
      dataColumn: '',
      aggregation: 'count',
      filters: [],
      valuePrefix: '',
      valueSuffix: '',
      icon: '',
      showIcon: false,
      showTrend: false,
      trendValue: '',
      trendDirection: 'neutral',
      width: '100%',
      height: 'auto',
      colorTheme: 'blue',
      gradientFrom: '',
      gradientTo: '',
      elements: []
    };

    return [
      {
        name: 'Заказчик',
        config: {
          ...defaultConfig,
          title: 'Заказчик',
          dataColumn: 'Клиент',
          aggregation: 'unique',
          filters: [...baseFilters]
        }
      },
      {
        name: 'Лифты',
        config: {
          ...defaultConfig,
          title: 'Лифты',
          dataColumn: 'Кол-во лифтов',
          aggregation: 'sum',
          filters: [...baseFilters,
          { id: 'f_nobreak', column: 'Без разбивки на литеры (Да/Нет)', operator: 'equals', value: 'Да' }
          ]
        }
      },
      {
        name: 'Литеры',
        config: {
          ...defaultConfig,
          title: 'Литеры',
          dataColumn: 'Литер', // Just to show the rows
          aggregation: 'count',
          // Filter specifically for liters view
          filters: [
            ...baseFilters,
            { id: 'f_oneliter', column: 'Отдельный литер (Да/Нет)', operator: 'equals', value: 'Да' },

          ]
        }
      },
      {
        name: 'Этажи',
        config: {
          ...defaultConfig,
          title: 'Этажи',
          dataColumn: 'Кол-во этажей',
          aggregation: 'sum',
          filters: [...baseFilters,
          { id: 'f_nobreak', column: 'Без разбивки на литеры (Да/Нет)', operator: 'equals', value: 'Да' }
          ]
        }
      }
    ];
  }, [selectedJK, selectedCity, selectedYear, selectedRegion]);


  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-gray-400 py-4">
        <Loader2 className="animate-spin" size={20} />
        <span className="text-sm">Загрузка списка ЖК...</span>
      </div>
    );
  }

  if (processedData.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight px-1">Информация по ЖК</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {processedData.map((item) => {
          // Ищем соответствие картинки
          const mapping = jkImageMapping.find(m => m.name.toLowerCase() === item.name.toLowerCase());
          const imageUrl = mapping ? getImgByName(mapping.id, 'w1000') : null;
          const fullImageUrl = mapping ? getImgByName(mapping.id, 'w2000') : null;

          return (
            <div
              key={item.name}
              className="relative overflow-hidden rounded-[2rem] h-80 border border-gray-200 dark:border-white/5 shadow-sm hover:shadow-2xl transition-all duration-300 group cursor-pointer bg-gray-100 dark:bg-[#151923]"
              onDoubleClick={() => { setSelectedJK(item); setIsModalOpen(true); }}
            >
              {/* 1. Background Image - Full Cover */}
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={item.name}
                  className="absolute inset-0 w-full h-full object-cover z-0 transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-900 z-0" />
              )}

              {/* Gradient Overlay - Less aggressive at bottom for transparency */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/60 z-0 pointer-events-none transition-opacity group-hover:opacity-80" />

              {/* 2. Content Layout */}
              <div className="absolute inset-0 flex flex-col z-10">

                {/* Top Section: Transparent Background */}
                <div className="flex-1 p-6 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 mr-4">
                      <h3 className="text-2xl font-black text-white drop-shadow-lg tracking-tight leading-tight mb-1">
                        {item.name}
                      </h3>
                      <div className="flex items-center gap-1.5 text-white/90 text-sm font-medium drop-shadow-md bg-black/20 backdrop-blur-sm px-2 py-1 rounded-lg inline-flex">
                        <MapPin size={14} className="text-indigo-300" />
                        {item.city}
                      </div>
                    </div>

                    {/* Expand Image Action */}
                    {fullImageUrl && (
                      <div
                        className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white opacity-0 group-hover:opacity-100 transition-all transform scale-90 group-hover:scale-100 hover:bg-white/30 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          setViewImage(fullImageUrl);
                        }}
                        title="Развернуть картинку"
                      >
                        <Maximize2 size={18} />
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Section: Data Container (40% height) - Semi-Transparent - NO BLUR */}
                <div className="h-[40%] bg-black/30 border-t border-white/10 p-4 flex flex-col justify-center transition-colors hover:bg-black/40 group/stats relative">
                  
                  {/* Tooltip on Hover */}
                  <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-48 bg-slate-800 text-white text-xs rounded-xl shadow-lg p-3 opacity-0 group-hover/stats:opacity-100 transition-opacity pointer-events-none z-50">
                        <div className="font-bold border-b border-white/10 pb-1 mb-1">{item.name}</div>
                        <div className="space-y-1">
                            <div className="flex justify-between"><span>Заказчик:</span> <span className="font-bold text-white">{item.client}</span></div>
                            <div className="flex justify-between"><span>Литеров:</span> <span className="font-bold text-orange-300">{item.liters}</span></div>
                            <div className="flex justify-between"><span>Лифтов:</span> <span className="font-bold text-indigo-300">{item.elevators}</span></div>
                            <div className="flex justify-between"><span>Этажей:</span> <span className="font-bold text-fuchsia-300">{item.floors}</span></div>
                        </div>
                        <div className="absolute left-1/2 -translate-x-1/2 -bottom-1 w-2 h-2 bg-slate-800 rotate-45"></div>
                  </div>

                  <div className="grid grid-cols-2 gap-x-6 gap-y-3">

                    {/* Client */}
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase font-bold text-white/60 tracking-wider mb-0.5 flex items-center gap-1.5">
                        <User size={12} className="text-white/80"/> ЗАКАЗЧИК
                      </span>
                      <span className="text-sm font-bold text-white truncate uppercase">
                        {item.client || '—'}
                      </span>
                    </div>

                    {/* Liters */}
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase font-bold text-white/60 tracking-wider mb-0.5 flex items-center gap-1.5">
                        <Building2 size={12} className="text-white/80"/> ЛИТЕРЫ
                      </span>
                      <span className="text-sm font-bold text-white">
                        {item.liters}
                      </span>
                    </div>

                    {/* Elevators */}
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase font-bold text-white/60 tracking-wider mb-0.5 flex items-center gap-1.5">
                        <ArrowUpFromLine size={12} className="text-white/80" /> ЛИФТОВ
                      </span>
                      <span className="text-sm font-bold text-indigo-300">
                        {item.elevators}
                      </span>
                    </div>

                    {/* Floors */}
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase font-bold text-white/60 tracking-wider mb-0.5 flex items-center gap-1.5">
                        <Layers size={12} className="text-white/80" /> ЭТАЖЕЙ
                      </span>
                      <span className="text-sm font-bold text-fuchsia-300">
                        {item.floors}
                      </span>
                    </div>

                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Image Preview Modal (Lightbox) */}
      {viewImage && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 animate-in fade-in duration-200"
          onClick={() => setViewImage(null)}
        >
          <button
            className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10"
            onClick={() => setViewImage(null)}
          >
            <X size={32} />
          </button>
          <img
            src={viewImage}
            alt="Expanded View"
            className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Data Details Modal */}
      {selectedJK && (
        <DetailsModal
          isOpen={isModalOpen}
          onClose={() => { setIsModalOpen(false); setSelectedJK(null); }}
          config={{
            template: 'custom',
            title: selectedJK.name,
            sheetKey: 'clientGrowth',
            dataColumn: '', // Not used for multi-context
            aggregation: 'count',
            filters: [],
            valuePrefix: '',
            valueSuffix: '',
            icon: '',
            showIcon: false,
            showTrend: false,
            trendValue: '',
            trendDirection: 'neutral',
            width: '100%',
            height: 'auto',
            colorTheme: 'blue',
            gradientFrom: '',
            gradientTo: '',
            elements: []
          }}
          dataContexts={modalContexts}
        />
      )}
    </div>
  );
};

export default HousingComplexSection;
