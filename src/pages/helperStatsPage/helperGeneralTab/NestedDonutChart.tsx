
import React, { useMemo } from 'react';
import EChartComponent from '../../../components/charts/EChartComponent';
import { ProcessedDataItem } from '../../../hooks/useProcessedChartData';

interface NestedDonutChartProps {
  isDarkMode: boolean;
  innerData: ProcessedDataItem[];
  outerData: ProcessedDataItem[];
  innerTitle?: string;
  outerTitle?: string;
  className?: string;
}

const colors = [
  '#6366f1', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6', '#0ea5e9', '#f43f5e', '#84cc16', '#14b8a6'
];

const NestedDonutChart: React.FC<NestedDonutChartProps> = ({ 
  isDarkMode, 
  innerData, 
  outerData,
  innerTitle = 'Внутренний',
  outerTitle = 'Внешний',
  className = "w-full h-[350px]"
}) => {

  const option = useMemo(() => {
    // Top-5 limitation for clarity in nested view, grouping others
    const processData = (data: ProcessedDataItem[], limit: number = 8) => {
        if (data.length <= limit) return data;
        const top = data.slice(0, limit);
        const others = data.slice(limit);
        const otherSum = others.reduce((acc, curr) => acc + curr.value, 0);
        if (otherSum > 0) {
            return [...top, { name: 'Прочее', value: otherSum }];
        }
        return top;
    };

    const finalInner = processData(innerData);
    const finalOuter = processData(outerData);

    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        backgroundColor: isDarkMode ? 'rgba(21, 25, 35, 0.9)' : 'rgba(255, 255, 255, 0.95)',
        borderColor: isDarkMode ? '#334155' : '#e2e8f0',
        textStyle: { color: isDarkMode ? '#f8fafc' : '#1e293b' },
        formatter: (params: any) => {
           return `
             <div style="font-weight:bold; margin-bottom:4px;">${params.seriesName}</div>
             ${params.marker} ${params.name}: <b>${params.value}</b> (${params.percent}%)
           `;
        }
      },
      legend: {
        show: true,
        bottom: 0,
        type: 'scroll',
        textStyle: { color: isDarkMode ? '#94a3b8' : '#64748b' },
        data: [...new Set([...finalInner.map(d => d.name), ...finalOuter.map(d => d.name)])]
      },
      series: [
        {
          name: innerTitle,
          type: 'pie',
          selectedMode: 'single',
          radius: [0, '30%'],
          center: ['50%', '50%'],
          label: {
            position: 'inner',
            fontSize: 10,
            color: '#fff',
            formatter: '{b}\n{c}'
          },
          labelLine: { show: false },
          itemStyle: {
             borderColor: isDarkMode ? '#1e293b' : '#fff',
             borderWidth: 1
          },
          data: finalInner.map((item, idx) => ({
              ...item,
              itemStyle: { color: colors[idx % colors.length] }
          }))
        },
        {
          name: outerTitle,
          type: 'pie',
          radius: ['45%', '65%'],
          center: ['50%', '50%'],
          label: {
            formatter: '{b}: {c}',
            color: isDarkMode ? '#e2e8f0' : '#1e293b',
            fontSize: 11
          },
          itemStyle: {
             borderColor: isDarkMode ? '#1e293b' : '#fff',
             borderWidth: 2,
             borderRadius: 4
          },
          // Try to match colors if names match, otherwise standard cycle
          data: finalOuter.map((item, idx) => {
              // Find matching index in inner to sync color if possible
              const innerIdx = finalInner.findIndex(i => i.name === item.name);
              const color = innerIdx !== -1 ? colors[innerIdx % colors.length] : colors[(idx + 2) % colors.length]; // Shift index for diff
              return {
                  ...item,
                  itemStyle: { color: color }
              };
          })
        }
      ]
    };
  }, [innerData, outerData, isDarkMode, innerTitle, outerTitle]);

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

export default NestedDonutChart;
