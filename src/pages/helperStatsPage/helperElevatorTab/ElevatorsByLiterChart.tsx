
import React, { useMemo } from 'react';
import EChartComponent from '../../../components/charts/EChartComponent';
import { useDataStore } from '../../../contexts/DataContext';
import { getMergedHeaders } from '../../../utils/chartUtils';

interface ElevatorsByLiterChartProps {
  isDarkMode: boolean;
  selectedCity: string;
  selectedYear: string;
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

const ElevatorsByLiterChart: React.FC<ElevatorsByLiterChartProps> = ({ isDarkMode, selectedCity, selectedYear }) => {
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
    const idxLiter = headers.indexOf('Литер');
    const idxElevators = headers.indexOf('Кол-во лифтов');
    const idxCity = headers.indexOf('Город');
    const idxYear = headers.indexOf('Год');
    
    // Фильтры для исключения итогов
    const idxTotal = headers.indexOf('Итого (Да/Нет)');
    const idxNoBreakdown = headers.indexOf('Отдельный литер (Да/Нет)');

    if (idxJK === -1 || idxElevators === -1) return { chartData: [], xLabels: [], uniqueJKs: [] };

    // 1. Сбор сырых данных
    const rawItems = sheetData.rows.map(row => {
      // 1.1 Фильтрация по структуре данных (исключаем общие итоги)
      if (idxTotal !== -1 && String(row[idxTotal]).toLowerCase() === 'Нет') return null;
      if (idxNoBreakdown !== -1 && String(row[idxNoBreakdown]).toLowerCase() === 'Да') return null;

      // 1.2 Фильтрация по селекторам (Город / Год)
      if (selectedCity && idxCity !== -1) {
          const rowCity = String(row[idxCity]).trim();
          if (rowCity !== selectedCity) return null;
      }

      if (selectedYear && selectedYear !== 'Весь период' && idxYear !== -1) {
          const rowYear = String(row[idxYear]).trim();
          if (rowYear !== selectedYear) return null;
      }

      const jk = String(row[idxJK]).trim();
      // Если столбца "Литер" нет или он пуст, берем ЖК, но лучше чтобы был Литер
      const literRaw = idxLiter !== -1 ? String(row[idxLiter]).trim() : ''; 
      // Если литера нет, но строка прошла фильтры, возможно это какой-то специфический кейс,
      // но для графика "по литерам" нам нужен идентификатор. Используем ЖК если пусто.
      const liter = literRaw || jk; 

      const value = parseFloat(String(row[idxElevators]).replace(',', '.')) || 0;

      if (!jk || value === 0) return null;

      return { jk, liter, value };
    }).filter(Boolean) as { jk: string, liter: string, value: number }[];

    // 2. Сортировка: Сначала по ЖК, потом по Литеру (натуральная сортировка для чисел в строках)
    rawItems.sort((a, b) => {
      if (a.jk !== b.jk) return a.jk.localeCompare(b.jk);
      return a.liter.localeCompare(b.liter, undefined, { numeric: true, sensitivity: 'base' });
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
          borderRadius: [3, 3, 0, 0] // Чуть меньше радиус для тонких баров
        }
      };
    });

    // 5. Подписи оси X
    const labels = rawItems.map(i => i.liter);

    return { chartData: finalData, xLabels: labels, uniqueJKs: uniqueJKsList };
  }, [googleSheets, sheetConfigs, selectedCity, selectedYear]);

  const option = {
    backgroundColor: 'transparent',
    title: {
      text: 'Количество лифтов по литерам',
      subtext: 'Группировка цветом по ЖК',
      left: 'left',
      top: 0,
      textStyle: { color: isDarkMode ? '#e2e8f0' : '#1e293b', fontSize: 14, fontWeight: 'bold' },
      subtextStyle: { color: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 11 }
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
      left: '1%',
      right: '1%',
      bottom: '2%', // Минимальный отступ снизу, легенда вынесена
      top: '20%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: xLabels,
      axisLabel: { 
        color: isDarkMode ? '#94a3b8' : '#64748b',
        interval: 0, 
        rotate: 90, // Вертикальные подписи
        fontSize: 9, // Уменьшенный шрифт
        formatter: (value: string) => value.length > 15 ? value.substring(0, 15) + '...' : value
      },
      axisLine: { lineStyle: { color: isDarkMode ? '#334155' : '#cbd5e1' } },
      axisTick: { alignWithLabel: true }
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 10 },
      splitLine: { lineStyle: { color: isDarkMode ? '#334155' : '#e2e8f0', type: 'dashed' } }
    },
    dataZoom: [
      {
        type: 'slider',
        show: false, // Скрываем слайдер
        start: 0,
        end: 100 
      },
      { type: 'inside' } // Оставляем зум
    ],
    series: [
      {
        name: 'Лифты',
        type: 'bar',
        data: chartData,
        barMaxWidth: 20, // Ограничиваем ширину для "сплющенного" вида при малом кол-ве данных
        barGap: '10%',
        label: {
          show: true,
          position: 'top',
          color: isDarkMode ? '#e2e8f0' : '#1e293b',
          fontSize: 9, // Маленький шрифт меток
          fontWeight: 'bold',
          distance: 2
        }
      }
    ]
  };

  return (
    <div className="bg-white dark:bg-[#151923] rounded-3xl border border-gray-200 dark:border-white/10 shadow-sm overflow-hidden p-5 flex flex-col gap-2 w-full">
      {/* Уменьшенная высота для "сплющенного" эффекта */}
      <div className="h-[280px] w-full">
        <EChartComponent
          options={option}
          theme={isDarkMode ? 'dark' : 'light'}
          height="100%"
        />
      </div>

      {/* Компактная легенда внизу */}
      {uniqueJKs.length > 0 && (
        <div className="flex flex-wrap gap-x-4 gap-y-1 justify-center px-2 pb-1 border-t border-gray-100 dark:border-white/5 pt-3">
            {uniqueJKs.map((jk, idx) => (
                <div key={jk} className="flex items-center gap-1.5 text-[10px]">
                    <div 
                        className="w-2.5 h-2.5 rounded-full shadow-sm shrink-0" 
                        style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                    />
                    <span className="text-gray-600 dark:text-gray-400 font-bold whitespace-nowrap">{jk}</span>
                </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default ElevatorsByLiterChart;
