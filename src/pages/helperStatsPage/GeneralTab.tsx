
import React from 'react';
import ChartsSection from './helperGeneralTab/ChartsSection';
import HeaderStats from '../../components/HeaderStats';

interface GeneralTabProps {
  isDarkMode: boolean;
}

const GeneralTab: React.FC<GeneralTabProps> = ({ isDarkMode }) => {
  return (
    <div className="grid grid-cols-1 gap-6">
      {/* Financial Stats Header (Moved from Layout) */}
      <HeaderStats />
      
      {/* Charts Grid */}
      <ChartsSection isDarkMode={isDarkMode} />
    </div>
  );
};

export default GeneralTab;
