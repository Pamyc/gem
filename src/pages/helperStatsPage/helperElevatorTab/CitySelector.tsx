
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useProcessedChartData } from '../../../hooks/useProcessedChartData';
import { ChevronDown, Loader2 } from 'lucide-react';

interface CitySelectorProps {
  selectedCity: string;
  onSelectCity: (city: string) => void;
  selectedRegion?: string;
}

const CitySelector: React.FC<CitySelectorProps> = ({ selectedCity, onSelectCity, selectedRegion }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Config to fetch list of cities
  const config = useMemo(() => {
    const filters: any[] = [
      {
        id: "aipx3lchq",
        column: "Итого (Да/Нет)",
        operator: "equals" as const,
        value: "Нет"
      },
      {
        id: "hsinwt836",
        column: "Без разбивки на литеры (Да/Нет)",
        operator: "equals" as const,
        value: "Да"
      }
    ];

    // Apply region filter if selected
    if (selectedRegion) {
        filters.push({
            id: "region-context-filter",
            column: "Регион",
            operator: "equals",
            value: selectedRegion
        });
    }

    return { 
      sheetKey: 'clientGrowth', 
      xAxisColumn: 'Город', 
      yAxisColumn: 'Город', 
      aggregation: 'count' as const, // Count implies grouping by unique values
      filters: filters
    };
  }, [selectedRegion]);

  const { data, isLoading } = useProcessedChartData(config);

  // Calculate total count for "All Cities" badge
  const totalCount = useMemo(() => {
    return data.reduce((acc, item) => acc + item.value, 0);
  }, [data]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (name: string) => {
    onSelectCity(name);
    setIsOpen(false);
  };

  return (
    <div className="relative mb-1 z-40" ref={containerRef}>
      {/* Trigger Area - H2 Style (Secondary) */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-baseline gap-2 cursor-pointer select-none group transition-opacity"
        title="Нажмите для выбора города"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-gray-700 dark:text-gray-200 tracking-tight flex items-center gap-2">
          {selectedCity || "Все города"}
        </h2>
        
        <ChevronDown 
          size={24} 
          className={`text-gray-400 dark:text-gray-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : 'rotate-0'} opacity-0 group-hover:opacity-100`} 
        />
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-72 max-h-80 overflow-y-auto bg-white dark:bg-[#1e293b] rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 animate-in fade-in slide-in-from-top-2 custom-scrollbar">
          {isLoading ? (
            <div className="p-4 flex items-center justify-center text-indigo-500">
              <Loader2 className="animate-spin" />
            </div>
          ) : (
            <div className="p-2">
              {/* Option: All Cities */}
              <button
                onClick={() => handleSelect('')}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-colors flex justify-between items-center ${
                  selectedCity === ''
                    ? 'bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'
                }`}
              >
                <span>Все города</span>
                <span className="text-xs font-normal text-gray-400 bg-white dark:bg-black/20 px-2 py-0.5 rounded-md">
                  {totalCount}
                </span>
              </button>

              {data.length === 0 ? (
                 <div className="px-4 py-3 text-xs text-gray-400 italic">Нет городов для выбранного региона</div>
              ) : (
                data.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => handleSelect(item.name)}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-colors flex justify-between items-center ${
                      selectedCity === item.name
                        ? 'bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'
                    }`}
                  >
                    <span>{item.name}</span>
                    <span className="text-xs font-normal text-gray-400 bg-white dark:bg-black/20 px-2 py-0.5 rounded-md">
                      {item.value}
                    </span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CitySelector;
