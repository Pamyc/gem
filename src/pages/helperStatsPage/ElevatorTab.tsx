
import React, { useState, useEffect, useRef } from 'react';
import KPISection from './helperElevatorTab/KPISection';
import KPISection2 from './helperElevatorTab/KPISection2';
import ChartsSection from './helperElevatorTab/ChartsSection';
import RegionSelector from './helperElevatorTab/RegionSelector';
import CitySelector from './helperElevatorTab/CitySelector';
import YearSelector from './helperElevatorTab/YearSelector';
import HousingComplexSection from './helperElevatorTab/HousingComplexSection';
import ComplexComparisons from './helperElevatorTab/ComplexComparisons';
import ElevatorsByLiterGeneralChart from './components/ElevatorsByLiterGeneralChart';
import ElevatorDynamicsSection from './helperElevatorTab/ElevatorDynamicsSection';

interface ElevatorTabProps {
  isDarkMode: boolean;
}

type PanelState = 'active' | 'shrunk' | 'hidden';

const ElevatorTab: React.FC<ElevatorTabProps> = ({ isDarkMode }) => {
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');
  
  // Sticky & Animation State
  const [isSticky, setIsSticky] = useState(false);
  const [panelState, setPanelState] = useState<PanelState>('active');
  
  // Timers refs with correct types
  const shrinkTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const vanishTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = () => {
    if (shrinkTimer.current) clearTimeout(shrinkTimer.current);
    if (vanishTimer.current) clearTimeout(vanishTimer.current);
    shrinkTimer.current = null;
    vanishTimer.current = null;
  };

  // Scroll Listener
  useEffect(() => {
    const container = document.getElementById('main-scroll-container');
    if (!container) return;

    const handleScroll = () => {
      const shouldBeSticky = container.scrollTop > 50;
      setIsSticky(shouldBeSticky);
    };

    container.addEventListener('scroll', handleScroll);
    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Auto-hide Effect based on Sticky State
  useEffect(() => {
    if (isSticky) {
      // Как только панель прилипла, запускаем таймер скрытия
      clearTimers();
      shrinkTimer.current = setTimeout(() => {
        setPanelState('hidden');
        
        
      }, 1000);
    } else {
      // Если вернулись наверх - показываем панель
      setPanelState('active');
      clearTimers();
    }

    return () => clearTimers();
  }, [isSticky]);

  const handleMouseEnter = () => {
    // Пробуждение: мгновенный возврат
    clearTimers();
    setPanelState('active');
  };

  const handleMouseLeave = () => {
    // Запускаем цепочку исчезновения только если панель "липкая"
    if (!isSticky) return;

    clearTimers();

    // Фаза 1: Сжатие через 1 сек
    shrinkTimer.current = setTimeout(() => {
      setPanelState('hidden');
      
      
    }, 1000);
  };

  // When Region changes, reset City to avoid invalid state
  const handleRegionChange = (region: string) => {
    setSelectedRegion(region);
    setSelectedCity('');
  };

  // Dynamic classes based on state
  const getContainerClasses = () => {
    const baseClasses = "sticky top-[60px] z-40 flex flex-col items-start gap-1 transition-all duration-700 ease-in-out origin-top-left";
    
    if (!isSticky) {
      return `${baseClasses} w-full`;
    }

    // Sticky Active
    if (panelState === 'active') {
      return `${baseClasses} bg-slate-50/90 dark:bg-[#0b0f19]/0 backdrop-blur-md p-4 -mx-4 px-8 rounded-b-2xl shadow-md border-b border-gray-200/10 w-[133%] scale-100 opacity-100`;
    }


    // Sticky Hidden (0%)
    if (panelState === 'hidden') {
      return `${baseClasses} bg-slate-50/0 dark:bg-[#0b0f19]/0 p-4 -mx-4 px-8 w-[133%] scale-50 opacity-0 translate-y-[-20px] pointer-events-auto`; // pointer-events-auto allows hover to wake it up
    }

    return baseClasses;
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Sticky Header for Selectors */}
      <div 
        className={getContainerClasses()}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Region Selector */}
        <RegionSelector 
          selectedRegion={selectedRegion}
          onSelectRegion={handleRegionChange}
        />

        {/* City Selector (Filtered by Region) */}
        <CitySelector 
          selectedCity={selectedCity} 
          onSelectCity={setSelectedCity} 
          selectedRegion={selectedRegion}
        />
        
        {/* Year Selector */}
        <YearSelector 
          selectedYear={selectedYear} 
          onSelectYear={setSelectedYear}
          selectedCity={selectedCity}
          selectedRegion={selectedRegion}
        />
      </div>

      {/* KPI Section with filtering */}
      <KPISection selectedCity={selectedCity} selectedYear={selectedYear} selectedRegion={selectedRegion} />
      
      {/* New Housing Complex Section */}
      <HousingComplexSection 
        isDarkMode={isDarkMode}
        selectedCity={selectedCity} 
        selectedYear={selectedYear}
        selectedRegion={selectedRegion}
      />

      {/* KPI Section 2 with filtering */}
      <KPISection2 selectedCity={selectedCity} selectedYear={selectedYear} selectedRegion={selectedRegion} />

      {/* NEW: Complex Comparisons (Elevators/Floors per Liter) */}
      <div className="w-full">
        <ComplexComparisons 
          isDarkMode={isDarkMode}
          selectedCity={selectedCity}
          selectedYear={selectedYear}
          selectedRegion={selectedRegion}
        />
      </div>

      {/* General Sunburst Chart */}
      <div className="w-full">
         <ElevatorsByLiterGeneralChart 
            isDarkMode={isDarkMode} 
            selectedCity={selectedCity}
            selectedYear={selectedYear}
            selectedRegion={selectedRegion}
         />
      </div>

      {/* Charts Grid with filtering */}
      <ChartsSection 
        isDarkMode={isDarkMode} 
        selectedCity={selectedCity} 
        selectedYear={selectedYear} 
        selectedRegion={selectedRegion}
      />

      {/* Dynamics Section (New) */}
      <div className="w-full">
        <ElevatorDynamicsSection 
          isDarkMode={isDarkMode}
          selectedCity={selectedCity}
          selectedRegion={selectedRegion}
        />
      </div>
      
    </div>
  );
};

export default ElevatorTab;
