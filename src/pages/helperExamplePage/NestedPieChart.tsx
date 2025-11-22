import React from 'react';
import EChartComponent from '../../components/charts/EChartComponent';
import { ProcessedDataItem } from '../../hooks/useProcessedChartData';

interface NestedPieChartProps {
  isDarkMode: boolean;
  data: ProcessedDataItem[];
}

const NestedPieChart: React.FC<NestedPieChartProps> = ({ isDarkMode, data }) => {
  
  // Вы можете копировать код ниже прямо с примеров ECharts, 
  // просто заменяя поле data: [...] на data: data
  
  const option = {
    title: {
      text: 'Статистика по городам',
      subtext: 'Динамические данные',
      left: 'center',
      textStyle: {
        // Адаптация цвета текста под тему, чтобы было видно и на темном, и на светлом
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
        
        // --- ВАЖНО: Здесь мы подставляем данные из пропсов ---
        data: data, 
        // ----------------------------------------------------

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

export default NestedPieChart;