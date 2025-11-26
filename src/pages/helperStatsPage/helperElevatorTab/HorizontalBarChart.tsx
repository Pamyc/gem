
import React, { useMemo } from 'react';
import EChartComponent from '../../../components/charts/EChartComponent';
import { ProcessedDataItem } from '../../../hooks/useProcessedChartData';
import { formatLargeNumber } from '../../../utils/formatUtils';

interface HorizontalBarChartProps {
  isDarkMode: boolean;
  data: ProcessedDataItem[];
  title?: string;
  valuePrefix?: string;
  valueSuffix?: string;
  className?: string;
}

const HorizontalBarChart: React.FC<HorizontalBarChartProps> = ({
  isDarkMode,
  data,
  title,
  valuePrefix = '',
  valueSuffix = '',
  className = "w-full h-[350px]"
}) => {

  const option = useMemo(() => {
    // ECharts puts the first item at the bottom of the Y-axis by default.
    // To show the highest value (rank #1) at the top, we reverse the array.
    // Assuming 'data' is already sorted descending by value from the hook.
    const chartData = [...data].reverse();

    return {
      backgroundColor: 'transparent',
      title: {
        text: title,
        left: 'center',
        textStyle: { color: isDarkMode ? '#e2e8f0' : '#1e293b' }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        backgroundColor: isDarkMode ? 'rgba(21, 25, 35, 0.9)' : 'rgba(255, 255, 255, 0.95)',
        borderColor: isDarkMode ? '#334155' : '#e2e8f0',
        textStyle: { color: isDarkMode ? '#f8fafc' : '#1e293b' },
        formatter: (params: any) => {
            const item = params[0];
            const val = formatLargeNumber(item.value, valuePrefix);
            return `${item.name}<br/>${item.marker} <b>${val}${valueSuffix}</b>`;
       }
      },
      grid: {
        left: '3%',
        right: '10%', // Extra space for labels on right
        bottom: '3%',
        top: '10%',
        containLabel: true
      },
      xAxis: {
        type: 'value',
        boundaryGap: [0, 0.01],
        axisLabel: { 
            color: isDarkMode ? '#94a3b8' : '#64748b',
            formatter: (value: number) => formatLargeNumber(value, valuePrefix)
        },
        splitLine: { lineStyle: { color: isDarkMode ? '#334155' : '#e2e8f0', type: 'dashed' } }
      },
      yAxis: {
        type: 'category',
        data: chartData.map(d => d.name),
        axisLabel: { 
            color: isDarkMode ? '#94a3b8' : '#64748b',
            fontWeight: 'bold'
        },
        axisLine: { lineStyle: { color: isDarkMode ? '#334155' : '#cbd5e1' } }
      },
      series: [
        {
          name: title,
          type: 'bar',
          data: chartData.map(d => d.value),
          itemStyle: {
            color: '#6366f1',
            borderRadius: [0, 4, 4, 0]
          },
          label: {
            show: true,
            position: 'right',
            color: isDarkMode ? '#e2e8f0' : '#1e293b',
            formatter: (params: any) => formatLargeNumber(params.value, valuePrefix) + valueSuffix
          }
        }
      ]
    };
  }, [data, isDarkMode, title, valuePrefix, valueSuffix]);

  return (
    <div className={className}>
      <EChartComponent
        options={option}
        theme={isDarkMode ? 'dark' : 'light'}
        height="100%"
      />
    </div>
  );
};

export default HorizontalBarChart;
