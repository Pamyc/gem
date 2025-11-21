
import { ChartConfig } from '../../types/chart';

export const generateComponentCode = (config: ChartConfig) => {
  const configString = JSON.stringify(config, null, 2).replace(/"(\w+)":/g, '$1:');

  return `
import React, { useMemo } from 'react';
import DynamicChart from '../components/charts/DynamicChart'; // Make sure path is correct
import { ChartConfig } from '../types/chart';

const MyChartWidget = () => {
  
  const config: ChartConfig = useMemo(() => (${configString}), []);

  return (
    <DynamicChart 
      config={config} 
      isDarkMode={true} // Or pass from props
      height="300px" 
    />
  );
};

export default MyChartWidget;
  `;
};
