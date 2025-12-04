
import React, { useMemo } from 'react';
import EChartComponent from '../../components/charts/EChartComponent';
import { useDataStore } from '../../contexts/DataContext';
import { getMergedHeaders } from '../../utils/chartUtils';
import { Loader2 } from 'lucide-react';

interface TimelineFinanceChartProps {
  isDarkMode: boolean;
}

const TimelineFinanceChart: React.FC<TimelineFinanceChartProps> = ({ isDarkMode }) => {
  const { googleSheets, sheetConfigs, isLoading } = useDataStore();

  const option = useMemo(() => {
    const sheetKey = 'clientGrowth';
    const sheetData = googleSheets[sheetKey];

    if (!sheetData || !sheetData.headers || !sheetData.rows) {
      return null;
    }

    const config = sheetConfigs.find(c => c.key === sheetKey);
    const headerRowsCount = config?.headerRows || 1;
    const headers = getMergedHeaders(sheetData.headers, headerRowsCount);

    // 1. Индексы колонок
    const idxJK = headers.indexOf('ЖК');
    
    // Метрики
    const idxIncomePlan = headers.indexOf('Доходы + Итого + План');
    const idxIncomeFact = headers.indexOf('Доходы + Итого + Факт');
    const idxExpenseFact = headers.indexOf('Расходы + Итого + Факт');

    // Фильтры
    const idxTotal = headers.indexOf('Итого (Да/Нет)');
    const idxNoBreakdown = headers.indexOf('Без разбивки на литеры (Да/Нет)');

    if (idxJK === -1 || idxIncomeFact === -1) {
      return null;
    }

    // 2. Сбор и агрегация данных (ЗА ВЕСЬ ПЕРИОД)
    const dataByJK = new Map<string, { plan: number; fact: number; expense: number }>();
    const totals = { plan: 0, fact: 0, expense: 0 };
    
    sheetData.rows.forEach(row => {
      // Применяем фильтры
      if (idxTotal !== -1 && String(row[idxTotal]).trim().toLowerCase() === 'да') return;
      if (idxNoBreakdown !== -1 && String(row[idxNoBreakdown]).trim().toLowerCase() !== 'да') return;

      const jk = String(row[idxJK]).trim();
      if (!jk) return;

      // Парсинг значений
      const parseVal = (idx: number) => {
        if (idx === -1) return 0;
        const val = String(row[idx]).replace(/\s/g, '').replace(',', '.');
        return parseFloat(val) || 0;
      };

      const valPlan = parseVal(idxIncomePlan);
      const valFact = parseVal(idxIncomeFact);
      const valExpense = parseVal(idxExpenseFact);

      // Пропускаем пустые строки, если все по нулям
      if (valPlan === 0 && valFact === 0 && valExpense === 0) return;

      // Данные по ЖК
      if (!dataByJK.has(jk)) {
        dataByJK.set(jk, { plan: 0, fact: 0, expense: 0 });
      }
      const current = dataByJK.get(jk)!;
      current.plan += valPlan;
      current.fact += valFact;
      current.expense += valExpense;

      // Общие суммы
      totals.plan += valPlan;
      totals.fact += valFact;
      totals.expense += valExpense;
    });

    // 3. Сортировка и подготовка серий
    const sortedJKs = Array.from(dataByJK.keys()).sort(); // Алфавитно

    const seriesPlan: number[] = [];
    const seriesFact: number[] = [];
    const seriesExpense: number[] = [];

    sortedJKs.forEach(jk => {
        const values = dataByJK.get(jk)!;
        seriesPlan.push(values.plan);
        seriesFact.push(values.fact);
        seriesExpense.push(values.expense);
    });

    // 4. Формирование опций ECharts
    const textColor = isDarkMode ? '#e2e8f0' : '#333';
    const axisColor = isDarkMode ? '#64748b' : '#999';
    const splitLineColor = isDarkMode ? '#334155' : '#e5e7eb';

    return {
      title: {
        subtext: 'Финансовые показатели (Суммарно за весь период)',
        textStyle: { color: textColor },
        subtextStyle: { color: axisColor },
        top: 10,
        left: 'center'
      },
      tooltip: {
        trigger: 'axis', // Включаем общий тултип для оси (ЖК)
        axisPointer: { type: 'shadow' },
        backgroundColor: isDarkMode ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        borderColor: isDarkMode ? '#334155' : '#e2e8f0',
        textStyle: { color: isDarkMode ? '#f8fafc' : '#1e293b' },
        formatter: (params: any) => {
            // Если это массив (trigger: axis для Bar chart)
            if (Array.isArray(params)) {
                const title = params[0].axisValue;
                const rows = params.map((p: any) => {
                    // Пропускаем, если значение пустое (хотя у нас нули, но на всякий)
                    if (p.value === undefined || isNaN(p.value)) return '';
                    
                    const val = p.value.toLocaleString('ru-RU');
                    const marker = p.marker;
                    return `
                        <div style="display: flex; justify-content: space-between; align-items: center; gap: 20px; margin-top: 4px;">
                            <span style="display: flex; align-items: center; gap: 6px; font-size: 12px; color: ${isDarkMode ? '#cbd5e1' : '#64748b'}">
                                ${marker} ${p.seriesName}
                            </span>
                            <span style="font-weight: bold; font-size: 13px; font-family: monospace;">${val} ₽</span>
                        </div>
                    `;
                }).join('');
                
                return `
                    <div style="font-weight: bold; margin-bottom: 8px; font-size: 14px; border-bottom: 1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}; padding-bottom: 4px;">
                        ${title}
                    </div>
                    ${rows}
                `;
            }
            return '';
        }
      },
      legend: {
        bottom: 0,
        left: 'center',
        data: ['План (Доходы)', 'Факт (Доходы)', 'Факт (Расходы)'],
        textStyle: { color: textColor }
      },
      grid: {
        top: 80,
        bottom: 40,
        left: '5%',
        right: '5%', 
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: sortedJKs,
        axisLabel: { 
            interval: 0, 
            color: axisColor,
            rotate: 45,
            fontSize: 10,
            formatter: (val: string) => val.length > 12 ? val.substring(0, 10) + '...' : val
        },
        axisLine: { lineStyle: { color: axisColor } }
      },
      yAxis: {
        type: 'value',
        name: 'Сумма',
        axisLabel: { 
            color: axisColor,
            formatter: (value: number) => (value / 1000000).toFixed(1) + 'M'
        },
        nameTextStyle: { color: axisColor },
        splitLine: { lineStyle: { color: splitLineColor, type: 'dashed' } }
      },
      series: [
        // Bar Series 1
        { 
            name: 'План (Доходы)', 
            type: 'bar',
            data: seriesPlan,
            itemStyle: { color: '#818cf8', borderRadius: [3, 3, 0, 0] } // Indigo
        },
        // Bar Series 2
        { 
            name: 'Факт (Доходы)', 
            type: 'bar',
            data: seriesFact,
            itemStyle: { color: '#34d399', borderRadius: [3, 3, 0, 0] } // Emerald
        },
        // Bar Series 3
        { 
            name: 'Факт (Расходы)', 
            type: 'bar',
            data: seriesExpense,
            itemStyle: { color: '#f87171', borderRadius: [3, 3, 0, 0] } // Red
        },
        // Pie Series 4
        {
            name: 'Итого',
            type: 'pie',
            center: ['75%', '25%'], // Справа, чуть выше центра
            radius: '28%',
            z: 100,
            // Переопределяем tooltip только для Pie, чтобы показывать item tooltip
            tooltip: {
                trigger: 'item',
                formatter: (params: any) => {
                   const val = params.value ? params.value.toLocaleString('ru-RU') : 0;
                   return `
                     <div style="font-weight:bold; margin-bottom:5px;">${params.seriesName}</div>
                     <div style="display: flex; justify-content: space-between; gap: 15px; font-size: 12px;">
                        <span style="color: ${params.color}">● ${params.name}</span>
                        <span style="font-weight: bold;">${val} ₽ (${params.percent}%)</span>
                     </div>
                   `;
                }
            },
            data: [
                { name: 'План (Доходы)', value: totals.plan, itemStyle: { color: '#6366f1' } },
                { name: 'Факт (Доходы)', value: totals.fact, itemStyle: { color: '#10b981' } },
                { name: 'Факт (Расходы)', value: totals.expense, itemStyle: { color: '#ef4444' } }
            ],
            label: { 
                color: textColor, 
                position: 'outside',
                formatter: '{b}\n{d}%' 
            },
            labelLine: { show: true },
            itemStyle: {
                borderColor: isDarkMode ? '#1e293b' : '#fff',
                borderWidth: 2
            }
        }
      ]
    };

  }, [googleSheets, sheetConfigs, isDarkMode]);

  if (isLoading) {
    return (
        <div className="flex items-center justify-center h-[500px]">
            <Loader2 className="animate-spin text-indigo-500" size={32} />
        </div>
    );
  }

  if (!option) {
      return (
          <div className="flex items-center justify-center h-[500px] text-gray-400">
              Данные не найдены или структура таблицы не соответствует ожидаемой
          </div>
      );
  }

  return (
    <div className="w-full h-[600px]">
      <EChartComponent
        options={option}
        theme={isDarkMode ? 'dark' : 'light'}
        height="100%"
      />
    </div>
  );
};

export default TimelineFinanceChart;
