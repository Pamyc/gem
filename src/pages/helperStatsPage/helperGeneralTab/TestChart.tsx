import React, { useMemo } from 'react';
import EChartComponent from '../../../components/charts/EChartComponent';
import { ProcessedDataItem } from '../../../hooks/useProcessedChartData';

interface TestChartProps {
  isDarkMode: boolean;
  data: ProcessedDataItem[];
  className?: string;
}

const colors = [
  '#6366f1', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6', '#0ea5e9', '#f43f5e', '#84cc16', '#14b8a6'
];

const TestChart: React.FC<TestChartProps> = ({ isDarkMode, data, className = "w-full h-[350px]" }) => {

  const processedData = useMemo(() => {
    return data.map((item, index) => ({
      ...item,
      itemStyle: { color: colors[index % colors.length] }
    }));
  }, [data]);

  const option = {
    backgroundColor: 'transparent',
    title: {
      text: 'Статистика по городам',
      left: 'center',
      textStyle: { color: isDarkMode ? '#e2e8f0' : '#1e293b' }
    },
    tooltip: {
      trigger: 'item',
      backgroundColor: isDarkMode ? 'rgba(21, 25, 35, 0.9)' : 'rgba(255, 255, 255, 0.95)',
      borderColor: isDarkMode ? '#334155' : '#e2e8f0',
      textStyle: { color: isDarkMode ? '#f8fafc' : '#1e293b' },
      formatter: '{b}: {c} ({d}%)'
    },
    series: [
      {
        name: 'Статистика по городам',
        type: 'pie',
        radius: ['17%', '37%'],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 5,
          borderColor: isDarkMode ? '#1e293b' : '#fff',
          borderWidth: 2
        },
        label: {
          show: true,
          formatter: '{per|{d}%} {st|{c}шт.}\n {b|{b} }    ',
          backgroundColor: isDarkMode ? '#334155' : '#F6F8FC',
          borderColor: isDarkMode ? '#475569' : '#8C8D8E',
          borderWidth: 1,
          borderRadius: 4,
          rich: {
            a: {
              color: isDarkMode ? '#94a3b8' : '#6E7079',
              lineHeight: 22,
              align: 'center'
            },
            hr: {
              borderColor: isDarkMode ? '#475569' : '#8C8D8E',
              width: '100%',
              borderWidth: 1,
              height: 0
            },
            b: {
              color: isDarkMode ? '#fff' : '#4C5058',
              fontSize: 14,
              fontWeight: 'bold',
              lineHeight: 33,
              padding: [3, 4],
              align: 'center'
            },
            per: {
              color: '#fff',
              backgroundColor: isDarkMode ? '#6366f1' : '#4C5058',
              padding: [3, 4],
              borderRadius: 4,
              align: 'center'
            },
            st: {
              color: '#fff',
              backgroundColor: isDarkMode ? '#6366f1' : '#4C5058',
              padding: [3, 4],
              borderRadius: 4,
              align: 'center'
            }
          }
        },
        labelLine: {
          show: true,
          length: 10,
          length2: 7
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold'
          }
        },
        data: processedData
      }
    ]
  };

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

export default TestChart;