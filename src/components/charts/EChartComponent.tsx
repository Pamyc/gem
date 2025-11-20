import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { ChartProps } from '../../types';

const EChartComponent: React.FC<ChartProps> = ({ options, height = "300px" }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    // Инициализация графика
    if (chartRef.current) {
      if (!chartInstance.current) {
        chartInstance.current = echarts.init(chartRef.current);
      }
      chartInstance.current.setOption(options);
    }

    // Функция изменения размера
    const resizeChart = () => {
      chartInstance.current?.resize();
    };

    // ResizeObserver следит за размером контейнера
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
  }, [options]);

  return <div ref={chartRef} style={{ width: '100%', height, overflow: 'hidden' }} />;
};

export default EChartComponent;