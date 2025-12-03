
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useProcessedChartData } from '../../../hooks/useProcessedChartData';
import { ChevronDown, Loader2 } from 'lucide-react';

interface CitySelectorProps {
  selectedCity: string;
  onSelectCity: (city: string) => void;
}

const CitySelector: React.FC<CitySelectorProps> = ({ selectedCity, onSelectCity }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const config = useMemo(() => ({ 
    sheetKey: 'clientGrowth', 
    xAxisColumn: 'Город', 
    yAxisColumn: 'Город', 
    aggregation: 'count' as const,
    filters: [
      { id: "aipx3lchq", column: "Итого (Да/Нет)", operator: "equals" as const, value: "Нет" },
      { id: "hsinwt836", column: "Без разбивки на литеры (Да/Нет)", operator: "equals" as const, value: "Да" }
    ]
  }), []);

  const { data, isLoading } = useProcessedChartData(config);

  useEffect(() => {
    if (!isLoading && data.length > 0 && !selectedCity) {
      const rostov = data.find(d => d.name === 'Ростов-на-Дону');
      if (rostov) {
        onSelectCity(rostov.name);
      } else {
        onSelectCity(data[0].name);
      }
    }
  }, [data, isLoading, selectedCity, onSelectCity]);

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
    <div className="relative mb-1 z-50" ref={containerRef}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-baseline gap-3 cursor-pointer select-none group transition-opacity hover:opacity-80"
        title="Нажмите для выбора города"
      >
        <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight drop-shadow-sm">
          {selectedCity || (isLoading ? "Загрузка..." : "Выберите город")}
        </h1>
        <ChevronDown 
          size={24} 
          className={`text-gray-400 dark:text-gray-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : 'rotate-0'} opacity-0 group-hover:opacity-100`} 
        />
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-72 max-h-80 overflow-y-auto bg-white dark:bg-[#1e293b] rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 animate-in fade-in slide-in-from-top-2 custom-scrollbar">
          {isLoading ? (
            <div className="p-4 flex items-center justify-center text-indigo-500">
              <Loader2 className="animate-spin" />
            </div>
          ) : (
            <div className="p-2">
              {data.map((item) => (
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
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CitySelector;
