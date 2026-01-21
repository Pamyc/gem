
import { useState, useMemo } from 'react';
import { useDataStore } from '../contexts/DataContext';
import { getMergedHeaders } from '../utils/chartUtils';

export interface DBComparisonItem {
  name: string;
  liters: number;
  totalElevators: number;
  avgElevators: number;
  totalFloors: number;
  avgFloors: number;
  label: string;
  description: string;
  isOthers?: boolean;
}

// Helper for pluralization
const getPluralLiter = (n: number) => {
  n = Math.abs(n);
  if (n % 10 === 1 && n % 100 !== 11) return 'литер';
  if ([2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100)) return 'литера';
  return 'литеров';
};

export const useComplexComparisonsDB = (city: string, year: string, region: string) => {
  // Используем общий DataStore
  const { googleSheets, sheetConfigs, isLoading, error } = useDataStore();

  const processedData = useMemo(() => {
    // ВАЖНО: Используем новый ключ "database_clientGrowth"
    const sheetKey = 'database_clientGrowth';
    const sheetData = googleSheets[sheetKey];

    if (isLoading || !sheetData || !sheetData.rows || sheetData.rows.length === 0) return [];

    // Получаем заголовки, чтобы знать индексы
    const config = sheetConfigs.find(c => c.key === sheetKey);
    const headerRowsCount = config?.headerRows || 1;
    const headers = getMergedHeaders(sheetData.headers, headerRowsCount);

    // Индексы колонок (теперь такие же, как в Google Sheets, так как мы их сэмулировали)
    const idxJK = headers.indexOf('ЖК');
    const idxCity = headers.indexOf('Город');
    const idxRegion = headers.indexOf('Регион');
    const idxYear = headers.indexOf('Год');
    const idxElevators = headers.indexOf('Кол-во лифтов');
    const idxFloors = headers.indexOf('Кол-во этажей');
    const idxNoBreakdown = headers.indexOf('Без разбивки на литеры (Да/Нет)');
    const idxOneLiter = headers.indexOf('Отдельный литер (Да/Нет)');

    if (idxJK === -1) return [];

    // Группировка данных
    const groups = new Map<string, {
      totalElevators: number;
      totalFloors: number;
      liters: number;
    }>();

    sheetData.rows.forEach(row => {
      
      // 2. Context Filters
      if (region && idxRegion !== -1 && String(row[idxRegion]) !== region) return;
      if (city && idxCity !== -1 && String(row[idxCity]) !== city) return;
      // В БД год приходит числом, в DataContext мы его тоже держим числом, но приводим к строке для сравнения
      if (year && year !== 'Весь период' && idxYear !== -1 && String(row[idxYear]) !== year) return;

      const jkName = String(row[idxJK] || '').trim();
      if (!jkName) return;

      if (!groups.has(jkName)) {
        groups.set(jkName, { totalElevators: 0, totalFloors: 0, liters: 0 });
      }
      const entry = groups.get(jkName)!;

      const isNoBreakdown = idxNoBreakdown !== -1 && String(row[idxNoBreakdown]).trim().toLowerCase() === 'да';
      const isOneLiter = idxOneLiter !== -1 && String(row[idxOneLiter]).trim().toLowerCase() === 'да';

      const elevators = parseFloat(String(row[idxElevators])) || 0;
      const floors = parseFloat(String(row[idxFloors])) || 0;

      // SUM logic: Берем суммы из строк агрегации (Без разбивки)
      if (isNoBreakdown) {
        entry.totalElevators += elevators;
        entry.totalFloors += floors;
      }

      // COUNT logic: Считаем литеры
      // Либо это явная строка литера (Отдельный литер = Да)
      // Либо, если таких колонок нет, считаем строки где НЕТ агрегации (Без разбивки = Нет)
      if (isOneLiter || (!isNoBreakdown)) {
        entry.liters += 1;
      }
    });

    // Transform Map to Array
    const result: DBComparisonItem[] = [];
    groups.forEach((val, name) => {
      // Fallback: If liters is 0 but sums exist, assume 1
      const liters = val.liters === 0 && (val.totalElevators > 0 || val.totalFloors > 0) ? 1 : val.liters;
      
      // Filter out empty garbage
      if (val.totalElevators === 0 && val.totalFloors === 0) return;

      result.push({
        name: name,
        liters: liters,
        totalElevators: val.totalElevators,
        totalFloors: val.totalFloors,
        avgElevators: liters > 0 ? parseFloat((val.totalElevators / liters).toFixed(1)) : 0,
        avgFloors: liters > 0 ? parseFloat((val.totalFloors / liters).toFixed(1)) : 0,
        label: name,
        description: `${liters} ${getPluralLiter(liters)}`
      });
    });

    return result;

  }, [googleSheets, sheetConfigs, isLoading, city, year, region]);

  return { data: processedData, loading: isLoading, error };
};
