
import React, { useMemo } from 'react';
import EChartComponent from '../../../components/charts/EChartComponent';
import { useDataStore } from '../../../contexts/DataContext';
import { getMergedHeaders } from '../../../utils/chartUtils';

interface ElevatorsByCustomerChartProps {
  isDarkMode: boolean;
  selectedCity: string;
}

const ElevatorsByCustomerChart: React.FC<ElevatorsByCustomerChartProps> = ({ isDarkMode, selectedCity }) => {
  const { googleSheets, sheetConfigs } = useDataStore();

  const chartOption = useMemo(() => {
    const sheetKey = 'clientGrowth';
    const sheetData = googleSheets[sheetKey];

    if (!sheetData || !sheetData.headers || !sheetData.rows) {
      return null;
    }

    const config = sheetConfigs.find(c => c.key === sheetKey);
    const headerRowsCount = config?.headerRows || 1;
    const headers = getMergedHeaders(sheetData.headers, headerRowsCount);

    // Indices
    const idxClient = headers.indexOf('Клиент');
    const idxStatus = headers.indexOf('Сдан да/нет');
    const idxElevators = headers.indexOf('Кол-во лифтов');
    const idxCity = headers.indexOf('Город');
    
    // Filters (Technical)
    const idxTotal = headers.indexOf('Итого (Да/Нет)');
    const idxNoBreakdown = headers.indexOf('Без разбивки на литеры (Да/Нет)');

    if (idxClient === -1 || idxStatus === -1 || idxElevators === -1) {
      return null;
    }

    // Data Aggregation
    const clientMap = new Map<string, { yes: number; no: number; total: number }>();

    sheetData.rows.forEach(row => {
      // Technical Filters
      if (idxTotal !== -1 && String(row[idxTotal]).trim().toLowerCase() === 'да') return;
      if (idxNoBreakdown !== -1 && String(row[idxNoBreakdown]).trim().toLowerCase() !== 'да') return;

      // Context Filter
      const rowCity = idxCity !== -1 ? String(row[idxCity]).trim() : '';
      if (selectedCity && rowCity !== selectedCity) return;

      const client = String(row[idxClient]).trim();
      if (!client) return;

      const statusVal = String(row[idxStatus]).trim().toLowerCase();
      const isYes = statusVal === 'да';
      
      const val = parseFloat(String(row[idxElevators]).replace(',', '.')) || 0;
      if (val === 0) return;

      if (!clientMap.has(client)) {
        clientMap.set(client, { yes: 0, no: 0, total: 0 });
      }
      
      const entry = clientMap.get(client)!;
      if (isYes) entry.yes += val;
      else entry.no += val;
      entry.total += val;
    });

    // Sort clients by total volume desc
    const sortedClients = Array.from(clientMap.entries())
      .sort((a, b) => b[1].total - a[1].total)
      .slice(0, 10); // Top 10 clients

    const xLabels = sortedClients.map(e => e[0]);
    const seriesYes = sortedClients.map(e => e[1].yes);
    const seriesNo = sortedClients.map(e => e[1].no);

    // Label configuration matching the design request
    const labelOption = {
      show: true,
      position: 'insideBottom',
      distance: 10,
      align: 'left',
      verticalAlign: 'middle',
      rotate: 90,
      formatter: '{c}  {name|{a}}', // Value + Series Name
      fontSize: 13,
      fontWeight: 'bold',
      color: '#fff',
      rich: {
        name: {
           color: 'rgba(255,255,255,0.8)',
           fontSize: 11,
           fontWeight: 'normal',
           padding: [0, 0, 0, 5] // Add spacing between value and name
        }
      }
    };

    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        backgroundColor: isDarkMode ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        borderColor: isDarkMode ? '#334155' : '#e2e8f0',
        textStyle: { color: isDarkMode ? '#f8fafc' : '#1e293b' }
      },
      legend: {
        bottom: 0,
        textStyle: { color: isDarkMode ? '#94a3b8' : '#64748b' },
        data: ['В работе', 'Сданы']
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '12%',
        top: '5%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: xLabels,
        axisTick: { show: false },
        axisLabel: { 
            color: isDarkMode ? '#94a3b8' : '#64748b', 
            interval: 0, 
            rotate: 0,
            fontSize: 11,
            formatter: (val: string) => val.length > 12 ? val.substring(0, 10) + '...' : val
        },
        axisLine: { lineStyle: { color: isDarkMode ? '#334155' : '#cbd5e1' } }
      },
      yAxis: {
        type: 'value',
        axisLabel: { color: isDarkMode ? '#94a3b8' : '#64748b' },
        splitLine: { lineStyle: { color: isDarkMode ? '#334155' : '#e2e8f0', type: 'dashed' } }
      },
      dataZoom: [
        {
          type: 'inside', // Allow zooming if many clients
          start: 0,
          end: 100
        }
      ],
      series: [
        {
          name: 'В работе',
          type: 'bar',
          barGap: 0, // Bars touch each other
          data: seriesNo,
          itemStyle: { 
            color: '#5375c7', // Blue matching screenshot
            borderRadius: [4, 4, 0, 0] 
          },
          label: labelOption,
          emphasis: {
            focus: 'series'
          }
        },
        {
          name: 'Сданы',
          type: 'bar',
          data: seriesYes,
          itemStyle: { 
            color: '#aebd38', // Lime/Green matching screenshot
            borderRadius: [4, 4, 0, 0]
          },
          label: labelOption,
          emphasis: {
            focus: 'series'
          }
        }
      ]
    };
  }, [googleSheets, sheetConfigs, selectedCity, isDarkMode]);

  if (!chartOption) return <div className="flex items-center justify-center h-full text-gray-400 text-xs">Нет данных</div>;

  return (
    <EChartComponent
      options={chartOption}
      theme={isDarkMode ? 'dark' : 'light'}
      height="100%"
    />
  );
};

export default ElevatorsByCustomerChart;
