
import { ChartConfig } from '../types/chart';
import { prepareChartData } from './helperChartUtils/chartDataProcessor';
import { getPieOptions } from './helperChartUtils/chartOptionsPie';
import { getAxisOptions } from './helperChartUtils/chartOptionsAxis';

// Re-export helper functions for backward compatibility or use in other files
export { detectColumnType, parseValue } from './helperChartUtils/dataUtils';
export { getMergedHeaders } from './helperChartUtils/headerUtils';
export { generateComponentCode } from './helperChartUtils/codeGenerator';

export const processChartData = (
  rawData: any[][],
  headers: string[],
  config: ChartConfig,
  isDarkMode: boolean
) => {
  const prepared = prepareChartData(rawData, headers, config);
  if (!prepared) return null;
  
  const { groupedData, xValues } = prepared;

  if (config.chartType === 'pie' || config.chartType === 'donut') {
      return getPieOptions(groupedData, xValues, config, isDarkMode);
  } else {
      return getAxisOptions(groupedData, xValues, config, isDarkMode);
  }
};
