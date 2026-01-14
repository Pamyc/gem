
import React, { useMemo } from 'react';
import EChartComponent from '../../components/charts/EChartComponent';
import { ProcessedDataItem } from '../../hooks/useProcessedChartData';
import { formatLargeNumber } from '../../utils/formatUtils';
import { getColorPalette, PaletteType } from './ColorPalette';

interface LineChartProps {
  isDarkMode: boolean;
  data: ProcessedDataItem[];
  title?: string;
  valuePrefix?: string;
  valueSuffix?: string;
  className?: string;
  paletteType?: PaletteType;
}

const LineChart: React.FC<LineChartProps> = ({
  isDarkMode,
  data,
  title,
  valuePrefix = '',
  valueSuffix = '',
  className = "w-full h-[350px]",
  paletteType = 'default'
}) => {

  const colors = useMemo(() => getColorPalette(paletteType as PaletteType), [paletteType]);
  // Use the first color of the palette as the primary color for line/area
  const primaryColor = colors[0] || '#8b5cf6';

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
        bottom: '3%',
        top: '15%',
        containLabel: true
      },
      dataZoom: [
        {
          type: 'inside', // Enables mouse wheel zooming
          start: 0,
          end: 100
        }
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
            color: primaryColor, 
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
            shadowColor: `${primaryColor}4D`, // 30% opacity hex
            shadowBlur: 10,
            shadowOffsetY: 5
          },
          areaStyle: {
            opacity: 0.2,
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: primaryColor }, 
                { offset: 1, color: 'rgba(255, 255, 255, 0)' }
              ]
            }
          }
        }
      ]
    };
  }, [data, isDarkMode, title, valuePrefix, valueSuffix, primaryColor]);

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