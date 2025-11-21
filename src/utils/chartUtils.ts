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

/**
 * Helper to merge multi-level headers into a single array of strings
 */
export const getMergedHeaders = (headers: any[][], headerRowsCount: number): string[] => {
  if (!headers || headers.length === 0) return [];
  
  const rowsToProcess = headers.slice(0, headerRowsCount);
  if (rowsToProcess.length === 0) return [];

  const colCount = rowsToProcess[0].length;
  const mergedHeaders: string[] = [];

  for (let i = 0; i < colCount; i++) {
    const values = rowsToProcess.map(row => row[i]?.toString().trim() || '');
    const nonEmptyValues = values.filter(Boolean);
    const uniqueValues = Array.from(new Set(nonEmptyValues));

    let label = '';
    if (uniqueValues.length === 0) {
       label = `Столбец ${i + 1}`;
    } else {
       label = uniqueValues.join(' + ');
    }
    mergedHeaders.push(label);
  }
  return mergedHeaders;
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

  // Common Palette
  const colors = [
    '#6366f1', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6', '#0ea5e9', '#f43f5e', '#84cc16', '#14b8a6'
  ];

  // --- PIE / DONUT Logic ---
  if (config.chartType === 'pie' || config.chartType === 'donut') {
      const pieData: any[] = [];
      
      if (config.segmentColumn) {
          // CASE A: Grouping enabled (Segment is slice)
          // We aggregate ALL values for each segment, ignoring X-axis distribution
          let colorIdx = 0;
          groupedData.forEach((segmentMap, segmentName) => {
              // Collect all values for this segment from the map
              let allValues: number[] = [];
              for (const vals of segmentMap.values()) {
                  allValues.push(...vals);
              }
              
              let val = 0;
              if (allValues.length > 0) {
                  if (config.aggregation === 'sum') val = allValues.reduce((a,b)=>a+b, 0);
                  else if (config.aggregation === 'count') val = allValues.length;
                  else if (config.aggregation === 'average') val = allValues.reduce((a,b)=>a+b, 0) / allValues.length;
                  else if (config.aggregation === 'max') val = Math.max(...allValues);
                  else if (config.aggregation === 'min') val = Math.min(...allValues);
              }

              if (val > 0 || config.aggregation === 'min') {
                  pieData.push({
                      name: segmentName,
                      value: val,
                      itemStyle: { color: colors[colorIdx % colors.length] }
                  });
              }
              colorIdx++;
          });
      } else {
          // CASE B: No Grouping (X-Axis is slice)
          // We iterate xValues and aggregate
          xValues.forEach((x, idx) => {
             let allValuesForX: number[] = [];
             
             // Collect values for this X from all segments (likely just one 'Все данные')
             groupedData.forEach(segmentMap => {
                 const v = segmentMap.get(x);
                 if (v) allValuesForX.push(...v);
             });

             let val = 0;
             if (allValuesForX.length > 0) {
                 if (config.aggregation === 'sum') val = allValuesForX.reduce((a,b)=>a+b, 0);
                 else if (config.aggregation === 'count') val = allValuesForX.length;
                 else if (config.aggregation === 'average') val = allValuesForX.reduce((a,b)=>a+b, 0) / allValuesForX.length;
                 else if (config.aggregation === 'max') val = Math.max(...allValuesForX);
                 else if (config.aggregation === 'min') val = Math.min(...allValuesForX);
             }
             
             if (val > 0 || (val === 0 && config.aggregation !== 'count' && config.aggregation !== 'sum')) {
                 pieData.push({
                     name: x,
                     value: val,
                     itemStyle: { color: colors[idx % colors.length] }
                 });
             }
          });
      }

      return {
          backgroundColor: 'transparent',
          title: {
            text: config.title,
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
          legend: {
            show: config.showLegend !== false,
            bottom: 0,
            textStyle: { color: isDarkMode ? '#94a3b8' : '#64748b' }
          },
          series: [
              {
                  name: config.title,
                  type: 'pie',
                  radius: config.chartType === 'donut' ? ['40%', '70%'] : '70%',
                  avoidLabelOverlap: true,
                  itemStyle: {
                      borderRadius: 5,
                      borderColor: isDarkMode ? '#1e293b' : '#fff',
                      borderWidth: 2
                  },
                  label: {
                      show: config.showLabels,
                      // Rich Text Formatter
                      formatter: ' {b|{b}：}{c}  {per|{d}%}  ',
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
                              lineHeight: 33
                          },
                          per: {
                              color: '#fff',
                              backgroundColor: isDarkMode ? '#6366f1' : '#4C5058',
                              padding: [3, 4],
                              borderRadius: 4
                          }
                      }
                  },
                  labelLine: {
                      show: config.showLabels,
                      length: 30
                  },
                  emphasis: {
                      label: {
                          show: true,
                          fontSize: 16,
                          fontWeight: 'bold'
                      }
                  },
                  data: pieData
              }
          ]
      };
  }

  // --- LINE / BAR / AREA Logic ---
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
      showSymbol: false,
      itemStyle: {
        color: colors[colorIdx % colors.length]
      },
      label: {
        show: config.showLabels,
        position: 'top'
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
      axisLabel: { color: isDarkMode ? '#94a3b8' : '#64748b' },
      axisLine: { lineStyle: { color: isDarkMode ? '#334155' : '#cbd5e1' } }
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: isDarkMode ? '#94a3b8' : '#64748b' },
      splitLine: { lineStyle: { color: isDarkMode ? '#334155' : '#e2e8f0', type: 'dashed' } }
    },
    // Only show dataZoom slider if enabled and supported (bar/line/area)
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
       // Even if slider is hidden, keep 'inside' zoom for mousewheel if desired, 
       // or remove completely. Here we keep mousewheel zoom active.
       { type: 'inside' }
    ],
    series
  };
};

export const generateComponentCode = (config: ChartConfig) => {
  const configString = JSON.stringify(config, null, 2).replace(/"(\w+)":/g, '$1:');

  return `
import React, { useMemo } from 'react';
import DynamicChart from '../components/charts/DynamicChart'; // Make sure path is correct
import { ChartConfig } from '../types/chart';

const MyChartWidget = () => {
  
  const config: ChartConfig = useMemo(() => (${configString}), []);

  return (
    <DynamicChart 
      config={config} 
      isDarkMode={true} // Or pass from props
      height="300px" 
    />
  );
};

export default MyChartWidget;
  `;
};