import { useMemo } from 'react';
import { useDataStore } from '../../../contexts/DataContext';
import { getMergedHeaders } from '../../../utils/chartUtils';
import { ComparisonCategory, ComparisonFilterState, ComparisonDataResult } from './types';

export const useComparisonData = (
  category: ComparisonCategory,
  filters: ComparisonFilterState
): ComparisonDataResult => {
  const { googleSheets, sheetConfigs } = useDataStore();

  return useMemo(() => {
    const sheetKey = 'clientGrowth';
    const sheetData = googleSheets[sheetKey];
    
    // Default Empty Return
    const empty: ComparisonDataResult = { 
        availableItems: [], 
        aggregatedData: new Map(), 
        filterOptions: { years: [], regions: [], cities: [], jks: [], clients: [], statuses: [], objectTypes: [] } 
    };

    if (!sheetData || !sheetData.headers || !sheetData.rows) return empty;

    const config = sheetConfigs.find(c => c.key === sheetKey);
    const headerRowsCount = config?.headerRows || 1;
    const headers = getMergedHeaders(sheetData.headers, headerRowsCount);

    // Indices
    const idxMap = {
        region: headers.indexOf('Регион'),
        city: headers.indexOf('Город'),
        jk: headers.indexOf('ЖК'),
        liter: headers.indexOf('Литер'),
        year: headers.indexOf('Год'),
        client: headers.indexOf('Клиент'),
        status: headers.indexOf('Сдан да/нет'),
        objectType: headers.indexOf('Тип объекта'),
        
        elevators: headers.indexOf('Кол-во лифтов'),
        floors: headers.indexOf('Кол-во этажей'),
        
        incomeFact: headers.indexOf('Доходы + Итого + Факт'),
        expenseFact: headers.indexOf('Расходы + Итого + Факт'),
        
        total: headers.indexOf('Итого (Да/Нет)'),
        noBreakdown: headers.indexOf('Без разбивки на литеры (Да/Нет)')
    };

    if (idxMap.city === -1) return empty;

    // Filter Options Collectors
    const optionsSet = {
        years: new Set<string>(),
        regions: new Set<string>(),
        cities: new Set<string>(),
        jks: new Set<string>(),
        clients: new Set<string>(),
        statuses: new Set<string>(),
        objectTypes: new Set<string>()
    };

    const dataMap = new Map<string, Record<string, number>>();

    sheetData.rows.forEach(row => {
        // Technical Filters
        if (idxMap.total !== -1 && String(row[idxMap.total]).toLowerCase() === 'да') return;
        if (idxMap.noBreakdown !== -1 && String(row[idxMap.noBreakdown]).toLowerCase() === 'да') return; 

        // Extract Values
        const getVal = (idx: number) => String(row[idx] || '').trim();
        
        const rowData = {
            region: getVal(idxMap.region),
            city: getVal(idxMap.city),
            jk: getVal(idxMap.jk),
            liter: getVal(idxMap.liter) || getVal(idxMap.jk), // Fallback
            year: getVal(idxMap.year),
            client: getVal(idxMap.client),
            status: getVal(idxMap.status).toLowerCase() === 'да' ? 'Сдан' : 'В работе',
            objectType: getVal(idxMap.objectType)
        };

        // Collect Options
        if (rowData.year) optionsSet.years.add(rowData.year);
        if (rowData.region) optionsSet.regions.add(rowData.region);
        if (rowData.city) optionsSet.cities.add(rowData.city);
        if (rowData.jk) optionsSet.jks.add(rowData.jk);
        if (rowData.client) optionsSet.clients.add(rowData.client);
        optionsSet.statuses.add(rowData.status);
        if (rowData.objectType) optionsSet.objectTypes.add(rowData.objectType);

        // Check Active Filters
        if (filters.years.length > 0 && !filters.years.includes(rowData.year)) return;
        if (filters.regions.length > 0 && !filters.regions.includes(rowData.region)) return;
        if (filters.cities.length > 0 && !filters.cities.includes(rowData.city)) return;
        if (filters.jks.length > 0 && !filters.jks.includes(rowData.jk)) return;
        if (filters.clients.length > 0 && !filters.clients.includes(rowData.client)) return;
        if (filters.statuses.length > 0 && !filters.statuses.includes(rowData.status)) return;
        if (filters.objectTypes.length > 0 && !filters.objectTypes.includes(rowData.objectType)) return;

        // Determine Group Key based on selected Category
        let groupKey = '';
        switch(category) {
            case 'city': groupKey = rowData.city; break;
            case 'jk': groupKey = rowData.jk; break;
            case 'liter': groupKey = rowData.liter; break; 
            case 'client': groupKey = rowData.client; break;
            case 'year': groupKey = rowData.year || 'Не указан'; break;
            case 'status': groupKey = rowData.status; break;
        }

        if (!groupKey) return;

        // Parse Metrics
        const parseNum = (idx: number) => {
            if (idx === -1) return 0;
            return parseFloat(String(row[idx]).replace(/\s/g, '').replace(',', '.')) || 0;
        };

        const metrics = {
            elevators: parseNum(idxMap.elevators),
            floors: parseNum(idxMap.floors),
            incomeFact: parseNum(idxMap.incomeFact),
            expenseFact: parseNum(idxMap.expenseFact),
        };

        if (!dataMap.has(groupKey)) {
            dataMap.set(groupKey, { 
                elevators: 0, floors: 0, 
                incomeFact: 0, expenseFact: 0 
            });
        }
        
        const entry = dataMap.get(groupKey)!;
        entry.elevators += metrics.elevators;
        entry.floors += metrics.floors;
        entry.incomeFact += metrics.incomeFact;
        entry.expenseFact += metrics.expenseFact;
    });

    const items = Array.from(dataMap.keys()).sort();

    return {
        availableItems: items,
        aggregatedData: dataMap,
        filterOptions: {
            years: Array.from(optionsSet.years).sort().reverse(),
            regions: Array.from(optionsSet.regions).sort(),
            cities: Array.from(optionsSet.cities).sort(),
            jks: Array.from(optionsSet.jks).sort(),
            clients: Array.from(optionsSet.clients).sort(),
            statuses: Array.from(optionsSet.statuses).sort(),
            objectTypes: Array.from(optionsSet.objectTypes).sort()
        }
    };

  }, [googleSheets, sheetConfigs, category, filters]);
};