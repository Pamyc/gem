import React from 'react';
import EChartComponent from '../../../components/charts/EChartComponent';
import { ProcessedDataItem } from '../../../hooks/useProcessedChartData';

interface TestChartProps {
  isDarkMode: boolean;
  data: ProcessedDataItem[];
}

const TestChart: React.FC<TestChartProps> = ({ isDarkMode, data }) => {
  
  const option = {
    backgroundColor: 'transparent',
    title: {
      text: 'Статистика по городам',
      subtext: 'Динамические данные',
      left: 'center',
      textStyle: {
        color: isDarkMode ? '#fff' : '#333'
      },
      subtextStyle: {
        color: isDarkMode ? '#aaa' : '#aaa'
      }
    },
    tooltip: {
      trigger: 'item'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      textStyle: {
        color: isDarkMode ? '#ccc' : '#333'
      }
    },
    series: [
      {
        name: 'Access From',
        type: 'pie',
        radius: '50%',
        data: data, 
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  };

  return (
    <div className="w-full h-full min-h-[350px]">
      <EChartComponent
        options={option}
        theme={isDarkMode ? 'dark' : 'light'}
        height="100%"
      />
    </div>
  );
};

export default TestChart;