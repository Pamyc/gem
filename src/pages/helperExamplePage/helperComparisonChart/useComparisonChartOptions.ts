
import { useMemo } from 'react';
import { METRICS } from './constants';
import { getSemanticColor, formatFullNumber } from './utils';

interface UseComparisonChartOptionsProps {
  aggregatedData: Map<string, Record<string, number>>;
  itemA: string;
  itemB: string;
  isDarkMode: boolean;
}

export const useComparisonChartOptions = ({
  aggregatedData,
  itemA,
  itemB,
  isDarkMode
}: UseComparisonChartOptionsProps) => {
  return useMemo(() => {
    const dataA = aggregatedData.get(itemA) || {};
    const dataB = aggregatedData.get(itemB) || {};

    const textColor = isDarkMode ? '#e2e8f0' : '#1e293b';
    const labelColor = isDarkMode ? '#e2e8f0' : '#1e293b';

    const seriesA: any[] = [];
    const seriesB: any[] = [];
    const axisData: string[] = [];

    METRICS.forEach(m => {
        const valA = dataA[m.key] || 0;
        const valB = dataB[m.key] || 0;
        const total = valA + valB;
        
        let shareA = 0;
        let shareB = 0;
        let percentA = 0;
        let percentB = 0;

        if (total > 0) {
            shareA = valA / total;
            shareB = valB / total;
            // Рассчитываем проценты для визуализации ширины столбца (независимо от масштаба числа)
            percentA = shareA * 100;
            percentB = shareB * 100;
        }

        const colorA = getSemanticColor(shareA);
        const colorB = getSemanticColor(shareB);

        // Используем полное форматирование для текстов
        const fullValueA = formatFullNumber(valA, m.prefix, m.suffix);
        const fullValueB = formatFullNumber(valB, m.prefix, m.suffix);
        const shareAStr = (shareA * 100).toFixed(0) + '%';
        const shareBStr = (shareB * 100).toFixed(0) + '%';

        // Данные для левой серии (Объект А)
        seriesA.push({
            value: percentA, // Визуально - процент от общей суммы строки
            realValue: valA, // Реальное значение для лейбла
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
                color: valA === 0 ? labelColor : '#fff',
                fontWeight: 'bold',
                fontSize: 12,
                // Используем realValue, чтобы показать "284", а не "74.8"
                formatter: (p: any) => formatFullNumber(p.data.realValue, m.prefix, m.suffix)
            }
        });

        // Данные для правой серии (Объект Б)
        seriesB.push({
            value: percentB, // Визуально - процент
            realValue: valB, // Реальное значение
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
                color: valB === 0 ? labelColor : '#fff',
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
    const GRID_BOTTOM = 30;

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

                let res = `<div style="font-weight:bold; margin-bottom:8px; border-bottom:1px solid rgba(128,128,128,0.2); padding-bottom:5px; text-align:center;">${metricLabel}</div>`;
                res += `<div style="display:grid; grid-template-columns: 1fr auto 1fr; gap: 15px; align-items:center;">`;
                
                // Left (A)
                res += `<div style="text-align:right;">
                    <div style="font-size:10px; color:#aaa; margin-bottom:2px;">${leftName}</div>
                    <div style="font-weight:bold; font-size:14px; color:${leftColor}">${leftVal}</div>
                    <div style="font-size:10px; color:${leftColor}">${leftShare}</div>
                </div>`;
                
                // Center
                res += `<div style="font-size:10px; color:#666; font-weight:bold;">VS</div>`;
                
                // Right (B)
                res += `<div style="text-align:left;">
                    <div style="font-size:10px; color:#aaa; margin-bottom:2px;">${rightName}</div>
                    <div style="font-weight:bold; font-size:14px; color:${rightColor}">${rightVal}</div>
                    <div style="font-size:10px; color:${rightColor}">${rightShare}</div>
                </div>`;
                
                res += `</div>`;
                return res;
            }
        },
        legend: {
            show: false, // Скрываем легенду по запросу
            data: [itemA, itemB],
            top: 0,
            textStyle: { color: textColor, fontWeight: 'bold' }
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
  }, [aggregatedData, itemA, itemB, isDarkMode]);
};
