import { useMemo } from 'react';
import { useDataStore } from '../../../contexts/DataContext';
import { getMergedHeaders } from '../../../utils/chartUtils';
import { ComparisonCategory, ComparisonFilterState, ComparisonDataResult, TreeOption } from './types';
import { METRICS } from './constants';

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
        treeOptions: [], 
        aggregatedData: new Map(), 
        filterOptions: { years: [], regions: [], cities: [], jks: [], clients: [], statuses: [], objectTypes: [] } 
    };

    if (!sheetData || !sheetData.headers || !sheetData.rows) return empty;

    const config = sheetConfigs.find(c => c.key === sheetKey);
    const headerRowsCount = config?.headerRows || 1;
    // Get headers and TRIM them to ensure exact matching
    const headers = getMergedHeaders(sheetData.headers, headerRowsCount).map(h => h.trim());

    // Indices for Filtering & Grouping
    const idxMap = {
        region: headers.indexOf('Регион'),
        city: headers.indexOf('Город'),
        jk: headers.indexOf('ЖК'),
        liter: headers.indexOf('Литер'),
        year: headers.indexOf('Год'),
        client: headers.indexOf('Клиент'),
        status: headers.indexOf('Сдан да/нет'),
        objectType: headers.indexOf('Тип объекта'),
        
        total: headers.indexOf('Итого (Да/Нет)'),
        noBreakdown: headers.indexOf('Без разбивки на литеры (Да/Нет)')
    };

    // Indices for Metrics (Dynamically map from constants)
    const metricIndices: Record<string, number> = {};
    // Map internal key to exact CSV header name (derived from user prompt)
    const headerMapping: Record<string, string> = {
        'elevators': 'Кол-во лифтов',
        'floors': 'Кол-во этажей',
        'incomePlan': 'Доходы + Итого + План',
        'incomeFact': 'Доходы + Итого + Факт',
        'expenseFact': 'Расходы + Итого + Факт',
        'profit': 'Валовая',
        'profitAvg': 'Валовая', // Same source, different agg
        'rentability': 'Рентабельность',
        'profitPerLift': 'Прибыль с 1 лифта',
        'incomeLO': 'Доходы + Лифтовое оборудование + Факт',
        'expenseLO': 'Расходы + Лифтовое оборудование + Факт',
        'incomeObr': 'Доходы + Обрамление + Факт',
        'expenseObr': 'Расходы + Обрамление + Факт',
        'incomeMont': 'Доходы + Монтаж ЛО + Факт',
        'expenseMont': 'Расходы + Монтаж ЛО + Факт'
    };

    METRICS.forEach(m => {
        const headerName = headerMapping[m.key];
        metricIndices[m.key] = headers.indexOf(headerName);
    });

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

    // Data Map: Key -> { count: number, ...metrics }
    const dataMap = new Map<string, Record<string, number>>();
    
    // Helper to build tree
    const treeRoot: TreeOption[] = [];
    const findOrAddNode = (nodes: TreeOption[], label: string): TreeOption => {
        let node = nodes.find(n => n.label === label);
        if (!node) {
            node = { label, children: [] };
            nodes.push(node);
        }
        return node;
    };

    // Determine Total Key based on category
    let totalKey = '';
    if (category === 'year') {
        totalKey = 'Весь период';
    } else if (['region', 'city', 'jk', 'liter'].includes(category)) {
        totalKey = 'Все объекты';
    }

    sheetData.rows.forEach(row => {
        // --- STRICT FILTERS ---
        
        // 1. Итого (Да/Нет) -> Должно быть "Нет" (Исключаем "Да")
        if (idxMap.total !== -1) {
            const valTotal = String(row[idxMap.total] || '').trim().toLowerCase();
            if (valTotal === 'да') return; 
        }

        // 2. Без разбивки на литеры (Да/Нет)
        if (idxMap.noBreakdown !== -1) {
            const valNoBreakdown = String(row[idxMap.noBreakdown] || '').trim().toLowerCase();
            
            if (category === 'liter') {
                // Если сравниваем литеры, нужны строки ГДЕ ЕСТЬ разбивка (значение "Нет" или пусто)
                if (valNoBreakdown === 'да') return;
            } else {
                // Для всего остального нужны агрегаты ("Да")
                if (valNoBreakdown !== 'да') return;
            }
        }

        // Extract Values
        const getVal = (idx: number) => String(row[idx] || '').trim();
        
        const rowData = {
            region: getVal(idxMap.region),
            city: getVal(idxMap.city),
            jk: getVal(idxMap.jk),
            liter: getVal(idxMap.liter) || getVal(idxMap.jk), // Fallback
            year: getVal(idxMap.year),
            client: getVal(idxMap.client),
            status: getVal(idxMap.status).toLowerCase() === 'да' ? 'Сданы' : 'В работе',
            objectType: getVal(idxMap.objectType)
        };

        // Collect Options for Filters
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
        
        // Tree Building Logic
        if (category === 'city') {
            groupKey = rowData.city;
            if (groupKey && rowData.region) {
                const regionNode = findOrAddNode(treeRoot, rowData.region);
                // City is leaf here
                if (!regionNode.children!.find(n => n.value === groupKey)) {
                    regionNode.children!.push({ label: groupKey, value: groupKey });
                }
            }
        } 
        else if (category === 'jk') {
            groupKey = rowData.jk;
            if (groupKey && rowData.region && rowData.city) {
                const regionNode = findOrAddNode(treeRoot, rowData.region);
                const cityNode = findOrAddNode(regionNode.children!, rowData.city);
                // JK is leaf
                if (!cityNode.children!.find(n => n.value === groupKey)) {
                    cityNode.children!.push({ label: groupKey, value: groupKey });
                }
            }
        }
        else if (category === 'liter') {
            groupKey = rowData.liter;
            if (groupKey && rowData.region && rowData.city && rowData.jk) {
                const regionNode = findOrAddNode(treeRoot, rowData.region);
                const cityNode = findOrAddNode(regionNode.children!, rowData.city);
                const jkNode = findOrAddNode(cityNode.children!, rowData.jk);
                // Liter is leaf
                if (!jkNode.children!.find(n => n.value === groupKey)) {
                    jkNode.children!.push({ label: groupKey, value: groupKey });
                }
            }
        }
        else {
            // Flat categories
            switch(category) {
                case 'client': groupKey = rowData.client; break;
                case 'region': groupKey = rowData.region; break;
                case 'year': groupKey = rowData.year || 'Не указан'; break;
                case 'status': groupKey = rowData.status; break;
            }
            if (groupKey) {
                if (!treeRoot.find(n => n.value === groupKey)) {
                    treeRoot.push({ label: groupKey, value: groupKey });
                }
            }
        }

        // Parse Metrics Values
        const parseNum = (idx: number) => {
            if (idx === -1) return 0;
            return parseFloat(String(row[idx]).replace(/\s/g, '').replace(',', '.')) || 0;
        };

        const metricValues: Record<string, number> = {};
        METRICS.forEach(m => {
            metricValues[m.key] = parseNum(metricIndices[m.key]);
        });

        // --- Accumulate Data ---

        const accumulate = (key: string) => {
            if (!dataMap.has(key)) {
                // Initialize with 0s and special 'count' field
                const initObj: Record<string, number> = { count: 0 };
                METRICS.forEach(m => initObj[m.key] = 0);
                dataMap.set(key, initObj);
            }
            const entry = dataMap.get(key)!;
            
            entry.count += 1;
            METRICS.forEach(m => {
                entry[m.key] += metricValues[m.key];
            });
        };

        // 1. Specific Item
        if (groupKey) {
            accumulate(groupKey);
        }

        // 2. Total Item
        if (totalKey) {
            accumulate(totalKey);
        }
    });

    // --- Post-Process: Calculate Averages ---
    dataMap.forEach((entry) => {
        if (entry.count > 0) {
            METRICS.forEach(m => {
                if (m.aggregation === 'avg') {
                    entry[m.key] = entry[m.key] / entry.count;
                }
            });
        }
    });

    // Sort the tree root level
    treeRoot.sort((a, b) => a.label.localeCompare(b.label));
    
    // Helper to recursively sort children
    const sortChildren = (nodes: TreeOption[]) => {
        nodes.forEach(node => {
            if (node.children) {
                node.children.sort((a, b) => a.label.localeCompare(b.label));
                sortChildren(node.children);
            }
        });
    };
    sortChildren(treeRoot);

    // Insert Total Option at the beginning if exists and has data
    if (totalKey && dataMap.has(totalKey)) {
        treeRoot.unshift({
            label: totalKey,
            value: totalKey
        });
    }

    return {
        treeOptions: treeRoot,
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