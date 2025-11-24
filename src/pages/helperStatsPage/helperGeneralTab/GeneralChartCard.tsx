import React, { useMemo } from 'react';
import { useProcessedChartData, ProcessedDataItem } from '../../../hooks/useProcessedChartData';
import { ChartConfig } from '../../../types/chart';

interface GeneralChartCardProps {
  config: Partial<ChartConfig>;
  children: (data: ProcessedDataItem[]) => React.ReactNode;
}

const GeneralChartCard: React.FC<GeneralChartCardProps> = ({ config, children }) => {
  const { data, isLoading } = useProcessedChartData(config);
  const topData = useMemo(() => data.slice(0, 7), [data]);

  return (
    <div className="bg-white dark:bg-[#151923] rounded-3xl p-6 shadow-sm border border-gray-200 dark:border-white/5 hover:border-indigo-500/20 dark:hover:border-indigo-500/20 transition-colors">
      {isLoading ? (
        <div className="h-[350px] flex items-center justify-center text-gray-400">Загрузка данных...</div>
      ) : topData.length > 0 ? (
        children(topData)
      ) : (
        <div className="h-[350px] flex items-center justify-center text-gray-400">Нет данных</div>
      )}
    </div>
  );
};

export default GeneralChartCard;