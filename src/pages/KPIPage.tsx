import React from 'react';
import AuroraCard from './helperKPIPage/AuroraCard';
import TechCard from './helperKPIPage/TechCard';
import ImmersiveCard from './helperKPIPage/ImmersiveCard';
import ClassicKPISection from './helperKPIPage/ClassicKPISection';
import MultiMetricCard from './helperKPIPage/MultiMetricCard';

interface KPIPageProps {
  isDarkMode: boolean;
}

const KPIPage: React.FC<KPIPageProps> = ({ isDarkMode }) => {
  return (
    <div className="w-full space-y-20 pb-20">
      
      {/* Modern "Explosive" Sections */}
      <AuroraCard />
      
      <div className="border-t border-gray-200 dark:border-white/5 pt-10">
         <TechCard />
      </div>
      
      <div className="border-t border-gray-200 dark:border-white/5 pt-10">
         <ImmersiveCard isDarkMode={isDarkMode} />
      </div>

      {/* Complex Data Layouts */}
      <div className="border-t border-gray-200 dark:border-white/5 pt-10">
         <MultiMetricCard />
      </div>

      {/* Classic & Functional Sections */}
      <div className="border-t border-gray-200 dark:border-white/5 pt-10">
         <ClassicKPISection isDarkMode={isDarkMode} />
      </div>

    </div>
  );
};

export default KPIPage;