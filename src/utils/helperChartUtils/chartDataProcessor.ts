
import { ChartConfig } from '../../types/chart';

export const prepareChartData = (
  rawData: any[][],
  headers: string[],
  config: ChartConfig
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

  // Sort X Axis
  const xValues = Array.from(xValuesSet).sort((a, b) => {
    const dateA = new Date(a).getTime();
    const dateB = new Date(b).getTime();
    if (!isNaN(dateA) && !isNaN(dateB)) return dateA - dateB;
    return a.localeCompare(b);
  });

  return { groupedData, xValues };
};
