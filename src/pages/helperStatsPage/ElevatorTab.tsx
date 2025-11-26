
import React, { useState } from 'react';
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

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col items-start gap-1">
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
