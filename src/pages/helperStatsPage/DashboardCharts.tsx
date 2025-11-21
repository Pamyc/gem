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
    <div className="w-full space-y-6">
      {/* Responsive Grid: 1 col mobile, 2 cols laptop, 3 cols desktop, 4 cols ultrawide */}
      <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 min-[2000px]:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-[#151923] p-6 rounded-3xl shadow-sm border border-gray-200 dark:border-white/5 transition-colors">
          <DynamicChart config={clientGrowthConfig} isDarkMode={isDarkMode} height="350px" />
        </div>
        <div className="bg-white dark:bg-[#151923] p-6 rounded-3xl shadow-sm border border-gray-200 dark:border-white/5 transition-colors">
          <DynamicChart config={testConfig} isDarkMode={isDarkMode} height="350px" />
        </div>
      </div>
    </div>
  );
};

export default DashboardCharts;