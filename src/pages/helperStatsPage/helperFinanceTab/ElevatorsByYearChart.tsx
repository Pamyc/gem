
import React, { useMemo } from 'react';
import EChartComponent from '../../../components/charts/EChartComponent';
import { useDataStore } from '../../../contexts/DataContext';
import { getMergedHeaders } from '../../../utils/chartUtils';

interface ElevatorsByYearChartProps {
  isDarkMode: boolean;
  selectedCity: string;
}

const COLORS = [
  '#3b82f6', '#f97316', '#8b5cf6', '#10b981', '#ec4899', 
  '#eab308', '#06b6d4', '#6366f1', '#a855f7', '#f43f5e'
];

const ElevatorsByYearChart: React.FC<ElevatorsByYearChartProps> = ({ isDarkMode, selectedCity }) => {
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

    const idxYear = headers.indexOf('Год');
    const idxJK = headers.indexOf('ЖК');
    const idxElevators = headers.indexOf('Кол-во лифтов');
    const idxCity = headers.indexOf('Город');
    
    const idxTotal = headers.indexOf('Итого (Да/Нет)');
    const idxNoBreakdown = headers.indexOf('Без разбивки на литеры (Да/Нет)');

    if (idxYear === -1 || idxJK === -1 || idxElevators === -1) {
      return { years: [], series: [], jks: [] };
    }

    const dataMap = new Map<string, Map<string, number>>();
    const allJKs = new Set<string>();
    const allYears = new Set<string>();

    sheetData.rows.forEach(row => {
      if (idxTotal !== -1 && String(row[idxTotal]).trim().toLowerCase() === 'да') return;
      if (idxNoBreakdown !== -1 && String(row[idxNoBreakdown]).trim().toLowerCase() !== 'да') return;

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

    const sortedYears = Array.from(allYears).sort();
    
    const jkTotals = new Map<string, number>();
    allJKs.forEach(jk => jkTotals.set(jk, 0));
    
    dataMap.forEach(jkMap => {
        jkMap.forEach((val, jk) => {
            jkTotals.set(jk, (jkTotals.get(jk) || 0) + val);
        });
    });
    
    const sortedJKs = Array.from(allJKs).sort((a, b) => (jkTotals.get(b) || 0) - (jkTotals.get(a) || 0));

    const finalSeries = sortedJKs.map((jk, idx) => {
      return {
        name: jk,
        type: 'bar',
        stack: 'total',
        emphasis: { focus: 'series' },
        barMinHeight: 30, 
        barMaxWidth: 60,
        label: {
          show: true,
          position: 'inside', 
          fontSize: 12,
          fontWeight: 'bold',
          color: '#ffffff',
          textBorderColor: 'rgba(0,0,0,0.8)',
          textBorderWidth: 2,
          formatter: (params: any) => params.value > 0 ? params.value : ''
        },
        itemStyle: { 
            color: COLORS[idx % COLORS.length],
            borderRadius: [0, 0, 0, 0], 
            borderColor: isDarkMode ? '#1e293b' : '#fff',
            borderWidth: 1
        },
        data: sortedYears.map(year => {
          const val = dataMap.get(year)?.get(jk) || 0;
          return val === 0 ? null : val; 
        })
      };
    });

    return { years: sortedYears, series: finalSeries, jks: sortedJKs };
  }, [googleSheets, sheetConfigs, selectedCity, isDarkMode]);

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: isDarkMode ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
      borderColor: isDarkMode ? '#334155' : '#e2e8f0',
      textStyle: { color: isDarkMode ? '#f8fafc' : '#1e293b' },
      axisPointer: { type: 'shadow' },
      formatter: (params: any) => {
        if (!Array.isArray(params) || params.length === 0) return '';
        
        let total = 0;
        const rows = params
            .filter((p: any) => p.value !== null && p.value !== undefined)
            .map((p: any) => {
                total += Number(p.value);
                return `
                <div style="display: flex; justify-content: space-between; align-items: center; gap: 15px; font-size: 12px;">
                    <span style="display: flex; align-items: center; gap: 5px;">
                        <span style="width: 8px; height: 8px; border-radius: 2px; background-color: ${p.color};"></span>
                        <span style="color: ${isDarkMode ? '#cbd5e1' : '#64748b'};">${p.seriesName}</span>
                    </span>
                    <span style="font-weight: bold; color: ${isDarkMode ? '#fff' : '#0f172a'};">${p.value}</span>
                </div>
                `;
            }).join('');

        return `
            <div style="font-weight: bold; margin-bottom: 8px; color: ${isDarkMode ? '#fff' : '#0f172a'}; border-bottom: 1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}; padding-bottom: 4px;">
                ${params[0].axisValue} <span style="font-weight: normal; font-size: 12px; color: ${isDarkMode ? '#94a3b8' : '#64748b'}">(Всего: ${total})</span>
            </div>
            <div style="display: flex; flex-direction: column; gap: 4px;">
                ${rows}
            </div>
        `;
      }
    },
    legend: {
      show: true,
      type: 'scroll',
      bottom: 0,
      textStyle: { color: isDarkMode ? '#94a3b8' : '#64748b' },
      pageIconColor: isDarkMode ? '#94a3b8' : '#64748b',
      pageTextStyle: { color: isDarkMode ? '#94a3b8' : '#64748b' }
    },
    grid: { left: '3%', right: '4%', bottom: '15%', top: '5%', containLabel: true },
    xAxis: {
      type: 'value',
      axisLabel: { color: isDarkMode ? '#94a3b8' : '#64748b' },
      splitLine: { lineStyle: { color: isDarkMode ? '#334155' : '#e2e8f0', type: 'dashed' } }
    },
    yAxis: {
      type: 'category',
      data: years,
      axisLabel: { color: isDarkMode ? '#e2e8f0' : '#1e293b', fontWeight: 'bold' },
      axisLine: { lineStyle: { color: isDarkMode ? '#334155' : '#cbd5e1' } }
    },
    series: series
  };

  return (
    <div className="w-full h-[500px]">
      <EChartComponent options={option} theme={isDarkMode ? 'dark' : 'light'} height="100%" />
    </div>
  );
};

export default ElevatorsByYearChart;
