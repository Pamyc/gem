
import { LucideIcon } from 'lucide-react';

export type TabId = 'home' | 'example' | 'settings' | 'stats' | 'constructor' | 'kpi' | 'card-constructor' | 'filter-test' | 'example2' | 'diagram3d' | 'test-embed' | 'db-gateway' | 'crud';

export interface MenuItem {
  id: TabId;
  label: string;
  icon: LucideIcon;
}

export interface ChartProps {
  options: any;
  height?: string;
  theme?: 'light' | 'dark';
  merge?: boolean;
}
