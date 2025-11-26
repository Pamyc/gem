
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useProcessedChartData } from '../../../hooks/useProcessedChartData';
import { ChevronDown, Loader2, Calendar } from 'lucide-react';

interface YearSelectorProps {
  selectedYear: string;
  onSelectYear: (year: string) => void;
  selectedCity: string;
}

const YearSelector: React.FC<YearSelectorProps> = ({ selectedYear, onSelectYear, selectedCity }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Config to fetch list of years
  const config = useMemo(() => {
    const filters: any[] = [
      {
        id: "aipx3lchq",
        column: "Итого (Да/Нет)",
        operator: "equals",
        value: "Нет"
      },
      {
        id: "hsinwt836",
        column: "Без разбивки на литеры (Да/Нет)",
        operator: "equals",
        value: "Да"
      }
    ];

    // Apply city filter if selected to restrict years to that city
    if (selectedCity) {
        filters.push({
            id: "city-context-filter",
            column: "Город",
            operator: "equals",
            value: selectedCity
        });
    }

    return { 
        sheetKey: 'clientGrowth', 
        xAxisColumn: 'Год', 
        yAxisColumn: 'Год', 
        aggregation: 'count' as const,
        filters: filters
    };
  }, [selectedCity]);

  const { data, isLoading } = useProcessedChartData(config);

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
    onSelectYear(name === 'Весь период' ? '' : name);
    setIsOpen(false);
  };

  const displayValue = selectedYear || 'Весь период';

  // Prepare options: "Весь период" + sorted years
  const options = useMemo(() => {
      if (isLoading) return [];
      
      const years = [...data].sort((a, b) => {
          // Sort descending numerically/alphabetically
          return String(b.name).localeCompare(String(a.name), undefined, { numeric: true });
      });
      
      return [{ name: 'Весь период', value: 0 }, ...years];
  }, [data, isLoading]);

  return (
    <div className="relative mb-6 z-40" ref={containerRef}>
      {/* Trigger Area */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 cursor-pointer select-none group transition-opacity hover:opacity-80"
        title="Нажмите для выбора периода"
      >
        <span className="text-2xl font-bold text-gray-500 dark:text-gray-400 tracking-tight">
          {isLoading ? "Загрузка..." : displayValue}
        </span>
        
        <ChevronDown 
          size={20} 
          className={`text-gray-400 dark:text-gray-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : 'rotate-0'} opacity-0 group-hover:opacity-100`} 
        />
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-56 max-h-60 overflow-y-auto bg-white dark:bg-[#1e293b] rounded-xl shadow-xl border border-gray-200 dark:border-white/10 animate-in fade-in slide-in-from-top-2 custom-scrollbar">
          {isLoading ? (
            <div className="p-4 flex items-center justify-center text-indigo-500">
              <Loader2 className="animate-spin" size={20} />
            </div>
          ) : (
            <div className="p-1">
              {options.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleSelect(item.name)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex justify-between items-center ${
                    displayValue === item.name
                      ? 'bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'
                  }`}
                >
                  <span>{item.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default YearSelector;
