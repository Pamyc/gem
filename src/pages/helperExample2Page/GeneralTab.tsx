import React from 'react';
import KPISection from './KPISection';
import ChartsSection from './ChartsSection';

interface GeneralTabProps {
  isDarkMode: boolean;
  mainColor: string;
}

const GeneralTab: React.FC<GeneralTabProps> = ({ isDarkMode, mainColor }) => {
  return (
    <div className="grid grid-cols-1 gap-6">
      {/* KPI Section Copy */}
      <KPISection />
      
      {/* Charts Grid Copy */}
      <ChartsSection isDarkMode={isDarkMode}   mainColor={mainColor} />
    </div>
  );
};

export default GeneralTab;