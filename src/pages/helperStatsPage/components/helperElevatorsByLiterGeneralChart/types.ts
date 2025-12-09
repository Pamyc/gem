

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

export interface FilterState {
  years: string[];
  regions: string[];
  cities: string[];
  jks: string[];
  clients: string[];
  statuses: string[]; // "Сдан" / "В работе"
  objectTypes: string[];
}

export interface FilterOptions {
  years: string[];
  regions: string[];
  cities: string[];
  jks: string[];
  clients: string[];
  statuses: string[];
  objectTypes: string[];
}

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

    // Text Aggregates (Arrays of unique values)
    clients: string[];
    cities: string[];
    jks: string[];
    statuses: string[]; // Handed Over "Да"/"Нет"
    objectTypes: string[];
    years: string[];
}

export type RawItem = {
  city: string;
  jk: string;
  liter: string;
  
  // Text fields
  client: string;
  objectType: string;
  year: string;
  
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
  
  // Financials
  incomeFact: number;
  expenseFact: number;
  incomeLO: number;
  expenseLO: number;
  incomeObr: number;
  expenseObr: number;
  incomeMont: number;
  expenseMont: number;
  profitPerLift: number;

  // Text Metadata
  clients: string[];
  cities: string[];
  jks: string[];
  statuses: string[];
  objectTypes: string[];
  years: string[];
};

export type JKItem = {
  name: string;
  value: number; // Dynamic
  percent: string; // Dynamic

  elevators: number;
  floors: number;
  profit: number;
  
  liters: LiterItem[];
  
  // Financials
  incomeFact: number;
  expenseFact: number;
  incomeLO: number;
  expenseLO: number;
  incomeObr: number;
  expenseObr: number;
  incomeMont: number;
  expenseMont: number;
  profitPerLift: number; // Average

  // Text Aggregates
  clients: string[];
  cities: string[];
  jks: string[];
  statuses: string[];
  objectTypes: string[];
  years: string[];
};

export type CitySummaryItem = {
  name: string;
  value: number; // Dynamic
  percent: string; // Dynamic

  elevators: number;
  floors: number;
  profit: number;
  color: string;
  childrenJKs: JKItem[];
  
  // Financials
  incomeFact: number;
  expenseFact: number;
  incomeLO: number;
  expenseLO: number;
  incomeObr: number;
  expenseObr: number;
  incomeMont: number;
  expenseMont: number;
  profitPerLift: number; // Average

  // Text Aggregates
  clients: string[];
  cities: string[];
  jks: string[];
  statuses: string[];
  objectTypes: string[];
  years: string[];
};
