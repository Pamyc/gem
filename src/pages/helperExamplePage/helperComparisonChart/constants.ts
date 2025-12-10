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
  // 1. Основные количественные
  { key: 'elevators', label: 'Кол-во лифтов', suffix: ' шт.', aggregation: 'sum' },
  { key: 'floors', label: 'Кол-во этажей', suffix: ' эт.', aggregation: 'sum' },
  
  // 2. План / Факт Итого
  { key: 'incomePlan', label: 'Доходы (План)', isMoney: true, prefix: '₽ ', aggregation: 'sum' },
  { key: 'expensePlan', label: 'Расходы (План)', isMoney: true, prefix: '₽ ', aggregation: 'sum' },
  { key: 'incomeFact', label: 'Доходы (Факт)', isMoney: true, prefix: '₽ ', aggregation: 'sum' },
  { key: 'expenseFact', label: 'Расходы (Факт)', isMoney: true, prefix: '₽ ', aggregation: 'sum' },
  
  // 3. Прибыль и Средние
  { key: 'profit', label: 'Валовая прибыль', isMoney: true, prefix: '₽ ', aggregation: 'sum' },
  { key: 'profitAvg', label: 'Средняя валовая', isMoney: true, prefix: '₽ ', aggregation: 'avg' },
  { key: 'rentability', label: 'Рентабельность (Ср.)', suffix: '%', aggregation: 'avg' },
  { key: 'profitPerLift', label: 'Прибыль с 1 лифта (Ср.)', isMoney: true, prefix: '₽ ', aggregation: 'avg' },
  
  // 4. Детализация (Лифтовое оборудование)
  { key: 'incomeLO', label: 'Доходы (Лифт. оборуд.)', isMoney: true, prefix: '₽ ', aggregation: 'sum' },
  { key: 'expenseLO', label: 'Расходы (Лифт. оборуд.)', isMoney: true, prefix: '₽ ', aggregation: 'sum' },
  
  // 5. Детализация (Обрамление)
  { key: 'incomeObr', label: 'Доходы (Обрамление)', isMoney: true, prefix: '₽ ', aggregation: 'sum' },
  { key: 'expenseObr', label: 'Расходы (Обрамление)', isMoney: true, prefix: '₽ ', aggregation: 'sum' },
  
  // 6. Детализация (Монтаж)
  { key: 'incomeMont', label: 'Доходы (Монтаж)', isMoney: true, prefix: '₽ ', aggregation: 'sum' },
  { key: 'expenseMont', label: 'Расходы (Монтаж)', isMoney: true, prefix: '₽ ', aggregation: 'sum' },
];