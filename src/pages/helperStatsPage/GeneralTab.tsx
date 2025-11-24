import React from 'react';
import KPISection from './helperGeneralTab/KPISection';
import ChartsSection from './helperGeneralTab/ChartsSection';

interface GeneralTabProps {
  isDarkMode: boolean;
}

const GeneralTab: React.FC<GeneralTabProps> = ({ isDarkMode }) => {
  return (
    <div className="grid grid-cols-1 gap-6">
      {/* KPI Section */}
      <KPISection />
      
      {/* Charts Grid */}
      <ChartsSection isDarkMode={isDarkMode} />
    </div>
  );
};

export default GeneralTab;