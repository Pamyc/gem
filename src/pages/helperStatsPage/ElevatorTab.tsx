
import React, { useState, useEffect } from 'react';
import KPISection from './helperElevatorTab/KPISection';
import ChartsSection from './helperElevatorTab/ChartsSection';
import CitySelector from './helperElevatorTab/CitySelector';
import YearSelector from './helperElevatorTab/YearSelector';
import HousingComplexSection from './helperElevatorTab/HousingComplexSection';

interface ElevatorTabProps {
  isDarkMode: boolean;
}

const ElevatorTab: React.FC<ElevatorTabProps> = ({ isDarkMode }) => {
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const container = document.getElementById('main-scroll-container');
    if (!container) return;

    const handleScroll = () => {
      // Trigger slightly later than the main tabs to creating cascading effect
      setIsSticky(container.scrollTop > 50);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="flex flex-col gap-8">
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
        {/* Transparent Container with City Selector (Large Header) */}
        <CitySelector 
          selectedCity={selectedCity} 
          onSelectCity={setSelectedCity} 
        />
        {/* Year Selector below */}
        <YearSelector 
          selectedYear={selectedYear} 
          onSelectYear={setSelectedYear}
          selectedCity={selectedCity}
        />
      </div>

      {/* KPI Section with filtering */}
      <KPISection selectedCity={selectedCity} selectedYear={selectedYear} />
      
      {/* New Housing Complex Section */}
      <HousingComplexSection 
        isDarkMode={isDarkMode}
        selectedCity={selectedCity} 
        selectedYear={selectedYear}
      />

      {/* Charts Grid with filtering */}
      <ChartsSection 
        isDarkMode={isDarkMode} 
        selectedCity={selectedCity} 
        selectedYear={selectedYear} 
      />
    </div>
  );
};

export default ElevatorTab;