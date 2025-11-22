import React, { useMemo } from 'react';
import DynamicChart from '../../components/charts/DynamicChart';
import { ChartConfig } from '../../types/chart';
import TestChart from './helperTestTab/TestChart';
import { useProcessedChartData } from '../../hooks/useProcessedChartData';

interface TestTabProps {
  isDarkMode: boolean;
}

const TestTab: React.FC<TestTabProps> = ({ isDarkMode }) => {
  
  const clientGrowthConfig: ChartConfig = useMemo(() => ({
    title: "Динамика этажей по городам (Live)",
    sheetKey: "clientGrowth",
    chartType: "line",
    xAxisColumn: "Город",
    yAxisColumn: "Кол-во этажей",
    segmentColumn: "",
    aggregation: "sum",
    isCumulative: false,
    showLabels: true,
    showDataZoomSlider: false,
    showLegend: true,
    filters: []
  }), []);

  const testConfig: ChartConfig = useMemo(() => ({
    title: "Мой новый график",
    sheetKey: "clientGrowth",
    chartType: "bar",
    xAxisColumn: "ЖК",
    yAxisColumn: "Кол-во лифтов",
    segmentColumn: "",
    aggregation: "sum",
    isCumulative: false,
    showLabels: true,
    showDataZoomSlider: false,
    showLegend: true,
    filters: []
  }), []);

  const elevatorsByCityConfig: ChartConfig = useMemo(() => ({
    title: "Кол-во лифтов",
    sheetKey: "clientGrowth",
    chartType: "donut",
    xAxisColumn: "Город",
    yAxisColumn: "Кол-во лифтов",
    segmentColumn: "Город",
    aggregation: "sum",
    isCumulative: false,
    showLabels: true,
    showDataZoomSlider: false,
    showLegend: false,
    filters: [
      { id: 'f1', column: "Итого (Да/Нет)", operator: 'equals', value: "Нет" },
      { id: 'f2', column: "Без разбивки на литеры (Да/Нет)", operator: 'equals', value: "Да" }, 
    ]
  }), []);

  const corsByCityConfig: ChartConfig = useMemo(() => ({
    title: "Кол-во этажей",
    sheetKey: "clientGrowth",
    chartType: "pie",
    xAxisColumn: "Город",
    yAxisColumn: "Кол-во этажей",
    segmentColumn: "Город",
    aggregation: "sum",
    isCumulative: false,
    showLabels: true,
    showDataZoomSlider: false,
    showLegend: false,
    filters: [
      { id: 'f1', column: "Итого (Да/Нет)", operator: 'equals', value: "Нет" },
      { id: 'f2', column: "Без разбивки на литеры (Да/Нет)", operator: 'equals', value: "Да" }, 
    ]
  }), []);

  // Конфигурация для TestChart
  const testChartDataConfig = useMemo(() => ({
    sheetKey: 'clientGrowth',
    xAxisColumn: 'Город',
    yAxisColumn: 'Город',
    aggregation: 'count' as const,
  }), []);

  const { data: testChartData, isLoading } = useProcessedChartData(testChartDataConfig);
  const topData = useMemo(() => testChartData.slice(0, 7), [testChartData]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 min-[2000px]:grid-cols-3 gap-6">
      <div className="bg-white dark:bg-[#151923] p-6 rounded-3xl shadow-sm border border-gray-200 dark:border-white/5 transition-colors hover:border-indigo-500/20 dark:hover:border-indigo-500/20">
        <DynamicChart config={clientGrowthConfig} isDarkMode={isDarkMode} height="350px" />
      </div>
      <div className="bg-white dark:bg-[#151923] p-6 rounded-3xl shadow-sm border border-gray-200 dark:border-white/5 transition-colors hover:border-indigo-500/20 dark:hover:border-indigo-500/20">
        <DynamicChart config={testConfig} isDarkMode={isDarkMode} height="350px" />
      </div>
       <div className="bg-white dark:bg-[#151923] p-6 rounded-3xl shadow-sm border border-gray-200 dark:border-white/5 transition-colors hover:border-indigo-500/20 dark:hover:border-indigo-500/20">
        <DynamicChart config={elevatorsByCityConfig} isDarkMode={isDarkMode} height="350px" />
      </div>
      <div className="bg-white dark:bg-[#151923] p-6 rounded-3xl shadow-sm border border-gray-200 dark:border-white/5 transition-colors hover:border-indigo-500/20 dark:hover:border-indigo-500/20">
        <DynamicChart config={corsByCityConfig} isDarkMode={isDarkMode} height="350px" />
      </div>
      
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

export default TestTab;