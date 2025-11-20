import React from 'react';
import DashboardCharts from './helperStatsPage/DashboardCharts';

interface StatsPageProps {
  isDarkMode: boolean;
}

const StatsPage: React.FC<StatsPageProps> = ({ isDarkMode }) => {
  return (
    <DashboardCharts isDarkMode={isDarkMode} />
  );
};

export default StatsPage;