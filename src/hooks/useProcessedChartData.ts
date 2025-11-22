import { useMemo } from 'react';
import { useDataStore } from '../contexts/DataContext';
import { ChartConfig } from '../types/chart';
import { prepareChartData } from '../utils/helperChartUtils/chartDataProcessor';
import { getMergedHeaders } from '../utils/helperChartUtils/headerUtils';

export interface ProcessedDataItem {
  name: string;
  value: number;
}

/**
 * Хук для получения готовых, агрегированных данных из Google Sheets
 * на основе конфигурации графика (ChartConfig).
 * 
 * Использует ту же логику фильтрации и группировки, что и DynamicChart.
 */
export const useProcessedChartData = (config: Partial<ChartConfig>) => {
  const { googleSheets, sheetConfigs, isLoading } = useDataStore();

  const processedData = useMemo((): ProcessedDataItem[] => {
    // 1. Проверки наличия данных
    if (!config.sheetKey || isLoading) return [];

    const sheetData = googleSheets[config.sheetKey as keyof typeof googleSheets];
    if (!sheetData || !sheetData.headers || !sheetData.rows) return [];

    // 2. Подготовка заголовков (мердж уровней)
    const currentSheetConfig = sheetConfigs.find(c => c.key === config.sheetKey);
    const headerRowsCount = currentSheetConfig?.headerRows || 1;
    const availableColumns = getMergedHeaders(sheetData.headers, headerRowsCount);

    // 3. Создаем полноценный конфиг с дефолтными значениями, если передали частичный
    const fullConfig: ChartConfig = {
      title: config.title || '',
      sheetKey: config.sheetKey,
      chartType: config.chartType || 'pie',
      xAxisColumn: config.xAxisColumn || '', // Это будет нашей Категорией (Label)
      yAxisColumn: config.yAxisColumn || config.xAxisColumn || '', // Это поле для значений (или подсчета)
      segmentColumn: config.segmentColumn || '', // Используем если нужна сложная группировка
      aggregation: config.aggregation || 'count',
      isCumulative: config.isCumulative || false,
      showLabels: true,
      showDataZoomSlider: false,
      showLegend: true,
      filters: config.filters || []
    };

    // 4. Используем существующую утилиту prepareChartData для фильтрации и группировки
    // Она вернет Map<Segment, Map<XValue, Values[]>>
    const prepared = prepareChartData(sheetData.rows, availableColumns, fullConfig);
    if (!prepared) return [];

    const { groupedData, xValues } = prepared;
    const result: ProcessedDataItem[] = [];

    // 5. Агрегация данных (Превращаем сырые массивы чисел в одно число)
    
    // ВАРИАНТ А: Если есть segmentColumn, то "Имена" — это сегменты (ключи groupedData)
    if (fullConfig.segmentColumn) {
      groupedData.forEach((segmentMap, segmentName) => {
        let allValues: number[] = [];
        // Собираем все значения из всех X для этого сегмента
        for (const vals of segmentMap.values()) {
          allValues.push(...vals);
        }
        const aggregatedValue = calculateAggregation(allValues, fullConfig.aggregation);
        
        if (isValidValue(aggregatedValue, fullConfig.aggregation)) {
            result.push({ name: segmentName, value: aggregatedValue });
        }
      });
    } 
    // ВАРИАНТ Б (Чаще всего нужен для Pie): Имена — это значения оси X (Категории)
    else {
      xValues.forEach(xLabel => {
        let allValuesForCategory: number[] = [];

        // Пробегаем по всем сегментам (обычно он один - "Все данные") и собираем значения для этого X
        groupedData.forEach(segmentMap => {
           const vals = segmentMap.get(xLabel);
           if (vals) allValuesForCategory.push(...vals);
        });

        const aggregatedValue = calculateAggregation(allValuesForCategory, fullConfig.aggregation);

        if (isValidValue(aggregatedValue, fullConfig.aggregation)) {
            result.push({ name: xLabel, value: aggregatedValue });
        }
      });
    }

    // 6. Сортировка по убыванию значения для красоты
    return result.sort((a, b) => b.value - a.value);

  }, [googleSheets, sheetConfigs, isLoading, config]);

  return { data: processedData, isLoading };
};

// Хелпер для подсчета математики
function calculateAggregation(values: number[], type: string): number {
  if (values.length === 0) return 0;
  
  switch (type) {
    case 'sum': return values.reduce((a, b) => a + b, 0);
    case 'count': return values.length;
    case 'average': return values.reduce((a, b) => a + b, 0) / values.length;
    case 'max': return Math.max(...values);
    case 'min': return Math.min(...values);
    default: return 0;
  }
}

// Хелпер для фильтрации нулевых значений (кроме min, где 0 может быть валидным)
function isValidValue(val: number, aggregation: string): boolean {
    if (aggregation === 'min') return true; 
    return val > 0;
}
