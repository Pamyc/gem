
export const COLORS = [
  '#3b82f6', // Blue
  '#f97316', // Orange
  '#8b5cf6', // Violet
  '#14b8a6', // Teal
  '#ec4899', // Pink
  '#eab308', // Yellow
  '#06b6d4', // Cyan
  '#6366f1', // Indigo
  '#a855f7', // Purple
];

export const STATUS_COLORS = {
  yes: '#22c55e', // Green 500
  no: '#ef4444',  // Red 500
};

export const SEPARATOR = ':::';
export const ALL_YEARS = 'Весь период';
export const ROOT_ID = 'root';

export type ChartType = 'bar' | 'sunburst';
export type ColorMode = 'jk' | 'status';

// Keys match the properties in RawItem/TooltipData
export type MetricKey = 
  | 'value' // Elevators
  | 'floors'
  | 'profit'
  | 'incomeFact'
  | 'expenseFact'
  | 'incomeLO'
  | 'expenseLO'
  | 'incomeMont'
  | 'expenseMont'
  | 'incomeObr'
  | 'expenseObr';

export const METRIC_OPTIONS: { key: MetricKey; label: string; prefix?: string; suffix?: string }[] = [
  { key: 'value', label: 'Кол-во лифтов', suffix: ' шт.' },
  { key: 'floors', label: 'Кол-во этажей', suffix: '' },
  { key: 'profit', label: 'Валовая прибыль', prefix: '₽ ' },
  { key: 'incomeFact', label: 'Доходы (Факт)', prefix: '₽ ' },
  { key: 'expenseFact', label: 'Расходы (Факт)', prefix: '₽ ' },
  { key: 'incomeLO', label: 'Доходы (ЛО)', prefix: '₽ ' },
  { key: 'expenseLO', label: 'Расходы (ЛО)', prefix: '₽ ' },
  { key: 'incomeMont', label: 'Доходы (Монтаж)', prefix: '₽ ' },
  { key: 'expenseMont', label: 'Расходы (Монтаж)', prefix: '₽ ' },
  { key: 'incomeObr', label: 'Доходы (Обрамление)', prefix: '₽ ' },
  { key: 'expenseObr', label: 'Расходы (Обрамление)', prefix: '₽ ' },
];

export interface TooltipData {
    value: number; // Elevators
    floors: number;
    profit: number; // Валовая
    percent?: string; // Dynamic percent based on active metric
    
    // New Fields
    incomeFact?: number;
    expenseFact?: number;
    incomeLO?: number;
    expenseLO?: number;
    incomeObr?: number;
    expenseObr?: number;
    incomeMont?: number;
    expenseMont?: number;
    profitPerLift?: number; // Average
}

export type RawItem = {
  city: string;
  jk: string;
  liter: string;
  value: number; // Elevators
  floors: number;
  profit: number;
  isHandedOver: boolean;
  
  // New Raw Fields
  incomeFact: number;
  expenseFact: number;
  incomeLO: number;
  expenseLO: number;
  incomeObr: number;
  expenseObr: number;
  incomeMont: number;
  expenseMont: number;
  profitPerLift: number;
};

export type LiterItem = {
  name: string;
  // Dynamic "value" for chart rendering
  value: number; 
  percent: string; // Dynamic percent

  // Static properties for tooltip
  elevators: number;
  floors: number;
  profit: number;
  isHandedOver: boolean;
  
  // New Fields
  incomeFact: number;
  expenseFact: number;
  incomeLO: number;
  expenseLO: number;
  incomeObr: number;
  expenseObr: number;
  incomeMont: number;
  expenseMont: number;
  profitPerLift: number;
};

export type JKItem = {
  name: string;
  value: number; // Dynamic
  percent: string; // Dynamic

  elevators: number;
  floors: number;
  profit: number;
  
  liters: LiterItem[];
  
  // New Fields
  incomeFact: number;
  expenseFact: number;
  incomeLO: number;
  expenseLO: number;
  incomeObr: number;
  expenseObr: number;
  incomeMont: number;
  expenseMont: number;
  profitPerLift: number; // Average
};

export type CitySummaryItem = {
  name: string;
  value: number; // Dynamic
  percent: string; // Dynamic

  elevators: number;
  floors: number;
  profit: number;
  color: string;
  jks: JKItem[];
  
  // New Fields
  incomeFact: number;
  expenseFact: number;
  incomeLO: number;
  expenseLO: number;
  incomeObr: number;
  expenseObr: number;
  incomeMont: number;
  expenseMont: number;
  profitPerLift: number; // Average
};
