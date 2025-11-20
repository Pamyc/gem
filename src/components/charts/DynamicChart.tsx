import React, { useMemo } from 'react';
import { useDataStore } from '../../contexts/DataContext';
import { ChartConfig } from '../../types/chart';
import { processChartData, getMergedHeaders } from '../../utils/chartUtils';
import EChartComponent from './EChartComponent';

interface DynamicChartProps {
  config: ChartConfig;
  isDarkMode: boolean;
  height?: string;
}

const DynamicChart: React.FC<DynamicChartProps> = ({ config, isDarkMode, height = "300px" }) => {
  const { googleSheets, sheetConfigs } = useDataStore();

  const chartOptions = useMemo(() => {
    if (!config.sheetKey) return null;

    // 1. Получаем данные листа
    const sheetData = googleSheets[config.sheetKey as keyof typeof googleSheets];
    if (!sheetData || !sheetData.headers || sheetData.headers.length === 0) return null;

    // 2. Находим конфиг листа для заголовков
    const currentSheetConfig = sheetConfigs.find(c => c.key === config.sheetKey);
    const headerRowsCount = currentSheetConfig?.headerRows || 1;

    // 3. Формируем понятные заголовки
    const availableColumns = getMergedHeaders(sheetData.headers, headerRowsCount);

    // 4. Генерируем опции для ECharts
    return processChartData(
      sheetData.rows,
      availableColumns,
      config,
      isDarkMode
    );
  }, [googleSheets, sheetConfigs, config, isDarkMode]);

  if (!chartOptions) {
    return (
      <div className="flex items-center justify-center text-gray-400 text-sm h-full" style={{ height }}>
        Загрузка данных графика...
      </div>
    );
  }

  return (
    <EChartComponent
      options={chartOptions}
      height={height}
      theme={isDarkMode ? 'dark' : 'light'}
    />
  );
};

export default DynamicChart;