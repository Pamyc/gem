import React, { useMemo } from 'react';
import TestChart from './helperGeneralTab/TestChart';
import { useProcessedChartData } from '../../hooks/useProcessedChartData';

interface GeneralTabProps {
  isDarkMode: boolean;
}

const GeneralTab: React.FC<GeneralTabProps> = ({ isDarkMode }) => {



  // Конфигурация для TestChart
  const testChartDataConfig = useMemo(() => ({
    sheetKey: 'clientGrowth',
    xAxisColumn: 'Город',
    yAxisColumn: 'Кол-во лифтов',
    aggregation: 'sum',
    filters: [
      {
        "id": "o09z9l2b4",
        "column": "Итого (Да/Нет)",
        "operator": "equals",
        "value": "Нет"
      },
      {
        "id": "aagerz8uy",
        "column": "Без разбивки на литеры (Да/Нет)",
        "operator": "equals",
        "value": "Да"
      }
    ]
  }), []);

  const { data } = useProcessedChartData(testChartDataConfig);

  const { data: testChartData, isLoading } = useProcessedChartData(testChartDataConfig);
  const topData = useMemo(() => testChartData.slice(0, 7), [testChartData]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 min-[2000px]:grid-cols-3 gap-6">


      <div className="bg-white dark:bg-[#151923] rounded-3xl p-6 shadow-sm border border-gray-200 dark:border-white/5 hover:border-indigo-500/20 dark:hover:border-indigo-500/20 transition-colors">
        <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-white">Распределение по городам</h3>
        {isLoading ? (
          <div className="h-[350px] flex items-center justify-center text-gray-400">Загрузка данных...</div>
        ) : topData.length > 0 ? (
          <TestChart isDarkMode={isDarkMode} data={topData} />
        ) : (
          <div className="h-[350px] flex items-center justify-center text-gray-400">Нет данных</div>
        )}
      </div>
    </div>
  );
};

export default GeneralTab;