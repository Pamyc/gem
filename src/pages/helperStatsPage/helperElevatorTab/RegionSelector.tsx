
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useProcessedChartData } from '../../../hooks/useProcessedChartData';
import { ChevronDown, Loader2 } from 'lucide-react';

interface RegionSelectorProps {
  selectedRegion: string;
  onSelectRegion: (region: string) => void;
}

const RegionSelector: React.FC<RegionSelectorProps> = ({ selectedRegion, onSelectRegion }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Config to fetch list of regions
  const config = useMemo(() => ({ 
    sheetKey: 'clientGrowth', 
    xAxisColumn: 'Регион', 
    yAxisColumn: 'Регион', 
    aggregation: 'count' as const, // Count implies grouping by unique values
    filters: [
      {
        id: "reg_total_filter",
        column: "Итого (Да/Нет)",
        operator: "equals" as const,
        value: "Нет"
      },
      {
        id: "reg_breakdown_filter",
        column: "Без разбивки на литеры (Да/Нет)",
        operator: "equals" as const,
        value: "Да"
      }
    ]
  }), []);

  const { data, isLoading } = useProcessedChartData(config);

  // Calculate total count for "All Regions" badge
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
    onSelectRegion(name);
    setIsOpen(false);
  };

  return (
    <div className="relative mb-2 z-50" ref={containerRef}>
      {/* Trigger Area - H1 Style (Main Header) */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-3 cursor-pointer select-none group transition-opacity hover:opacity-80"
        title="Нажмите для выбора региона"
      >
        <h1 className="text-3xl md:text-4xl font-bold text-gray-700 dark:text-gray-200 tracking-tight flex items-center gap-2">
            {selectedRegion || "Все регионы"}
        </h1>
        
        <ChevronDown 
          size={32} 
          className={`text-gray-400 dark:text-gray-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : 'rotate-0'} opacity-0 group-hover:opacity-100`} 
        />
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-72 max-h-80 overflow-y-auto bg-white dark:bg-[#1e293b] rounded-xl shadow-xl border border-gray-200 dark:border-white/10 animate-in fade-in slide-in-from-top-2 custom-scrollbar">
          {isLoading ? (
            <div className="p-4 flex items-center justify-center text-indigo-500">
              <Loader2 className="animate-spin" />
            </div>
          ) : (
            <div className="p-2">
              <button
                onClick={() => handleSelect('')}
                className={`w-full text-left px-4 py-3 rounded-lg text-base font-bold transition-colors flex justify-between items-center ${
                  selectedRegion === ''
                    ? 'bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'
                }`}
              >
                <span>Все регионы</span>
                <span className="text-xs font-normal text-gray-400 bg-white dark:bg-black/20 px-2 py-0.5 rounded-md">
                  {totalCount}
                </span>
              </button>

              {data.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleSelect(item.name)}
                  className={`w-full text-left px-4 py-3 rounded-lg text-base font-bold transition-colors flex justify-between items-center ${
                    selectedRegion === item.name
                      ? 'bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'
                  }`}
                >
                  <span>{item.name}</span>
                  <span className="text-sm font-normal text-gray-400 bg-white dark:bg-black/20 px-2 py-0.5 rounded-md">
                    {item.value}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RegionSelector;
