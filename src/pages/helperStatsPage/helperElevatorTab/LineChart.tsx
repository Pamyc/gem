
import React, { useMemo } from 'react';
import EChartComponent from '../../../components/charts/EChartComponent';
import { ProcessedDataItem } from '../../../hooks/useProcessedChartData';
import { formatLargeNumber } from '../../../utils/formatUtils';

interface LineChartProps {
  isDarkMode: boolean;
  data: ProcessedDataItem[];
  title?: string;
  valuePrefix?: string;
  valueSuffix?: string;
  className?: string;
}

const LineChart: React.FC<LineChartProps> = ({
  isDarkMode,
  data,
  title,
  valuePrefix = '',
  valueSuffix = '',
  className = "w-full h-[350px]"
}) => {

  const option = useMemo(() => {
    return {
      backgroundColor: 'transparent',
      title: {
        text: title,
        left: 'center',
        textStyle: { color: isDarkMode ? '#e2e8f0' : '#1e293b' }
      },
      tooltip: {
        trigger: 'axis',
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
        right: '4%',
        bottom: '3%', // Reduced from 15% since slider is gone
        top: '15%',
        containLabel: true
      },
      dataZoom: [
        {
          type: 'inside', // Enables mouse wheel zooming
          start: 0,
          end: 100
        }
        // Slider removed
      ],
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: data.map(d => d.name),
        axisLabel: { 
            color: isDarkMode ? '#94a3b8' : '#64748b',
            interval: 0,
            rotate: 30,
            formatter: (value: string) => value.length > 10 ? value.substring(0, 10) + '...' : value
        },
        axisLine: { lineStyle: { color: isDarkMode ? '#334155' : '#cbd5e1' } }
      },
      yAxis: {
        type: 'value',
        axisLabel: { 
            color: isDarkMode ? '#94a3b8' : '#64748b',
            formatter: (value: number) => formatLargeNumber(value, valuePrefix)
        },
        splitLine: { lineStyle: { color: isDarkMode ? '#334155' : '#e2e8f0', type: 'dashed' } }
      },
      series: [
        {
          name: title,
          type: 'line',
          data: data.map(d => d.value),
          smooth: true,
          symbol: 'circle',
          symbolSize: 8,
          itemStyle: {
            color: '#8b5cf6', // Violet
            borderColor: isDarkMode ? '#1e293b' : '#fff',
            borderWidth: 2
          },
          label: {
            show: true,
            position: 'top',
            color: isDarkMode ? '#e2e8f0' : '#1e293b',
            formatter: (params: any) => formatLargeNumber(params.value, valuePrefix) + valueSuffix,
            fontSize: 11,
            fontWeight: 'bold'
          },
          lineStyle: {
            width: 3,
            shadowColor: 'rgba(139, 92, 246, 0.3)',
            shadowBlur: 10,
            shadowOffsetY: 5
          },
          areaStyle: {
            opacity: 0.2,
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: '#8b5cf6' }, 
                { offset: 1, color: 'rgba(139, 92, 246, 0)' }
              ]
            }
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

export default LineChart;
