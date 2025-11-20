import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { ChartProps } from '../../types';

const EChartComponent: React.FC<ChartProps> = ({ options, height = "300px", theme }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  // Эффект для инициализации и смены темы
  useEffect(() => {
    if (chartRef.current) {
      // Если экземпляр уже есть, удаляем его перед созданием нового с новой темой
      if (chartInstance.current) {
        chartInstance.current.dispose();
      }

      // Инициализируем с явным указанием темы (dark или undefined для light)
      chartInstance.current = echarts.init(chartRef.current, theme === 'dark' ? 'dark' : undefined, {
        renderer: 'canvas'
      });
    }

    const resizeChart = () => {
      chartInstance.current?.resize();
    };

    const resizeObserver = new ResizeObserver(() => {
      resizeChart();
    });

    if (chartRef.current) {
      resizeObserver.observe(chartRef.current);
    }

    window.addEventListener('resize', resizeChart);

    return () => {
      window.removeEventListener('resize', resizeChart);
      resizeObserver.disconnect();
      chartInstance.current?.dispose();
      chartInstance.current = null;
    };
  }, [theme]); // Перезапуск только при смене темы

  // Эффект для обновления данных (опций)
  useEffect(() => {
    if (chartInstance.current) {
      chartInstance.current.setOption(options);
    }
  }, [options]);

  return <div ref={chartRef} style={{ width: '100%', height, overflow: 'hidden' }} />;
};

export default EChartComponent;