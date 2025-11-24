import React, { useMemo } from 'react';
import NestedPieChart from './helperExamplePage/NestedPieChart';
import { Database } from 'lucide-react';
import { useProcessedChartData } from '../hooks/useProcessedChartData';
import { ChartConfig } from '../types/chart';

interface ExamplePageProps {
  isDarkMode?: boolean;
}

const ExamplePage: React.FC<ExamplePageProps> = ({ isDarkMode = false }) => {

  // 1. Определяем конфигурацию для получения данных.
  // Это тот же формат, что в конструкторе графиков.
  // Мы хотим посчитать количество записей (лифтов/домов) сгруппированных по Городу.
  const chartConfig: Partial<ChartConfig> = useMemo(() => ({
    sheetKey: 'clientGrowth',  // Ключ таблицы из DataContext
    xAxisColumn: 'Город',      // Поле группировки (Имя куска пирога)
    yAxisColumn: 'Город',      // Поле значения (для Count можно то же самое)
    aggregation: 'count',      // Тип агрегации: count, sum, average...

    // Можно добавить фильтры, как в конструкторе:
    filters: [
      // { id: '1', column: 'Статус', operator: 'equals', value: 'В работе' } 
    ]
  }), []);

  // 2. Используем наш новый хук. Он сам заберет данные, отфильтрует и сгруппирует.
  const { data, isLoading } = useProcessedChartData(chartConfig);

  // Берем топ-7 для красоты графика
  const topData = useMemo(() => data.slice(0, 7), [data]);

  return (
    <div className="w-full max-w-[1152px] mx-auto space-y-6">

      
        <p className="text-gray-500 dark:text-gray-400 max-w-2xl">
          пример
        </p>
      </div>

  );
};

export default ExamplePage;
