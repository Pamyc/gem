
import { ChartConfig } from '../../types/chart';

const colors = [
  '#6366f1', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6', '#0ea5e9', '#f43f5e', '#84cc16', '#14b8a6'
];

export const getAxisOptions = (
  groupedData: Map<string, Map<string, number[]>>,
  xValues: string[],
  config: ChartConfig,
  isDarkMode: boolean
) => {
  const series: any[] = [];
  let colorIdx = 0;

  groupedData.forEach((segmentMap, segmentName) => {
    const dataPoints: number[] = [];
    let runningTotal = 0;

    xValues.forEach(x => {
      const values = segmentMap.get(x) || [];
      let aggregatedVal = 0;

      if (values.length > 0) {
        switch (config.aggregation) {
          case 'sum': aggregatedVal = values.reduce((a, b) => a + b, 0); break;
          case 'count': aggregatedVal = values.length; break;
          case 'average': aggregatedVal = values.reduce((a, b) => a + b, 0) / values.length; break;
          case 'max': aggregatedVal = Math.max(...values); break;
          case 'min': aggregatedVal = Math.min(...values); break;
        }
      }

      if (config.isCumulative) {
        runningTotal += aggregatedVal;
        dataPoints.push(runningTotal);
      } else {
        dataPoints.push(aggregatedVal);
      }
    });

    series.push({
      name: segmentName,
      type: config.chartType,
      stack: config.chartType === 'area' ? 'total' : undefined,
      areaStyle: config.chartType === 'area' ? {} : undefined,
      data: dataPoints,
      smooth: true,
      showSymbol: config.showLabels, 
      itemStyle: {
        color: colors[colorIdx % colors.length]
      },
      label: {
        show: config.showLabels,
        position: 'top',
        color: isDarkMode ? '#e2e8f0' : '#1e293b',
        fontSize: 11,
        fontWeight: 'bold'
      }
    });
    colorIdx++;
  });

  return {
    backgroundColor: 'transparent',
    title: {
      text: config.title,
      textStyle: { color: isDarkMode ? '#e2e8f0' : '#1e293b' }
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: isDarkMode ? 'rgba(21, 25, 35, 0.9)' : 'rgba(255, 255, 255, 0.95)',
      borderColor: isDarkMode ? '#334155' : '#e2e8f0',
      textStyle: { color: isDarkMode ? '#f8fafc' : '#1e293b' }
    },
    legend: {
      show: config.showLegend !== false,
      data: Array.from(groupedData.keys()),
      bottom: 0,
      textStyle: { color: isDarkMode ? '#94a3b8' : '#64748b' }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: config.showLegend !== false ? '15%' : '3%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: config.chartType === 'bar',
      data: xValues,
      axisLabel: { color: isDarkMode ? '#94a3b8' : '#64748b', interval: 0, rotate: 30 },
      axisLine: { lineStyle: { color: isDarkMode ? '#334155' : '#cbd5e1' } }
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: isDarkMode ? '#94a3b8' : '#64748b' },
      splitLine: { lineStyle: { color: isDarkMode ? '#334155' : '#e2e8f0', type: 'dashed' } }
    },
    dataZoom: config.showDataZoomSlider !== false && ['line', 'bar', 'area'].includes(config.chartType) ? [
      {
        type: 'slider',
        show: true,
        bottom: config.showLegend !== false ? 30 : 10,
        height: 20,
        borderColor: 'transparent',
        backgroundColor: isDarkMode ? '#1e293b' : '#f1f5f9',
        fillerColor: isDarkMode ? 'rgba(99, 102, 241, 0.2)' : 'rgba(99, 102, 241, 0.1)',
        handleStyle: { color: '#6366f1' },
        textStyle: { color: isDarkMode ? '#94a3b8' : '#64748b' }
      },
      {
        type: 'inside'
      }
    ] : [
       { type: 'inside' }
    ],
    series
  };
};
