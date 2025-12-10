
import { useMemo } from 'react';
import { METRICS } from './constants';
import { formatFullNumber, calculateComparisonValues, generateTooltipHtml } from './utils';

interface UseComparisonChartOptionsProps {
  aggregatedData: Map<string, Record<string, number>>;
  itemA: string;
  itemB: string;
  isDarkMode: boolean;
  visibleMetrics: string[];
}

export const useComparisonChartOptions = ({
  aggregatedData,
  itemA,
  itemB,
  isDarkMode,
  visibleMetrics
}: UseComparisonChartOptionsProps) => {
  return useMemo(() => {
    const dataA = aggregatedData.get(itemA) || {};
    const dataB = aggregatedData.get(itemB) || {};

    const labelColor = isDarkMode ? '#e2e8f0' : '#1e293b';

    const seriesA: any[] = [];
    const seriesB: any[] = [];
    const axisData: string[] = [];

    // Filter metrics based on visibility
    const activeMetrics = METRICS.filter(m => visibleMetrics.includes(m.key));

    activeMetrics.forEach(m => {
        const rawValA = dataA[m.key] || 0;
        const rawValB = dataB[m.key] || 0;
        
        const { 
            percentA, percentB, 
            colorA, colorB, 
            fullValueA, fullValueB, 
            shareAStr, shareBStr 
        } = calculateComparisonValues(rawValA, rawValB, m);

        // Данные для левой серии (Объект А)
        seriesA.push({
            value: percentA, // Визуально - процент от общей суммы строки
            realValue: rawValA, // Реальное значение для лейбла
            itemStyle: { 
                color: colorA, 
                borderRadius: [4, 0, 0, 4] 
            },
            // Собственные данные для тултипа
            metricName: m.label,
            fullValue: fullValueA,
            share: shareAStr,
            // Данные "соседа" для тултипа
            peerName: itemB,
            peerFullValue: fullValueB,
            peerShare: shareBStr,
            peerColor: colorB,
            
            label: {
                show: true,
                position: 'insideRight',
                offset: [-5, 0],
                color: rawValA === 0 ? labelColor : '#fff',
                fontWeight: 'bold',
                fontSize: 12,
                // Используем realValue, чтобы показать "284", а не "74.8"
                formatter: (p: any) => formatFullNumber(p.data.realValue, m.prefix, m.suffix)
            }
        });

        // Данные для правой серии (Объект Б)
        seriesB.push({
            value: percentB, // Визуально - процент
            realValue: rawValB, // Реальное значение
            itemStyle: { 
                color: colorB, 
                borderRadius: [0, 4, 4, 0] 
            },
            // Собственные данные
            metricName: m.label,
            fullValue: fullValueB,
            share: shareBStr,
            // Данные "соседа" для тултипа
            peerName: itemA,
            peerFullValue: fullValueA,
            peerShare: shareAStr,
            peerColor: colorA,

            label: {
                show: true,
                position: 'insideLeft',
                offset: [5, 0],
                color: rawValB === 0 ? labelColor : '#fff',
                fontWeight: 'bold',
                fontSize: 12,
                // Используем realValue
                formatter: (p: any) => formatFullNumber(p.data.realValue, m.prefix, m.suffix)
            }
        });

        axisData.push(m.label);
    });

    // Константы отступов
    const GRID_TOP = 40;
    const GRID_BOTTOM = 20;

    return {
        backgroundColor: 'transparent',
        tooltip: {
            trigger: 'item', 
            axisPointer: { type: 'shadow' },
            backgroundColor: isDarkMode ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
            borderColor: isDarkMode ? '#334155' : '#e2e8f0',
            textStyle: { color: isDarkMode ? '#f8fafc' : '#1e293b' },
            formatter: (params: any) => {
                const data = params.data;
                const metricLabel = data.metricName;
                
                const isSeriesA = params.seriesIndex === 0;
                
                // My Data (Hovered)
                const myName = params.seriesName;
                const myVal = data.fullValue;
                const myShare = data.share;
                const myColor = params.color;

                // Peer Data (Embedded in series data)
                const peerName = data.peerName;
                const peerVal = data.peerFullValue;
                const peerShare = data.peerShare;
                const peerColor = data.peerColor;

                // Determine Left/Right for display consistency (Always A vs B)
                let leftName, leftVal, leftShare, leftColor;
                let rightName, rightVal, rightShare, rightColor;

                if (isSeriesA) {
                    // Hovering A (Left)
                    leftName = myName; leftVal = myVal; leftShare = myShare; leftColor = myColor;
                    rightName = peerName; rightVal = peerVal; rightShare = peerShare; rightColor = peerColor;
                } else {
                    // Hovering B (Right)
                    leftName = peerName; leftVal = peerVal; leftShare = peerShare; leftColor = peerColor;
                    rightName = myName; rightVal = myVal; rightShare = myShare; rightColor = myColor;
                }

                return generateTooltipHtml(
                    metricLabel,
                    leftName, leftVal, leftShare, leftColor,
                    rightName, rightVal, rightShare, rightColor
                );
            }
        },
        legend: {
            show: false, // Скрываем легенду по запросу
            data: [itemA, itemB],
            top: 0,
            textStyle: { color: isDarkMode ? '#e2e8f0' : '#1e293b', fontWeight: 'bold' }
        },
        grid: [
            { left: '2%', width: '38%', containLabel: false, top: GRID_TOP, bottom: GRID_BOTTOM },
            { right: '2%', width: '38%', containLabel: false, top: GRID_TOP, bottom: GRID_BOTTOM }
        ],
        xAxis: [
            {
                type: 'value',
                inverse: true, // Left side goes Right -> Left
                axisLabel: { show: false },
                axisLine: { show: false },
                splitLine: { show: false },
                max: 100, // Нормализуем масштаб до 100% для каждой строки
                gridIndex: 0
            },
            {
                type: 'value',
                inverse: false, // Right side goes Left -> Right
                axisLabel: { show: false },
                axisLine: { show: false },
                splitLine: { show: false },
                max: 100, // Нормализуем масштаб до 100% для каждой строки
                gridIndex: 1
            }
        ],
        yAxis: [
            {
                type: 'category',
                inverse: true, // IMPORTANT: Matches HTML order (Top -> Bottom)
                data: axisData,
                position: 'right',
                axisLabel: { show: false }, 
                axisLine: { show: false },
                axisTick: { show: false },
                gridIndex: 0
            },
            {
                type: 'category',
                inverse: true, // IMPORTANT: Matches HTML order (Top -> Bottom)
                data: axisData,
                position: 'left',
                axisLabel: { show: false },
                axisLine: { show: false },
                axisTick: { show: false },
                gridIndex: 1
            }
        ],
        series: [
            {
                name: itemA,
                type: 'bar',
                data: seriesA,
                xAxisIndex: 0,
                yAxisIndex: 0,
                barWidth: 20,
                showBackground: true,
                backgroundStyle: { color: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }
            },
            {
                name: itemB,
                type: 'bar',
                data: seriesB,
                xAxisIndex: 1,
                yAxisIndex: 1,
                barWidth: 20,
                showBackground: true,
                backgroundStyle: { color: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }
            }
        ]
    };
  }, [aggregatedData, itemA, itemB, isDarkMode, visibleMetrics]);
};
