
import React, { useState, useEffect } from 'react';
import RegionSelector from './helperStatsPage/helperElevatorTab/RegionSelector';
import CitySelector from './helperStatsPage/helperElevatorTab/CitySelector';
import YearSelector from './helperStatsPage/helperElevatorTab/YearSelector';
import ComplexComparisons from './helperStatsPage/helperElevatorTab/ComplexComparisons';
import ComplexComparisonsDB from './helperStatsPage/helperElevatorTab/ComplexComparisonsDB';

interface TopTenPageProps {
  isDarkMode: boolean;
}

const TopTenPage: React.FC<TopTenPageProps> = ({ isDarkMode }) => {
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const container = document.getElementById('main-scroll-container');
    if (!container) return;

    const handleScroll = () => {
      setIsSticky(container.scrollTop > 50);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  // Сброс города при смене региона
  const handleRegionChange = (region: string) => {
    setSelectedRegion(region);
    setSelectedCity('');
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto space-y-10 pb-20">
      
      {/* Sticky Header for Selectors */}
      <div 
        className={`
          sticky top-[60px] z-40 flex flex-col items-start gap-1 transition-all duration-500 ease-in-out origin-top-left
          ${isSticky 
            ? 'bg-slate-50/90 dark:bg-[#0b0f19]/0 backdrop-blur-md p-4 -mx-4 px-8 rounded-b-2xl shadow-md border-b border-gray-200/10 transform scale-75 translate-y-[-10px] w-[133%]' 
            : 'w-full'
          }
          hover:scale-100 hover:translate-y-0 hover:w-full hover:bg-slate-50/95 hover:dark:bg-[#0b0f19]/0
        `}
      >
        <RegionSelector 
          selectedRegion={selectedRegion}
          onSelectRegion={handleRegionChange}
        />

        <CitySelector 
          selectedCity={selectedCity} 
          onSelectCity={setSelectedCity} 
          selectedRegion={selectedRegion}
        />
        
        <YearSelector 
          selectedYear={selectedYear} 
          onSelectYear={setSelectedYear}
          selectedCity={selectedCity}
          selectedRegion={selectedRegion}
        />
      </div>

      {/* Block 1: Google Sheets Source */}
      <div className="space-y-4">
        <div className="flex flex-col gap-1 border-l-4 border-indigo-500 pl-4">
           <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Источник: Google Sheets (Frontend)</h2>
           <p className="text-sm text-gray-500 dark:text-gray-400">
              Данные загружаются на клиент и обрабатываются в браузере.
           </p>
        </div>
        <div className="w-full">
          <ComplexComparisons 
            isDarkMode={isDarkMode}
            selectedCity={selectedCity}
            selectedYear={selectedYear}
            selectedRegion={selectedRegion}
          />
        </div>
      </div>

      {/* Block 2: Database Source */}
      <div className="space-y-4 pt-6 border-t border-gray-200 dark:border-white/10">
        <div className="flex flex-col gap-1 border-l-4 border-emerald-500 pl-4">
           <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Источник: PostgreSQL (Database)</h2>
           <p className="text-sm text-gray-500 dark:text-gray-400">
              Агрегация выполняется SQL-запросом на сервере.
           </p>
        </div>
        <div className="w-full">
          <ComplexComparisonsDB 
            isDarkMode={isDarkMode}
            selectedCity={selectedCity}
            selectedYear={selectedYear}
            selectedRegion={selectedRegion}
          />
        </div>
      </div>

    </div>
  );
};

export default TopTenPage;
