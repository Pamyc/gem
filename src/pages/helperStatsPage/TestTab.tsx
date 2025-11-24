import React, { useMemo, useState } from 'react';
import DynamicChart from '../../components/charts/DynamicChart';
import { ChartConfig } from '../../types/chart';
import TestChart from './helperTestTab/TestChart';
import { useProcessedChartData } from '../../hooks/useProcessedChartData';
import { Maximize2, X } from 'lucide-react';

interface TestTabProps {
  isDarkMode: boolean;
}

const TestTab: React.FC<TestTabProps> = ({ isDarkMode }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
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
  // Для маленькой карточки берем только топ-7
  const topData = useMemo(() => testChartData.slice(0, 7), [testChartData]);

  return (
    <>
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
        
        <div className="bg-white dark:bg-[#151923] rounded-3xl p-6 shadow-sm border border-gray-200 dark:border-white/5 hover:border-indigo-500/20 dark:hover:border-indigo-500/20 transition-colors flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white">Распределение по городам</h3>
              <button 
                onClick={() => setIsExpanded(true)}
                className="p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors"
                title="Развернуть"
              >
                <Maximize2 size={18} />
              </button>
            </div>
            
            <div className="flex-1 min-h-[350px]">
                {isLoading ? (
                  <div className="h-full flex items-center justify-center text-gray-400">Загрузка данных...</div>
                ) : topData.length > 0 ? (
                  <TestChart isDarkMode={isDarkMode} data={topData} />
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400">Нет данных</div>
                )}
            </div>
        </div>
      </div>

      {/* Expanded Modal */}
      {isExpanded && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-white dark:bg-[#151923] w-full max-w-6xl h-[85vh] rounded-3xl shadow-2xl border border-gray-200 dark:border-white/10 flex flex-col overflow-hidden">
              <div className="p-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between bg-gray-50/50 dark:bg-[#151923]">
                 <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Распределение по городам</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Полная статистика</p>
                 </div>
                 <button 
                   onClick={() => setIsExpanded(false)}
                   className="p-2.5 bg-gray-100 dark:bg-white/10 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/20 hover:text-gray-900 dark:hover:text-white transition-all"
                 >
                    <X size={24} />
                 </button>
              </div>
              <div className="flex-1 p-6 bg-white dark:bg-[#0b0f19] overflow-hidden">
                 {testChartData.length > 0 ? (
                    <TestChart isDarkMode={isDarkMode} data={testChartData} className="w-full h-full" /> 
                 ) : (
                    <div className="h-full flex items-center justify-center text-gray-400">Нет данных</div>
                 )}
              </div>
           </div>
        </div>
      )}
    </>
  );
};

export default TestTab;