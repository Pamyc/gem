
import React, { useMemo } from 'react';
import EChartComponent from '../../../components/charts/EChartComponent';
import { useDataStore } from '../../../contexts/DataContext';
import { getMergedHeaders } from '../../../utils/chartUtils';

interface ComplexComparisonsProps {
  isDarkMode: boolean;
  selectedCity: string;
  selectedYear: string;
  selectedRegion?: string;
}

// Helper for pluralization defined outside to avoid ReferenceError
const getPluralLiter = (n: number) => {
  n = Math.abs(n);
  if (n % 10 === 1 && n % 100 !== 11) return 'литер';
  if ([2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100)) return 'литера';
  return 'литеров';
};

const ComplexComparisons: React.FC<ComplexComparisonsProps> = ({ isDarkMode, selectedCity, selectedYear, selectedRegion }) => {
  const { googleSheets, sheetConfigs } = useDataStore();

  const aggregatedData = useMemo(() => {
    const sheetKey = 'clientGrowth';
    const sheetData = googleSheets[sheetKey];

    if (!sheetData || !sheetData.headers || !sheetData.rows) return [];

    const config = sheetConfigs.find(c => c.key === sheetKey);
    const headerRowsCount = config?.headerRows || 1;
    const headers = getMergedHeaders(sheetData.headers, headerRowsCount);

    // Indices
    const idxJK = headers.indexOf('ЖК');
    const idxCity = headers.indexOf('Город');
    const idxRegion = headers.indexOf('Регион');
    const idxYear = headers.indexOf('Год');
    const idxElevators = headers.indexOf('Кол-во лифтов');
    const idxFloors = headers.indexOf('Кол-во этажей');
    const idxTotal = headers.indexOf('Итого (Да/Нет)');
    const idxNoBreakdown = headers.indexOf('Без разбивки на литеры (Да/Нет)');
    const idxOneLiter = headers.indexOf('Отдельный литер (Да/Нет)');

    if (idxJK === -1) return [];

    const groups = new Map<string, any[]>();

    // 1. Group by JK
    sheetData.rows.forEach(row => {
      // Exclude Grand Total
      if (idxTotal !== -1) {
         const val = String(row[idxTotal]).trim().toLowerCase();
         if (val !== 'нет') return;
      }

      // Filter by Region/City/Year
      if (selectedRegion && idxRegion !== -1 && String(row[idxRegion]) !== selectedRegion) return;
      if (selectedCity && idxCity !== -1 && String(row[idxCity]) !== selectedCity) return;
      if (selectedYear && selectedYear !== 'Весь период' && idxYear !== -1 && String(row[idxYear]) !== selectedYear) return;

      const jkName = String(row[idxJK] || '').trim();
      if (!jkName) return;

      if (!groups.has(jkName)) {
        groups.set(jkName, []);
      }
      groups.get(jkName)?.push(row);
    });

    // 2. Aggregate
    const result: any[] = [];

    groups.forEach((rows, jkName) => {
      // Calculate Liters Count (Using "Отдельный литер" logic)
      let liters = 0;
      if (idxOneLiter !== -1) {
         liters = rows.filter(r => String(r[idxOneLiter]).trim().toLowerCase() === 'да').length;
      } else {
         const detailRows = idxNoBreakdown !== -1
            ? rows.filter(r => String(r[idxNoBreakdown]).trim().toLowerCase() === 'нет')
            : rows;
         liters = detailRows.length;
      }
      // If 0 but data exists, assume 1 complex
      if (liters === 0 && rows.length > 0) liters = 1;

      // Calculate Sums (Using "Без разбивки на литеры" logic for totals)
      const sumRows = idxNoBreakdown !== -1 
        ? rows.filter(r => String(r[idxNoBreakdown]).trim().toLowerCase() === 'да')
        : rows;

      const totalElevators = sumRows.reduce((sum, r) => sum + (parseFloat(String(r[idxElevators]).replace(',', '.')) || 0), 0);
      const totalFloors = sumRows.reduce((sum, r) => sum + (parseFloat(String(r[idxFloors]).replace(',', '.')) || 0), 0);

      // Averages
      const avgElevators = liters > 0 ? parseFloat((totalElevators / liters).toFixed(1)) : 0;
      const avgFloors = liters > 0 ? parseFloat((totalFloors / liters).toFixed(1)) : 0;

      result.push({
        name: jkName,
        liters,
        totalElevators,
        avgElevators,
        totalFloors,
        avgFloors,
        label: `${jkName}\n(${liters} ${getPluralLiter(liters)})`
      });
    });

    // Sort by Total Elevators Descending
    return result.sort((a, b) => b.totalElevators - a.totalElevators);

  }, [googleSheets, sheetConfigs, selectedCity, selectedYear, selectedRegion]);

  const getOption = (metric: 'elevators' | 'floors') => {
    const isElevator = metric === 'elevators';
    const title = isElevator ? 'Количество лифтов по литерам' : 'Количество этажей по литерам';
    const totalKey = isElevator ? 'totalElevators' : 'totalFloors';
    const avgKey = isElevator ? 'avgElevators' : 'avgFloors';
    const legend1 = isElevator ? 'Кол-во лифтов' : 'Кол-во этажей';
    const legend2 = isElevator ? 'Кол-во лифтов на 1 литер' : 'Кол-во этажей на 1 литер';

    // Reverse for ECharts Y-axis (to show top items at top)
    const chartData = [...aggregatedData].reverse();
    const categories = chartData.map(d => d.label);
    const seriesTotal = chartData.map(d => d[totalKey]);
    const seriesAvg = chartData.map(d => d[avgKey]);

    return {
      backgroundColor: 'transparent',
      title: {
        text: title,
        left: 'left',
        top: 0,
        textStyle: { 
            color: isDarkMode ? '#e2e8f0' : '#1e293b', 
            fontSize: 20, 
            fontWeight: 'bold' 
        }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        backgroundColor: isDarkMode ? 'rgba(21, 25, 35, 0.9)' : 'rgba(255, 255, 255, 0.95)',
        borderColor: isDarkMode ? '#334155' : '#e2e8f0',
        textStyle: { color: isDarkMode ? '#f8fafc' : '#1e293b' }
      },
      legend: {
        data: [legend1, legend2],
        top: 35,
        left: 0,
        textStyle: { color: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 12 }
      },
      grid: {
        left: '1%',
        right: '10%',
        bottom: '3%',
        top: '20%',
        containLabel: true
      },
      xAxis: {
        type: 'value',
        splitLine: { lineStyle: { color: isDarkMode ? '#334155' : '#e2e8f0', type: 'dashed' } },
        axisLabel: { color: isDarkMode ? '#94a3b8' : '#64748b' }
      },
      yAxis: {
        type: 'category',
        data: categories,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { 
            color: isDarkMode ? '#e2e8f0' : '#1e293b',
            fontWeight: 'bold',
            fontSize: 12,
            lineHeight: 16,
            interval: 0
        }
      },
      series: [
        {
          name: legend1,
          type: 'bar',
          data: seriesTotal,
          itemStyle: { color: '#3b82f6', borderRadius: [0, 4, 4, 0] },
          label: {
            show: true,
            position: 'right',
            color: isDarkMode ? '#e2e8f0' : '#1e293b',
            fontWeight: 'bold',
            formatter: (p: any) => p.value > 0 ? p.value : ''
          },
          barGap: '20%'
        },
        {
          name: legend2,
          type: 'bar',
          data: seriesAvg,
          itemStyle: { color: '#f43f5e', borderRadius: [0, 4, 4, 0] },
          label: {
            show: true,
            position: 'right',
            color: isDarkMode ? '#e2e8f0' : '#1e293b',
            fontWeight: 'bold',
            formatter: (p: any) => p.value > 0 ? p.value : ''
          }
        }
      ]
    };
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
      {/* Chart 1: Elevators */}
      <div className="bg-white dark:bg-[#151923] rounded-3xl p-6 shadow-sm border border-gray-200 dark:border-white/5 h-[500px]">
         <EChartComponent 
            options={getOption('elevators')} 
            theme={isDarkMode ? 'dark' : 'light'} 
            height="100%" 
         />
      </div>

      {/* Chart 2: Floors */}
      <div className="bg-white dark:bg-[#151923] rounded-3xl p-6 shadow-sm border border-gray-200 dark:border-white/5 h-[500px]">
         <EChartComponent 
            options={getOption('floors')} 
            theme={isDarkMode ? 'dark' : 'light'} 
            height="100%" 
         />
      </div>
    </div>
  );
};

export default ComplexComparisons;
