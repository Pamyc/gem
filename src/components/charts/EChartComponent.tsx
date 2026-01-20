
import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import * as echarts from 'echarts';
import { ChartProps } from '../../types';

export interface EChartInstance {
  getInstance: () => echarts.ECharts | null;
}

const EChartComponent = forwardRef<EChartInstance, ChartProps>(({ options, height = "300px", theme, merge = false }, ref) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  // Expose the instance to the parent via ref
  useImperativeHandle(ref, () => ({
    getInstance: () => chartInstance.current
  }));

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
      // Оборачиваем в rAF, чтобы избежать ошибки "ResizeObserver loop completed with undelivered notifications"
      window.requestAnimationFrame(() => {
        resizeChart();
      });
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
      // Создаем копию опций, чтобы безопасно модифицировать
      const finalOptions = { ...options };

      // Принудительно устанавливаем confine: true для тултипа,
      // чтобы он не выходил за границы графика и не вызывал появление скроллбаров
      if (finalOptions.tooltip && typeof finalOptions.tooltip === 'object' && !Array.isArray(finalOptions.tooltip)) {
        finalOptions.tooltip = {
          ...finalOptions.tooltip,
          confine: true
        };
      }

      // Важно: используем второй параметр (notMerge).
      // Если merge = true, то notMerge = false.
      // По умолчанию merge = false, значит notMerge = true (старое поведение).
      chartInstance.current.setOption(finalOptions, !merge);
    }
  }, [options, merge]);

  return <div ref={chartRef} style={{ width: '100%', height, overflow: 'hidden' }} />;
});

export default EChartComponent;
