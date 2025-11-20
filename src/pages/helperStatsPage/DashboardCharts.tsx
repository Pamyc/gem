import React, { useMemo } from 'react';
import DynamicChart from '../../components/charts/DynamicChart';
import { ChartConfig } from '../../types/chart';

interface DashboardChartsProps {
  isDarkMode: boolean;
}

const DashboardCharts: React.FC<DashboardChartsProps> = ({ isDarkMode }) => {
  
  const clientGrowthConfig: ChartConfig = useMemo(() => ({
    title: "Динамика этажей по городам (Live)",
    sheetKey: "clientGrowth",
    chartType: "line",
    xAxisColumn: "Город",
    yAxisColumn: "Кол-во этажей",
    segmentColumn: "",
    aggregation: "sum",
    isCumulative: false,
    showLabels: false,
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
    showLabels: false,
    filters: []
  }), []);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Bottom Row: Bar and Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-[#151923] p-6 rounded-3xl shadow-sm border border-gray-200 dark:border-white/5 transition-colors">
          {/* Replaced repetitive logic with reusable DynamicChart component */}
          <DynamicChart config={clientGrowthConfig} isDarkMode={isDarkMode} height="300px" />
        </div>
        <div className="bg-white dark:bg-[#151923] p-6 rounded-3xl shadow-sm border border-gray-200 dark:border-white/5 transition-colors">
          {/* Replaced repetitive logic with reusable DynamicChart component */}
          <DynamicChart config={testConfig} isDarkMode={isDarkMode} height="300px" />
        </div>
      </div>
    </div>
  );
};

export default DashboardCharts;