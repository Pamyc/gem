
import { useMemo } from 'react';
import { formatLargeNumber } from '../../../../utils/formatUtils';
import { ProcessedFinanceData } from './types';
import { COLORS } from './constants';
import { getTooltipFormatter } from './tooltipFormatter';

export const useChartOptions = (
  isDarkMode: boolean,
  data: ProcessedFinanceData | null,
  visibleMetrics: { income: boolean; expense: boolean },
  groupingMode: 'jk' | 'client'
) => {
  return useMemo(() => {
    if (!data) return null;

    const { sortedYears, sortedJKs, dataByYear, yearTotals } = data;

    const series: any[] = [];

    sortedJKs.forEach((jk, idx) => {
      const color = COLORS[idx % COLORS.length];

      // Серия Доходов
      if (visibleMetrics.income) {
        const incomeData = sortedYears.map(y => {
          const val = dataByYear.get(y)?.get(jk)?.income || 0;
          return val === 0 ? null : val;
        });

        series.push({
          name: jk, // Одинаковое имя для связи легенды
          id: `inc_${jk}`,
          type: 'bar',
          stack: 'Income',
          data: incomeData,
          emphasis: { focus: 'series' },
          itemStyle: {
            color: color,
            borderRadius: [0, 0, 0, 0]
          },
          label: {
            show: true,
            position: 'inside',
            formatter: (p: any) => p.value > 0 ? formatLargeNumber(p.value) : '',
            fontSize: 10,
            color: '#fff',
            textBorderColor: 'rgba(0,0,0,0.5)',
            textBorderWidth: 2,
            fontWeight: 'bold'
          }
        });
      }

      // Серия Расходов
      if (visibleMetrics.expense) {
        const expenseData = sortedYears.map(y => {
          const val = dataByYear.get(y)?.get(jk)?.expense || 0;
          return val === 0 ? null : val;
        });

        series.push({
          name: jk, // Одинаковое имя для связи легенды
          id: `exp_${jk}`,
          type: 'bar',
          stack: 'Expense',
          data: expenseData,
          emphasis: { focus: 'series' },
          itemStyle: {
            color: color,
            opacity: 0.5, // Прозрачность для отличия
            borderColor: color,
            borderWidth: 1,
            borderType: 'solid',
            borderRadius: [0, 0, 0, 0]
          },
          label: {
            show: true,
            position: 'inside',
            formatter: (p: any) => p.value > 0 ? formatLargeNumber(p.value) : '',
            fontSize: 10,
            color: '#fff',
            textBorderColor: 'rgba(0,0,0,0.5)',
            textBorderWidth: 2,
            fontWeight: 'bold'
          }
        });
      }
    });

    // Фантомные серии для ИТОГОВЫХ меток
    if (visibleMetrics.income) {
      series.push({
        name: 'Total Income Label',
        type: 'bar',
        stack: 'Income',
        data: sortedYears.map(() => 0),
        label: {
          show: true,
          position: 'right',
          formatter: (p: any) => {
            const year = p.name;
            const total = yearTotals.get(year)?.income || 0;
            return total > 0 ? formatLargeNumber(total) : '';
          },
          color: isDarkMode ? '#4ade80' : '#16a34a',
          fontWeight: 'bold',
          fontSize: 12
        },
        itemStyle: { opacity: 0 },
        tooltip: { show: false },
        emphasis: { disabled: true },
        silent: true
      });
    }

    if (visibleMetrics.expense) {
      series.push({
        name: 'Total Expense Label',
        type: 'bar',
        stack: 'Expense',
        data: sortedYears.map(() => 0),
        label: {
          show: true,
          position: 'right',
          formatter: (p: any) => {
            const year = p.name;
            const total = yearTotals.get(year)?.expense || 0;
            return total > 0 ? formatLargeNumber(total) : '';
          },
          color: isDarkMode ? '#f87171' : '#dc2626',
          fontWeight: 'bold',
          fontSize: 12
        },
        itemStyle: { opacity: 0 },
        tooltip: { show: false },
        emphasis: { disabled: true },
        silent: true
      });
    }

    const textColor = isDarkMode ? '#e2e8f0' : '#333';
    const axisColor = isDarkMode ? '#64748b' : '#999';
    const splitLineColor = isDarkMode ? '#334155' : '#e5e7eb';

    return {
      tooltip: {
        trigger: 'item',
        confine: true,
        backgroundColor: isDarkMode ? 'rgba(30, 41, 59, 0.98)' : 'rgba(255, 255, 255, 0.98)',
        borderColor: isDarkMode ? '#334155' : '#e2e8f0',
        textStyle: { color: isDarkMode ? '#f8fafc' : '#1e293b' },
        padding: 0,
        formatter: getTooltipFormatter(isDarkMode, sortedYears, sortedJKs, dataByYear, textColor, visibleMetrics, groupingMode)
      },
      legend: {
        show: true,
        type: 'scroll',
        bottom: 0,
        textStyle: { color: textColor },
        data: sortedJKs // Легенда управляет видимостью ЖК по имени
      },
      grid: {
        top: 30, // Reduced from 60 since title is moved out
        bottom: 40,
        left: '2%',
        right: '10%',
        containLabel: true
      },
      xAxis: {
        type: 'value',
        axisLabel: {
          color: axisColor,
          formatter: (value: number) => formatLargeNumber(value)
        },
        splitLine: { lineStyle: { color: splitLineColor, type: 'dashed' } }
      },
      yAxis: {
        type: 'category',
        data: sortedYears,
        axisLabel: {
          color: isDarkMode ? '#ffffff' : '#000000',
          fontWeight: 'bold',
          fontSize: 13
        },
        axisLine: { lineStyle: { color: axisColor } }
      },
      series: series
    };
  }, [data, isDarkMode, visibleMetrics, groupingMode]);
};
