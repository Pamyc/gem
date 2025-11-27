
import React, { useMemo } from 'react';
import EChartComponent from '../../components/charts/EChartComponent';
import { useDataStore } from '../../contexts/DataContext';
import { getMergedHeaders } from '../../utils/chartUtils';

interface ElevatorsByLiterChartProps {
  isDarkMode: boolean;
}

const COLORS = [
  '#3b82f6', // Blue
  '#ef4444', // Red
  '#f59e0b', // Amber
  '#10b981', // Emerald
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#6366f1', // Indigo
  '#84cc16', // Lime
];

const ElevatorsByLiterChart: React.FC<ElevatorsByLiterChartProps> = ({ isDarkMode }) => {
  const { googleSheets, sheetConfigs } = useDataStore();

  const { chartData, xLabels, uniqueJKs } = useMemo(() => {
    const sheetKey = 'clientGrowth';
    const sheetData = googleSheets[sheetKey];
    
    if (!sheetData || !sheetData.headers || !sheetData.rows) {
      return { chartData: [], xLabels: [], uniqueJKs: [] };
    }

    const config = sheetConfigs.find(c => c.key === sheetKey);
    const headerRows = config?.headerRows || 1;
    const headers = getMergedHeaders(sheetData.headers, headerRows);

    // Индексы столбцов
    const idxJK = headers.indexOf('ЖК');
    const idxLiter = headers.indexOf('Литер'); // Предполагаем название столбца "Литер" или ищем похожий
    const idxElevators = headers.indexOf('Кол-во лифтов');
    
    // Фильтры для исключения итогов
    const idxTotal = headers.indexOf('Итого (Да/Нет)');
    const idxNoBreakdown = headers.indexOf('Без разбивки на литеры (Да/Нет)');

    if (idxJK === -1 || idxElevators === -1) return { chartData: [], xLabels: [], uniqueJKs: [] };

    // 1. Сбор сырых данных
    const rawItems = sheetData.rows.map(row => {
      // Проверка фильтров (исключаем общие строки)
      if (idxTotal !== -1 && String(row[idxTotal]).toLowerCase() === 'да') return null;
      if (idxNoBreakdown !== -1 && String(row[idxNoBreakdown]).toLowerCase() === 'да') return null;

      const jk = String(row[idxJK]).trim();
      // Если столбца "Литер" нет, пробуем сконструировать имя или берем из ЖК
      const liter = idxLiter !== -1 ? String(row[idxLiter]).trim() : ''; 
      const value = parseFloat(String(row[idxElevators]).replace(',', '.')) || 0;

      if (!jk || value === 0) return null;

      return { jk, liter: liter || jk, value };
    }).filter(Boolean) as { jk: string, liter: string, value: number }[];

    // 2. Сортировка: Сначала по ЖК, потом по Литеру
    rawItems.sort((a, b) => {
      if (a.jk !== b.jk) return a.jk.localeCompare(b.jk);
      return a.liter.localeCompare(b.liter, undefined, { numeric: true });
    });

    // 3. Подготовка цветов для ЖК
    const uniqueJKsList = Array.from(new Set(rawItems.map(i => i.jk)));

    // 4. Формирование данных для ECharts
    const finalData = rawItems.map(item => {
      const colorIndex = uniqueJKsList.indexOf(item.jk) % COLORS.length;
      return {
        value: item.value,
        name: item.liter, // Подпись оси X
        jkName: item.jk, // Для тултипа
        itemStyle: {
          color: COLORS[colorIndex],
          borderRadius: [4, 4, 0, 0]
        }
      };
    });

    // 5. Подписи оси X (добавляем название ЖК для наглядности если литеров много)
    const labels = rawItems.map(i => {
        // Если имя литера короткое (цифра), добавляем контекст в тултип, а здесь оставляем цифру
        return i.liter; 
    });

    return { chartData: finalData, xLabels: labels, uniqueJKs: uniqueJKsList };
  }, [googleSheets, sheetConfigs]);

  const option = {
    backgroundColor: 'transparent',
    title: {
      text: 'Количество лифтов по литерам (Группировка по ЖК)',
      left: 'left',
      textStyle: { color: isDarkMode ? '#e2e8f0' : '#1e293b', fontSize: 16 }
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: isDarkMode ? 'rgba(21, 25, 35, 0.9)' : 'rgba(255, 255, 255, 0.95)',
      borderColor: isDarkMode ? '#334155' : '#e2e8f0',
      textStyle: { color: isDarkMode ? '#f8fafc' : '#1e293b' },
      axisPointer: { type: 'shadow' },
      formatter: (params: any) => {
        const item = params[0];
        const data = item.data;
        return `
          <div style="font-weight:bold; margin-bottom:4px;">${data.jkName}</div>
          <div style="font-size:12px; color: ${isDarkMode ? '#cbd5e1' : '#64748b'}">Литер: ${item.name}</div>
          <div style="margin-top:4px;">Лифтов: <b>${item.value}</b></div>
        `;
      }
    },
    grid: {
      left: '2%',
      right: '2%',
      bottom: '5%', // Уменьшил отступ снизу, так как слайдера нет
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: xLabels,
      axisLabel: { 
        color: isDarkMode ? '#94a3b8' : '#64748b',
        interval: 0, 
        rotate: 90, // Вертикальные подписи, так как литеров много
        fontSize: 10,
        formatter: (value: string) => value.length > 15 ? value.substring(0, 15) + '...' : value
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
        type: 'slider',
        show: false, // Скрываем слайдер
        start: 0,
        end: 100 
      },
      { type: 'inside' } // Оставляем зум колесиком/тачем
    ],
    series: [
      {
        name: 'Лифты',
        type: 'bar',
        data: chartData,
        barMaxWidth: 40,
        label: {
          show: true,
          position: 'top',
          color: isDarkMode ? '#e2e8f0' : '#1e293b',
          fontSize: 10,
          fontWeight: 'bold'
        }
      }
    ]
  };

  return (
    <div className="flex flex-col gap-4 w-full h-full min-h-[400px]">
      <div className="flex-1 min-h-[400px]">
        <EChartComponent
          options={option}
          theme={isDarkMode ? 'dark' : 'light'}
          height="100%"
        />
      </div>

      {/* Кастомная легенда внизу */}
      {uniqueJKs.length > 0 && (
        <div className="flex flex-wrap gap-x-6 gap-y-2 justify-center px-4 pb-2 border-t border-gray-100 dark:border-white/5 pt-4">
            {uniqueJKs.map((jk, idx) => (
                <div key={jk} className="flex items-center gap-2 text-xs">
                    <div 
                        className="w-3 h-3 rounded-full shadow-sm shrink-0" 
                        style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                    />
                    <span className="text-gray-600 dark:text-gray-400 font-bold">{jk}</span>
                </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default ElevatorsByLiterChart;
