import React, { useMemo, useState } from 'react';
import EChartComponent from '../../../components/charts/EChartComponent';
import { useDataStore } from '../../../contexts/DataContext';
import { getMergedHeaders } from '../../../utils/chartUtils';
import { formatLargeNumber } from '../../../utils/formatUtils';
import { Loader2, CheckCircle2, Clock, Layers } from 'lucide-react';

interface TimelineFinanceChartProps {
  isDarkMode: boolean;
  selectedCity: string;
  selectedYear: string;
}

type StatusFilterType = 'all' | 'yes' | 'no';

const TimelineFinanceChart: React.FC<TimelineFinanceChartProps> = ({ isDarkMode, selectedCity, selectedYear }) => {
  const { googleSheets, sheetConfigs, isLoading } = useDataStore();
  const [statusFilter, setStatusFilter] = useState<StatusFilterType>('all');

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
    const idxCity = headers.indexOf('Город');
    const idxYear = headers.indexOf('Год');
    const idxStatus = headers.indexOf('Сдан да/нет');
    
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

    // 2. Сбор и агрегация данных
    const dataByJK = new Map<string, { plan: number; fact: number; expense: number }>();
    const totals = { plan: 0, fact: 0, expense: 0 };
    
    sheetData.rows.forEach(row => {
      // Применяем технические фильтры
      if (idxTotal !== -1 && String(row[idxTotal]).trim().toLowerCase() === 'да') return;
      if (idxNoBreakdown !== -1 && String(row[idxNoBreakdown]).trim().toLowerCase() !== 'да') return;

      // Применяем пользовательские фильтры (Город / Год)
      const rowCity = idxCity !== -1 ? String(row[idxCity]).trim() : '';
      if (selectedCity && rowCity !== selectedCity) return;

      const rowYear = idxYear !== -1 ? String(row[idxYear]).trim() : '';
      if (selectedYear && selectedYear !== 'Весь период' && rowYear !== selectedYear) return;

      // Применяем фильтр статуса
      if (idxStatus !== -1) {
        const statusVal = String(row[idxStatus]).trim().toLowerCase();
        const isYes = statusVal === 'да';
        
        if (statusFilter === 'yes' && !isYes) return;
        // Если фильтр "В работе", исключаем те, что "да"
        if (statusFilter === 'no' && isYes) return;
      }

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
      // Title removed from here to be rendered in React
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
                    // Пропускаем, если значение пустое
                    if (p.value === undefined || isNaN(p.value)) return '';
                    
                    // Полное форматирование числа
                    const val = p.value.toLocaleString('ru-RU') + ' ₽';
                    const marker = p.marker;
                    return `
                        <div style="display: flex; justify-content: space-between; align-items: center; gap: 20px; margin-top: 4px;">
                            <span style="display: flex; align-items: center; gap: 6px; font-size: 12px; color: ${isDarkMode ? '#cbd5e1' : '#64748b'}">
                                ${marker} ${p.seriesName}
                            </span>
                            <span style="font-weight: bold; font-size: 13px; font-family: monospace;">${val}</span>
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
        top: 40, // Reduced top since title is gone
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
            // Делаем шрифт белым (ярким) в темной теме и черным в светлой
            color: isDarkMode ? '#ffffff' : '#000000', 
            fontWeight: 'bold', // Жирный шрифт
            rotate: 45,
            fontSize: 11, // Немного увеличиваем для читаемости
            formatter: (val: string) => val.length > 12 ? val.substring(0, 10) + '...' : val
        },
        axisLine: { lineStyle: { color: axisColor } }
      },
      yAxis: {
        type: 'value',
        name: 'Сумма',
        axisLabel: { 
            color: axisColor,
            formatter: (value: number) => formatLargeNumber(value) // Ось оставляем сокращенной
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
            itemStyle: { color: '#818cf8', borderRadius: [3, 3, 0, 0] }, // Indigo
            label: {
                show: true,
                position: 'top',
                formatter: (p: any) => formatLargeNumber(p.value), // Лейблы сокращенные
                color: isDarkMode ? '#e2e8f0' : '#1e293b',
                fontSize: 10,
                fontWeight: 'bold'
            }
        },
        // Bar Series 2
        { 
            name: 'Факт (Доходы)', 
            type: 'bar',
            data: seriesFact,
            itemStyle: { color: '#34d399', borderRadius: [3, 3, 0, 0] }, // Emerald
            label: {
                show: true,
                position: 'top',
                formatter: (p: any) => formatLargeNumber(p.value), // Лейблы сокращенные
                color: isDarkMode ? '#e2e8f0' : '#1e293b',
                fontSize: 10,
                fontWeight: 'bold'
            }
        },
        // Bar Series 3
        { 
            name: 'Факт (Расходы)', 
            type: 'bar',
            data: seriesExpense,
            itemStyle: { color: '#f87171', borderRadius: [3, 3, 0, 0] }, // Red
            label: {
                show: true,
                position: 'top',
                formatter: (p: any) => formatLargeNumber(p.value), // Лейблы сокращенные
                color: isDarkMode ? '#e2e8f0' : '#1e293b',
                fontSize: 10,
                fontWeight: 'bold'
            }
        },
        // Pie Series 4
        {
            name: 'Итого',
            type: 'pie',
            center: ['75%', '20%'], // Чуть выше
            radius: '28%',
            z: 100,
            tooltip: {
                trigger: 'item',
                formatter: (params: any) => {
                   // Полное форматирование числа
                   const val = params.value ? params.value.toLocaleString('ru-RU') + ' ₽' : '0 ₽';
                   return `
                     <div style="font-weight:bold; margin-bottom:5px;">${params.seriesName}</div>
                     <div style="display: flex; justify-content: space-between; gap: 15px; font-size: 12px;">
                        <span style="color: ${params.color}">● ${params.name}</span>
                        <span style="font-weight: bold;">${val} (${params.percent}%)</span>
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

  }, [googleSheets, sheetConfigs, isDarkMode, selectedCity, selectedYear, statusFilter]);

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
    <div className="w-full h-[600px] relative flex flex-col">
      {/* HTML Header with Title and Controls (Now visible always, moved to left) */}
      <div className="flex flex-wrap items-center justify-between px-4 pt-4 pb-2 shrink-0">
          
          <div className="flex items-center gap-6">
             <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">
                Финансовые показатели (План/Факт/Расходы)
             </h3>

             {/* Controls */}
             <div className="flex bg-gray-100 dark:bg-white/5 rounded-lg p-1 gap-1 border border-gray-200 dark:border-white/10 transition-opacity">
                <button 
                    onClick={() => setStatusFilter('all')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                    statusFilter === 'all' 
                        ? 'bg-white dark:bg-[#1e2433] text-gray-800 dark:text-white shadow-sm' 
                        : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                    }`}
                >
                    <Layers size={14} />
                    Все
                </button>
                <button 
                    onClick={() => setStatusFilter('yes')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                    statusFilter === 'yes' 
                        ? 'bg-white dark:bg-[#1e2433] text-emerald-500 shadow-sm' 
                        : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                    }`}
                >
                    <CheckCircle2 size={14} />
                    Сданы
                </button>
                <button 
                    onClick={() => setStatusFilter('no')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                    statusFilter === 'no' 
                        ? 'bg-white dark:bg-[#1e2433] text-orange-500 shadow-sm' 
                        : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                    }`}
                >
                    <Clock size={14} />
                    В работе
                </button>
            </div>
          </div>
          
      </div>

      <div className="flex-1 w-full min-h-0">
        <EChartComponent
            options={option}
            theme={isDarkMode ? 'dark' : 'light'}
            height="100%"
        />
      </div>
    </div>
  );
};

export default TimelineFinanceChart;