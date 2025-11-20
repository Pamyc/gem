import { LucideIcon } from 'lucide-react';

export type TabId = 'home' | 'form' | 'settings' | 'stats';

export interface MenuItem {
  id: TabId;
  label: string;
  icon: LucideIcon;
}

export interface ChartProps {
  options: any;
  height?: string;
}
