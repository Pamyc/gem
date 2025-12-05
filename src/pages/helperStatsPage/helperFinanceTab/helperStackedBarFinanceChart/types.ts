
export interface FinanceMetric {
  income: number;
  expense: number;
}

export type DataByYearMap = Map<string, Map<string, FinanceMetric>>;
export type YearTotalsMap = Map<string, FinanceMetric>;

export interface ProcessedFinanceData {
  sortedYears: string[];
  sortedJKs: string[];
  dataByYear: DataByYearMap;
  yearTotals: YearTotalsMap;
  availableYears: string[];
}
