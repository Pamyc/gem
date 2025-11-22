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