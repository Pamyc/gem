
import { MetricConfig } from "./types";

// Интерполяция цвета между двумя HEX значениями
export const interpolateColor = (color1: string, color2: string, factor: number = 0.5) => {
  const result = color1.slice(1).match(/.{2}/g)!.map((hex, i) => {
      return Math.round(parseInt(hex, 16) + factor * (parseInt(color2.slice(1).match(/.{2}/g)![i], 16) - parseInt(hex, 16)));
  });
  
  return `#${result.map(val => val.toString(16).padStart(2, '0')).join('')}`;
};

// Получение семантического цвета (Красный -> Желтый -> Зеленый)
// 0 = Red, 0.5 = Yellow, 1 = Green
export const getSemanticColor = (percentage: number) => {
    const RED = '#ef4444';
    const YELLOW = '#eab308';
    const GREEN = '#22c55e';

    if (percentage < 0.5) {
        // Interpolate Red -> Yellow
        return interpolateColor(RED, YELLOW, percentage * 2);
    } else {
        // Interpolate Yellow -> Green
        return interpolateColor(YELLOW, GREEN, (percentage - 0.5) * 2);
    }
};

// Полное форматирование чисел (без сокращений типа 1М)
export const formatFullNumber = (value: number, prefix: string = '', suffix: string = '') => {
  if (value === undefined || value === null) return '';
  return `${prefix}${value.toLocaleString('ru-RU')}${suffix}`;
};

// Расчет значений и цветов для сравнения
export const calculateComparisonValues = (valA: number, valB: number, metric: MetricConfig) => {
    // For averages, we don't just sum them for percentage in a strictly mathematical sense, 
    // but it works for visual comparison of A vs B.
    const total = valA + valB;
    
    let shareA = 0;
    let shareB = 0;
    let percentA = 0;
    let percentB = 0;

    if (total > 0) {
        shareA = valA / total;
        shareB = valB / total;
        // Рассчитываем проценты для визуализации ширины столбца
        percentA = shareA * 100;
        percentB = shareB * 100;
    } else if (valA === 0 && valB === 0) {
        percentA = 0;
        percentB = 0;
    }

    const colorA = getSemanticColor(shareA);
    const colorB = getSemanticColor(shareB);

    const fullValueA = formatFullNumber(valA, metric.prefix, metric.suffix);
    const fullValueB = formatFullNumber(valB, metric.prefix, metric.suffix);
    const shareAStr = (shareA * 100).toFixed(0) + '%';
    const shareBStr = (shareB * 100).toFixed(0) + '%';

    return {
        valA, valB,
        percentA, percentB,
        colorA, colorB,
        fullValueA, fullValueB,
        shareAStr, shareBStr
    };
};

// Генерация HTML для тултипа
export const generateTooltipHtml = (
  metricLabel: string,
  leftName: string, leftVal: string, leftShare: string, leftColor: string,
  rightName: string, rightVal: string, rightShare: string, rightColor: string
) => {
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
};
