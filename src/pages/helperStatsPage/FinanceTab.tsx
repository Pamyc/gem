
import React, { useState, useEffect } from 'react';
import KPISection from './helperFinanceTab/KPISection';
import KPISection2 from './helperFinanceTab/KPISection2';
import ChartsSection from './helperFinanceTab/ChartsSection';
import CitySelector from './helperFinanceTab/CitySelector';
import YearSelector from './helperFinanceTab/YearSelector';
import HousingComplexSection from './helperFinanceTab/HousingComplexSection';
import ComplexComparisons from './helperFinanceTab/ComplexComparisons';
import ElevatorsByLiterGeneralChart from './components/ElevatorsByLiterGeneralChart';
import FinanceDynamicsSection from './helperFinanceTab/FinanceDynamicsSection';

interface FinanceTabProps {
  isDarkMode: boolean;
}

const FinanceTab: React.FC<FinanceTabProps> = ({ isDarkMode }) => {
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
        <CitySelector 
          selectedCity={selectedCity} 
          onSelectCity={setSelectedCity} 
        />
        <YearSelector 
          selectedYear={selectedYear} 
          onSelectYear={setSelectedYear}
          selectedCity={selectedCity}
        />
      </div>

      {/* KPI Section */}
      <KPISection selectedCity={selectedCity} selectedYear={selectedYear} />
      
      {/* Housing Complex Section */}
      <HousingComplexSection 
        isDarkMode={isDarkMode}
        selectedCity={selectedCity} 
        selectedYear={selectedYear}
      />

      {/* KPI Section 2 */}
      <KPISection2 selectedCity={selectedCity} selectedYear={selectedYear} />

      {/* Complex Comparisons */}
      <div className="w-full">
        <ComplexComparisons 
          isDarkMode={isDarkMode}
          selectedCity={selectedCity}
          selectedYear={selectedYear}
        />
      </div>

      {/* General Sunburst Chart */}
      <div className="w-full">
         <ElevatorsByLiterGeneralChart 
            isDarkMode={isDarkMode} 
            selectedCity={selectedCity}
            selectedYear={selectedYear}
         />
      </div>

      {/* Charts Grid */}
      <ChartsSection 
        isDarkMode={isDarkMode} 
        selectedCity={selectedCity} 
        selectedYear={selectedYear} 
      />

      {/* Dynamics Section */}
      <div className="w-full">
        <FinanceDynamicsSection 
          isDarkMode={isDarkMode}
          selectedCity={selectedCity}
        />
      </div>
      
    </div>
  );
};

export default FinanceTab;
