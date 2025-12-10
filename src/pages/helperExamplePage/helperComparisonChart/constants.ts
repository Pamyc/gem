import { Users, Building, MapPin, Calendar, Layers, CheckCircle2, Globe } from 'lucide-react';
import { CategoryOption, MetricConfig } from './types';

export const CATEGORIES: CategoryOption[] = [
  { value: 'status', label: 'Статус сдачи', icon: CheckCircle2 },
  { value: 'client', label: 'Клиент', icon: Users },
  { value: 'year', label: 'Год', icon: Calendar },
  { value: 'region', label: 'Регион', icon: Globe },
  { value: 'city', label: 'Город', icon: MapPin },
  { value: 'jk', label: 'ЖК', icon: Building },
  { value: 'liter', label: 'Литер', icon: Layers },
];

export const METRICS: MetricConfig[] = [
  { key: 'elevators', label: 'Кол-во лифтов', suffix: ' шт.' },
  { key: 'floors', label: 'Кол-во этажей', suffix: '' },
  { key: 'incomeFact', label: 'Доходы (Факт)', isMoney: true, prefix: '₽ ' },
  { key: 'expenseFact', label: 'Расходы (Факт)', isMoney: true, prefix: '₽ ' },
];