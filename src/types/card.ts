import { ChartFilter } from './chart';

export interface CardConfig {
  template: 'classic' | 'gradient';
  title: string;
  
  // Data Source Configuration
  sheetKey: string;
  dataColumn: string;
  aggregation: 'sum' | 'count' | 'average' | 'min' | 'max' | 'unique';
  filters: ChartFilter[];

  // Formatting
  valuePrefix: string;
  valueSuffix: string;

  // Visuals
  icon: string;
  showIcon: boolean;
  showTrend: boolean;
  trendValue: string;
  trendDirection: 'up' | 'down' | 'neutral';
  
  // Sizing
  width: string;
  height: string;
  
  // Classic Theme
  colorTheme: string;
  // Gradient Theme
  gradientFrom: string;
  gradientTo: string;
}