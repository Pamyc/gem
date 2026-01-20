
import React, { useMemo } from 'react';
import EChartComponent from '../../../components/charts/EChartComponent';
import { useDataStore } from '../../../contexts/DataContext';
import { getMergedHeaders } from '../../../utils/chartUtils';

interface ElevatorsByYearChartProps {
  isDarkMode: boolean;
  selectedCity: string;
  selectedRegion?: string;
}

const COLORS = [
  '#3b82f6', '#f97316', '#8b5cf6', '#10b981', '#ec4899', 
  '#eab308', '#06b6d4', '#6366f1', '#a855f7', '#f43f5e'
];

const ElevatorsByYearChart: React.FC<ElevatorsByYearChartProps> = ({ isDarkMode, selectedCity, selectedRegion }) => {
  const { googleSheets, sheetConfigs } = useDataStore();

  const { years, series, jks } = useMemo(() => {
    const sheetKey = 'clientGrowth';
    const sheetData = googleSheets[sheetKey];

    if (!sheetData || !sheetData.headers || !sheetData.rows) {
      return { years: [], series: [], jks: [] };
    }

    const config = sheetConfigs.find(c => c.key === sheetKey);
    const headerRowsCount = config?.headerRows || 1;
    const headers = getMergedHeaders(sheetData.headers, headerRowsCount);

    // Indices
    const idxYear = headers.indexOf('Год');
    const idxJK = headers.indexOf('ЖК');
    const idxElevators = headers.indexOf('Кол-во лифтов');
    const idxCity = headers.indexOf('Город');
    const idxRegion = headers.indexOf('Регион');
    
    // Filters
    const idxTotal = headers.indexOf('Итого (Да/Нет)');
    const idxNoBreakdown = headers.indexOf('Без разбивки на литеры (Да/Нет)');

    if (idxYear === -1 || idxJK === -1 || idxElevators === -1) {
      return { years: [], series: [], jks: [] };
    }

    // Data Structure: Map<Year, Map<JK, Value>>
    const dataMap = new Map<string, Map<string, number>>();
    const allJKs = new Set<string>();
    const allYears = new Set<string>();

    sheetData.rows.forEach(row => {
      // 1. Base Filters
      if (idxTotal !== -1 && String(row[idxTotal]).trim().toLowerCase() === 'да') return;
      if (idxNoBreakdown !== -1 && String(row[idxNoBreakdown]).trim().toLowerCase() !== 'да') return;

      // 2. Context Filter (City / Region)
      const rowRegion = idxRegion !== -1 ? String(row[idxRegion]).trim() : '';
      if (selectedRegion && rowRegion !== selectedRegion) return;

      const rowCity = idxCity !== -1 ? String(row[idxCity]).trim() : '';
      if (selectedCity && rowCity !== selectedCity) return;

      const year = String(row[idxYear]).trim();
      const jk = String(row[idxJK]).trim();
      const val = parseFloat(String(row[idxElevators]).replace(',', '.')) || 0;

      if (!year || !jk || val === 0) return;

      allJKs.add(jk);
      allYears.add(year);

      if (!dataMap.has(year)) {
        dataMap.set(year, new Map());
      }
      const yearMap = dataMap.get(year)!;
      yearMap.set(jk, (yearMap.get(jk) || 0) + val);
    });

    // Sort Years and JKs
    const sortedYears = Array.from(allYears).sort(); // Chronological
    
    // Sort JKs by total volume for better visual stacking
    const jkTotals = new Map<string, number>();
    allJKs.forEach(jk => jkTotals.set(jk, 0));
    
    dataMap.forEach(jkMap => {
        jkMap.forEach((val, jk) => {
            jkTotals.set(jk, (jkTotals.get(jk) || 0) + val);
        });
    });
    
    const sortedJKs = Array.from(allJKs).sort((a, b) => (jkTotals.get(b) || 0) - (jkTotals.get(a) || 0));

    // Build Series
    const finalSeries = sortedJKs.map((jk, idx) => {
      return {
        name: jk,
        type: 'bar',
        stack: 'total',
        emphasis: { focus: 'series' },
        // barMinHeight для горизонтальных баров задает минимальную ширину сегмента
        barMinHeight: 30, 
        // barMaxWidth ограничивает толщину полосы
        barMaxWidth: 60,
        label: {
          show: true,
          position: 'inside', 
          fontSize: 12,
          color: '#fff',
          fontWeight: 'bold',
          formatter: (p: any) => p.value > 0 ? p.value : ''
        },
        itemStyle: {
            color: COLORS[idx % COLORS.length],
            borderRadius: [0, 0, 0, 0]
        },
        data: sortedYears.map(year => {
            const val = dataMap.get(year)?.get(jk) || 0;
            return val === 0 ? null : val;
        })
      };
    });

    return { years: sortedYears, series: finalSeries, jks: sortedJKs };
  }, [googleSheets, sheetConfigs, selectedCity, selectedRegion]);

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      appendToBody: true, // Всплывающая подсказка поверх всего
      axisPointer: { type: 'shadow' }, // 'shadow' as default; can also be 'line' or 'cross'
      backgroundColor: isDarkMode ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
      borderColor: isDarkMode ? '#334155' : '#e2e8f0',
      textStyle: { color: isDarkMode ? '#f8fafc' : '#1e293b' },
      formatter: (params: any) => {
          if (Array.isArray(params)) {
              let res = `<div style="font-weight:bold; margin-bottom:5px;">${params[0].axisValue}</div>`;
              let total = 0;
              params.forEach((p: any) => {
                  if (p.value) {
                      res += `<div style="display:flex; justify-content:space-between; width:180px; font-size:12px;">
                        <span>${p.marker} ${p.seriesName}</span>
                        <span style="font-weight:bold;">${p.value}</span>
                      </div>`;
                      total += p.value;
                  }
              });
              res += `<div style="margin-top:5px; border-top:1px solid #ccc; padding-top:5px; font-weight:bold; text-align:right;">Итого: ${total}</div>`;
              return res;
          }
          return '';
      }
    },
    legend: {
      show: true,
      type: 'scroll',
      bottom: 0,
      textStyle: { color: isDarkMode ? '#94a3b8' : '#64748b' }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      top: '5%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      axisLabel: { color: isDarkMode ? '#94a3b8' : '#64748b' },
      splitLine: { lineStyle: { color: isDarkMode ? '#334155' : '#e2e8f0', type: 'dashed' } }
    },
    yAxis: {
      type: 'category',
      data: years,
      axisLabel: { 
          color: isDarkMode ? '#e2e8f0' : '#1e293b', 
          fontWeight: 'bold', 
          fontSize: 13 
      },
      axisLine: { lineStyle: { color: isDarkMode ? '#334155' : '#cbd5e1' } }
    },
    series: series
  };

  if (!series.length) {
      return (
          <div className="flex items-center justify-center h-full text-gray-400">
              Нет данных для отображения
          </div>
      );
  }

  return (
    <EChartComponent
      options={option}
      theme={isDarkMode ? 'dark' : 'light'}
      height="100%"
    />
  );
};

export default ElevatorsByYearChart;
