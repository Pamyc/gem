
import { ReactNode } from 'react';

export type ComparisonCategory = 'client' | 'city' | 'jk' | 'liter' | 'year' | 'status';

export interface CategoryOption {
  value: ComparisonCategory;
  label: string;
  icon: React.ElementType;
}

export interface MetricConfig {
  key: string;
  label: string;
  suffix?: string;
  prefix?: string;
  isMoney?: boolean;
}

export interface ComparisonFilterState {
  years: string[];
  cities: string[];
  jks: string[];
  clients: string[];
  statuses: string[];
  objectTypes: string[];
}

export interface ComparisonFilterOptions {
  years: string[];
  cities: string[];
  jks: string[];
  clients: string[];
  statuses: string[];
  objectTypes: string[];
}

export interface ComparisonDataResult {
  availableItems: string[];
  aggregatedData: Map<string, Record<string, number>>;
  filterOptions: ComparisonFilterOptions;
}
