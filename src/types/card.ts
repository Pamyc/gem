
import { ChartFilter } from './chart';

export type CardElementType = 'title' | 'value' | 'icon' | 'trend' | 'text' | 'shape';

export interface CardElementStyle {
  top: number;
  left: number;
  width?: number | 'auto';
  height?: number | 'auto';
  fontSize?: number;
  fontWeight?: 'normal' | 'bold' | '300' | '500' | '700' | '900';
  color?: string;
  backgroundColor?: string;
  borderRadius?: number;
  zIndex?: number;
  opacity?: number;
  textAlign?: 'left' | 'center' | 'right';
  padding?: number;
}

export interface CardVariable {
  id: string;
  name: string; // The variable name used in formula (e.g. "a", "total_revenue")
  sheetKey: string;
  dataColumn: string;
  aggregation: 'sum' | 'count' | 'average' | 'min' | 'max' | 'unique';
  filters: ChartFilter[];
}

export interface ElementDataSettings {
  sheetKey?: string; 
  dataColumn?: string;
  aggregation?: 'sum' | 'count' | 'average' | 'min' | 'max' | 'unique';
  filters?: ChartFilter[];
  // Advanced Calculation
  variables?: CardVariable[];
  formula?: string;
}

export interface CardElement {
  id: string;
  type: CardElementType;
  content?: string; // For static text
  dataBind?: 'value' | 'min' | 'max' | 'trend' | 'title'; // Which data calculated field to show
  style: CardElementStyle;
  iconName?: string; // Specific for icon type
  dataSettings?: ElementDataSettings; // Overrides for value calculation
}

export interface CardConfig {
  template: 'classic' | 'gradient' | 'minMax' | 'custom';
  title: string;
  
  // Data Source Configuration (Primary/Legacy)
  sheetKey: string;
  dataColumn: string;
  aggregation: 'sum' | 'count' | 'average' | 'min' | 'max' | 'unique';
  filters: ChartFilter[];

  // --- Advanced Calculation (Global - Legacy/Main) ---
  variables?: CardVariable[]; // List of hidden calculated fields
  mainFormula?: string; // Formula string, e.g. "{a} / {b} * 100"

  // Formatting
  valuePrefix: string;
  valueSuffix: string;
  compactNumbers?: boolean;

  // Visuals (Legacy/Template based)
  icon: string;
  showIcon: boolean;
  showTrend: boolean;
  trendValue: string;
  trendDirection: 'up' | 'down' | 'neutral';
  
  // Sizing & Dimensions
  width: string;
  height: string; // "300px" or number
  
  // Themes (Presets)
  colorTheme: string; 
  gradientFrom: string;
  gradientTo: string;

  // --- Advanced Styling Overrides ---
  backgroundColor?: string; 
  borderColor?: string;
  
  titleColor?: string;
  titleFontSize?: string;
  
  valueColor?: string;
  valueFontSize?: string;
  
  iconColor?: string;
  iconBackgroundColor?: string; 
  iconSize?: number;

  // --- New: Free Form Elements ---
  elements: CardElement[];
}
