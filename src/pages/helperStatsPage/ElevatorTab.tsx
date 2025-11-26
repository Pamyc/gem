
import React, { useState } from 'react';
import KPISection from './helperElevatorTab/KPISection';
import ChartsSection from './helperElevatorTab/ChartsSection';
import CitySelector from './helperElevatorTab/CitySelector';
import YearSelector from './helperElevatorTab/YearSelector';

interface ElevatorTabProps {
  isDarkMode: boolean;
}

const ElevatorTab: React.FC<ElevatorTabProps> = ({ isDarkMode }) => {
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-start">
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
