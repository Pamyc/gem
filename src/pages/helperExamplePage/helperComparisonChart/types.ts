import React, { ReactNode } from 'react';

export type ComparisonCategory = 'client' | 'city' | 'jk' | 'liter' | 'year' | 'status' | 'region';

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
  aggregation: 'sum' | 'avg'; // New field to determine calculation logic
}

export interface ComparisonFilterState {
  years: string[];
  regions: string[];
  cities: string[];
  jks: string[];
  clients: string[];
  statuses: string[];
  objectTypes: string[];
}

export interface ComparisonFilterOptions {
  years: string[];
  regions: string[];
  cities: string[];
  jks: string[];
  clients: string[];
  statuses: string[];
  objectTypes: string[];
}

export interface TreeOption {
  label: string;
  value?: string;
  children?: TreeOption[];
}

export interface ComparisonDataResult {
  treeOptions: TreeOption[];
  aggregatedData: Map<string, Record<string, number>>;
  filterOptions: ComparisonFilterOptions;
}