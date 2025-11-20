import { ChartConfig, ChartFilter } from '../types/chart';
import * as echarts from 'echarts';

// Helper to detect simple types
export const detectColumnType = (value: any): 'number' | 'date' | 'string' => {
  if (!value) return 'string';
  const strVal = String(value).trim();

  // Check for number (replace comma with dot just in case of RU locale)
  if (!isNaN(Number(strVal.replace(',', '.'))) && strVal !== '') return 'number';

  // Simple date check (YYYY-MM-DD or DD.MM.YYYY)
  if (strVal.match(/^\d{4}-\d{2}-\d{2}$/) || strVal.match(/^\d{2}\.\d{2}\.\d{4}$/)) return 'date';

  return 'string';
};

export const parseValue = (value: any, type: 'number' | 'date' | 'string') => {
  if (type === 'number') {
    return parseFloat(String(value).replace(',', '.')) || 0;
  }
  return String(value);
};

export const processChartData = (
  rawData: any[][],
  headers: string[],
  config: ChartConfig,
  isDarkMode: boolean
) => {
  if (!rawData || rawData.length === 0) return null;

  // 1. Indices
  const xIdx = headers.indexOf(config.xAxisColumn);
  const yIdx = headers.indexOf(config.yAxisColumn);
  const segIdx = config.segmentColumn ? headers.indexOf(config.segmentColumn) : -1;

  if (xIdx === -1 || yIdx === -1) return null;

  // 2. Filter Data
  let filteredData = rawData.filter(row => {
    // Basic validity check
    if (!row[xIdx]) return false;

    // Apply user filters
    for (const filter of config.filters) {
      const colIdx = headers.indexOf(filter.column);
      if (colIdx === -1) continue;

      const cellValue = String(row[colIdx] || '').toLowerCase();
      const filterValue = filter.value.toLowerCase();
      const cellNum = parseFloat(cellValue);
      const filterNum = parseFloat(filterValue);

      switch (filter.operator) {
        case 'equals': if (cellValue !== filterValue) return false; break;
        case 'contains': if (!cellValue.includes(filterValue)) return false; break;
        case 'greater': if (isNaN(cellNum) || cellNum <= filterNum) return false; break;
        case 'less': if (isNaN(cellNum) || cellNum >= filterNum) return false; break;
      }
    }
    return true;
  });

  // 3. Grouping & Aggregation
  // Structure: Map<SegmentName, Map<XValue, Array<YValues>>>
  const groupedData = new Map<string, Map<string, number[]>>();
  const xValuesSet = new Set<string>();

  filteredData.forEach(row => {
    const xVal = String(row[xIdx]);
    const yVal = parseFloat(String(row[yIdx]).replace(',', '.')) || 0;
    const segVal = segIdx !== -1 ? String(row[segIdx]) : 'Все данные';

    xValuesSet.add(xVal);

    if (!groupedData.has(segVal)) {
      groupedData.set(segVal, new Map());
    }
    const segmentMap = groupedData.get(segVal)!;

    if (!segmentMap.has(xVal)) {
      segmentMap.set(xVal, []);
    }
    segmentMap.get(xVal)!.push(yVal);
  });

  // Sort X Axis (Try to sort as dates/numbers if possible, else string)
  const xValues = Array.from(xValuesSet).sort((a, b) => {
    const dateA = new Date(a).getTime();
    const dateB = new Date(b).getTime();
    if (!isNaN(dateA) && !isNaN(dateB)) return dateA - dateB;
    return a.localeCompare(b);
  });

  // 4. Build Series
  const series: any[] = [];
  const colors = [
    '#6366f1', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6', '#0ea5e9', '#f43f5e'
  ];
  let colorIdx = 0;

  groupedData.forEach((segmentMap, segmentName) => {
    const dataPoints: number[] = [];
    let runningTotal = 0;

    xValues.forEach(x => {
      const values = segmentMap.get(x) || [];
      let aggregatedVal = 0;

      if (values.length > 0) {
        switch (config.aggregation) {
          case 'sum':
            aggregatedVal = values.reduce((a, b) => a + b, 0);
            break;
          case 'count':
            aggregatedVal = values.length;
            break;
          case 'average':
            aggregatedVal = values.reduce((a, b) => a + b, 0) / values.length;
            break;
          case 'max':
            aggregatedVal = Math.max(...values);
            break;
          case 'min':
            aggregatedVal = Math.min(...values);
            break;
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
      type: config.chartType === 'area' ? 'line' : config.chartType,
      smooth: true,
      areaStyle: config.chartType === 'area' ? { opacity: 0.3 } : undefined,
      data: dataPoints,
      itemStyle: { color: colors[colorIdx % colors.length] },
      lineStyle: { width: 3 },
      symbol: config.showLabels ? 'circle' : 'none',
      label: config.chartType === 'bar'
        ? { show: true, position: 'top' }
        : { show: config.showLabels, position: 'top', formatter: (p: any) => p.value.toFixed(1) }
    });
    colorIdx++;
  });

  // 5. ECharts Options
  return {
    backgroundColor: 'transparent',
    title: {
      text: config.title,
      left: 'center',
      textStyle: { color: isDarkMode ? '#e2e8f0' : '#1e293b' }
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: isDarkMode ? 'rgba(21, 25, 35, 0.9)' : 'rgba(255, 255, 255, 0.95)',
      borderColor: isDarkMode ? '#334155' : '#e2e8f0',
      textStyle: { color: isDarkMode ? '#f8fafc' : '#1e293b' }
    },
    legend: {
      bottom: 0,
      textStyle: { color: isDarkMode ? '#94a3b8' : '#64748b' }
    },
    grid: {
      left: '3%', right: '4%', bottom: '10%', containLabel: true
    },
    dataZoom: [
      { type: 'slider', show: true, bottom: 30, height: 20, borderColor: 'transparent' },
      { type: 'inside' }
    ],
    xAxis: {
      type: 'category',
      data: xValues,
      axisLine: { lineStyle: { color: isDarkMode ? '#334155' : '#e2e8f0' } },
      axisLabel: { color: isDarkMode ? '#94a3b8' : '#64748b', rotate: 45 }
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { type: 'dashed', color: isDarkMode ? 'rgba(255,255,255,0.05)' : '#f1f5f9' } },
      axisLabel: { color: isDarkMode ? '#94a3b8' : '#64748b' }
    },
    series: series
  };
};

// Generate component code string
export const generateComponentCode = (config: ChartConfig) => {
  // Clean up stringify to look nice
  const jsonConfig = JSON.stringify(config, null, 2);

  return `<EChartComponent 
  options={{
${jsonConfig.slice(2, -2)} 
  }} 
  height="400px" 
  theme={isDarkMode ? 'dark' : 'light'} 
/>`;
};