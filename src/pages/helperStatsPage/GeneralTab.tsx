import React, { useMemo } from 'react';
import DynamicChart from '../../components/charts/DynamicChart';
import { ChartConfig } from '../../types/chart';

interface GeneralTabProps {
  isDarkMode: boolean;
}

const GeneralTab: React.FC<GeneralTabProps> = ({ isDarkMode }) => {
  
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
    </div>
  );
};

export default GeneralTab;