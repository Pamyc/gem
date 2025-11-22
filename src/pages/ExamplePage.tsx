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
        
        {/* Header Block */}
        <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-500/20 rounded-lg text-indigo-600 dark:text-indigo-400">
                 <Database size={20} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Пример интеграции данных</h2>
            </div>
            <p className="text-gray-500 dark:text-gray-400 max-w-2xl">
              Этот пример демонстрирует использование хука <code className="px-1 py-0.5 bg-gray-100 dark:bg-white/10 rounded font-mono text-sm">useProcessedChartData</code>. 
              Мы получаем "сырые" данные из Google Sheets, применяем логику фильтрации из конструктора и передаем готовый массив в кастомный компонент.
            </p>
        </div>

        {/* Chart Container */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Left: The Chart */}
            <div className="bg-white dark:bg-[#151923] rounded-3xl p-6 shadow-sm border border-gray-200 dark:border-white/5">
                <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-white">Распределение по городам</h3>
                {isLoading ? (
                   <div className="h-[400px] flex items-center justify-center text-gray-400">Загрузка данных...</div>
                ) : topData.length > 0 ? (
                   <NestedPieChart isDarkMode={isDarkMode} data={topData} />
                ) : (
                   <div className="h-[400px] flex items-center justify-center text-gray-400">Нет данных</div>
                )}
            </div>

            {/* Right: Data Debug View */}
            <div className="bg-white dark:bg-[#151923] rounded-3xl p-6 shadow-sm border border-gray-200 dark:border-white/5 flex flex-col">
                <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-white">Полученные данные (JSON)</h3>
                <div className="flex-1 bg-gray-50 dark:bg-[#0b0f19] rounded-xl p-4 overflow-auto font-mono text-xs text-gray-600 dark:text-gray-400 border border-gray-100 dark:border-white/5 custom-scrollbar">
                   <pre>{JSON.stringify(topData, null, 2)}</pre>
                </div>
                <div className="mt-4 text-xs text-gray-400">
                   * Показаны топ-7 значений, отсортированные по убыванию
                </div>
            </div>

        </div>
    </div>
  );
};

export default ExamplePage;
