
import { useMemo } from 'react';
import { useDataStore } from '../../../../contexts/DataContext';
import { getMergedHeaders } from '../../../../utils/chartUtils';
import { ProcessedFinanceData } from './types';

export const useFinanceData = (
  selectedCity: string,
  statusFilter: 'all' | 'yes' | 'no',
  groupingMode: 'jk' | 'client',
  selectedYear: string // New Argument
): ProcessedFinanceData | null => {
  const { googleSheets, sheetConfigs } = useDataStore();

  return useMemo(() => {
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
    const idxClient = headers.indexOf('Клиент'); // Добавляем индекс клиента
    const idxCity = headers.indexOf('Город');
    const idxYear = headers.indexOf('Год');
    const idxStatus = headers.indexOf('Сдан да/нет'); // Для фильтрации статуса
    
    // Метрики
    const idxIncomeFact = headers.indexOf('Доходы + Итого + Факт');
    const idxExpenseFact = headers.indexOf('Расходы + Итого + Факт');

    // Фильтры
    const idxTotal = headers.indexOf('Итого (Да/Нет)');
    const idxNoBreakdown = headers.indexOf('Без разбивки на литеры (Да/Нет)');

    // Проверяем наличие обязательных колонок (ЖК или Клиент в зависимости от режима)
    const groupColIndex = groupingMode === 'jk' ? idxJK : idxClient;

    if (groupColIndex === -1 || idxIncomeFact === -1 || idxYear === -1) {
      return null;
    }

    // 2. Сбор и агрегация данных
    const dataByYear = new Map<string, Map<string, { income: number, expense: number }>>();
    const allGroups = new Set<string>(); // Groups = JKs or Clients
    const distinctYearsSet = new Set<string>(); // Все года, доступные после фильтрации по городу/статусу (для дропдауна)
    const chartYearsSet = new Set<string>(); // Года, которые попадут в график (с учетом фильтра по году)
    
    const groupTotals = new Map<string, number>();
    const yearTotals = new Map<string, { income: number, expense: number }>();

    sheetData.rows.forEach(row => {
      // Применяем технические фильтры
      if (idxTotal !== -1 && String(row[idxTotal]).trim().toLowerCase() === 'да') return;
      if (idxNoBreakdown !== -1 && String(row[idxNoBreakdown]).trim().toLowerCase() !== 'да') return;

      // Применяем фильтр по Городу
      const rowCity = idxCity !== -1 ? String(row[idxCity]).trim() : '';
      if (selectedCity && rowCity !== selectedCity) return;

      // Применяем фильтр по Статусу
      if (idxStatus !== -1) {
        const statusVal = String(row[idxStatus]).trim().toLowerCase();
        const isYes = statusVal === 'да';
        
        if (statusFilter === 'yes' && !isYes) return;
        if (statusFilter === 'no' && isYes) return;
      }

      // Извлекаем год и обрабатываем пустые значения
      let year = String(row[idxYear]).trim();
      if (!year) year = 'Год не указан';

      // Собираем доступные годы ДО фильтрации по году
      distinctYearsSet.add(year);

      // Применяем фильтр по Году (если выбран)
      if (selectedYear && year !== selectedYear) return;

      const groupName = String(row[groupColIndex]).trim();
      if (!groupName) return;

      // Парсинг значений
      const parseVal = (idx: number) => {
        if (idx === -1) return 0;
        const val = String(row[idx]).replace(/\s/g, '').replace(',', '.');
        return parseFloat(val) || 0;
      };

      const valIncome = parseVal(idxIncomeFact);
      const valExpense = parseVal(idxExpenseFact);

      if (valIncome === 0 && valExpense === 0) return;

      allGroups.add(groupName);
      chartYearsSet.add(year);

      // Агрегация по годам
      if (!dataByYear.has(year)) {
        dataByYear.set(year, new Map());
      }
      const yearMap = dataByYear.get(year)!;

      if (!yearMap.has(groupName)) {
        yearMap.set(groupName, { income: 0, expense: 0 });
      }
      const current = yearMap.get(groupName)!;
      current.income += valIncome;
      current.expense += valExpense;

      // Агрегация для сортировки легенды
      groupTotals.set(groupName, (groupTotals.get(groupName) || 0) + valIncome + valExpense);

      // Агрегация итогов по годам (для меток)
      if (!yearTotals.has(year)) {
        yearTotals.set(year, { income: 0, expense: 0 });
      }
      const yTotal = yearTotals.get(year)!;
      yTotal.income += valIncome;
      yTotal.expense += valExpense;
    });

    // 3. Подготовка осей
    const sortedYears = Array.from(chartYearsSet).sort();
    const sortedGroups = Array.from(allGroups).sort((a, b) => (groupTotals.get(b) || 0) - (groupTotals.get(a) || 0));
    
    // Список для дропдауна (сортируем, 'Год не указан' в конец)
    const availableYears = Array.from(distinctYearsSet).sort((a, b) => {
        if (a === 'Год не указан') return 1;
        if (b === 'Год не указан') return -1;
        return a.localeCompare(b);
    });

    return {
      sortedYears,
      sortedJKs: sortedGroups,
      dataByYear,
      yearTotals,
      availableYears
    };
  }, [googleSheets, sheetConfigs, selectedCity, statusFilter, groupingMode, selectedYear]);
};
