
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

export interface TooltipData {
    value: number;
    floors: number;
    profit: number; // Валовая
    percent?: string; // Elevators %
    percentFloors?: string;
    percentProfit?: string;
    
    // New Fields
    incomeFact?: number;
    expenseFact?: number;
    incomeLO?: number;
    expenseLO?: number;
    incomeObr?: number;
    expenseObr?: number;
    incomeMont?: number;
    expenseMont?: number;
    rentability?: number; // Average
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
  rentability: number;
  profitPerLift: number;
};

export type LiterItem = {
  name: string;
  value: number;
  floors: number;
  profit: number;
  isHandedOver: boolean;
  percent: string; // Elevators %
  percentFloors: string;
  percentProfit: string;
  
  // New Fields
  incomeFact: number;
  expenseFact: number;
  incomeLO: number;
  expenseLO: number;
  incomeObr: number;
  expenseObr: number;
  incomeMont: number;
  expenseMont: number;
  rentability: number;
  profitPerLift: number;
};

export type JKItem = {
  name: string;
  value: number;
  floors: number;
  profit: number;
  percent: string;
  percentFloors: string;
  percentProfit: string;
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
  rentability: number; // Average
  profitPerLift: number; // Average
};

export type CitySummaryItem = {
  name: string;
  value: number;
  floors: number;
  profit: number;
  percent: string;
  percentFloors: string;
  percentProfit: string;
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
  rentability: number; // Average
  profitPerLift: number; // Average
};
