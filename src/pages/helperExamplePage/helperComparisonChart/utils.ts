
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
