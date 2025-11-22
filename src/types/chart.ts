import { LucideIcon } from 'lucide-react';

export type TabId = 'home' | 'example' | 'settings' | 'stats' | 'constructor' | 'kpi' | 'card-constructor';

export interface MenuItem {
  id: TabId;
  label: string;
  icon: LucideIcon;
}

export interface ChartProps {
  options: any;
  height?: string;
  theme?: 'light' | 'dark';
}

export type AggregationType = 'sum' | 'count' | 'average' | 'min' | 'max';
export type ChartType = 'line' | 'bar' | 'area' | 'pie' | 'donut';
export type FilterOperator = 'equals' | 'contains' | 'greater' | 'less' | 'between' | 'in';

export interface ChartFilter {
  id: string;
  column: string;
  operator: FilterOperator;
  value: string;
}

export interface ChartConfig {
  title: string;
  sheetKey: string;
  chartType: ChartType;
  xAxisColumn: string;
  yAxisColumn: string;
  segmentColumn: string; // Group By (Series)
  aggregation: AggregationType;
  isCumulative: boolean;
  showLabels: boolean;
  showDataZoomSlider: boolean;
  showLegend: boolean;
  filters: ChartFilter[];
}