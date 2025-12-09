
import { useMemo } from 'react';
import { useDataStore } from '../../../../contexts/DataContext';
import { getMergedHeaders } from '../../../../utils/chartUtils';
import { 
  COLORS, STATUS_COLORS, SEPARATOR, ALL_YEARS, ROOT_ID,
  ColorMode, RawItem, CitySummaryItem, MetricKey, FilterState, FilterOptions
} from './types';

interface UseChartDataProps {
  filters: FilterState;
  colorMode: ColorMode;
  activeMetric: MetricKey;
}

// Helper to safely parse float
const parseFloatSafe = (val: any) => {
    if (!val) return 0;
    const str = String(val).replace(/\s/g, '').replace(',', '.');
    const num = parseFloat(str);
    return isNaN(num) ? 0 : num;
};

// Helper to clean strings
const cleanStr = (val: any) => String(val || '').trim();

export const useChartData = ({ filters, colorMode, activeMetric }: UseChartDataProps) => {
  const { googleSheets, sheetConfigs } = useDataStore();

  return useMemo(() => {
    const sheetKey = 'clientGrowth';
    const sheetData = googleSheets[sheetKey];

    // Default return
    const emptyResult = {
        chartData: [],
        sunburstData: [],
        xLabels: [],
        uniqueJKs: [],
        citySummary: [],
        totalValue: 0,
        filterOptions: {
            years: [], regions: [], cities: [], jks: [], clients: [], statuses: [], objectTypes: []
        } as FilterOptions
    };

    if (!sheetData || !sheetData.headers || !sheetData.rows) {
      return emptyResult;
    }

    const config = sheetConfigs.find(c => c.key === sheetKey);
    const headerRows = config?.headerRows || 1;
    const headers = getMergedHeaders(sheetData.headers, headerRows);

    // Standard Columns
    const idxJK = headers.indexOf('ЖК');
    const idxLiter = headers.indexOf('Литер');
    const idxElevators = headers.indexOf('Кол-во лифтов');
    const idxFloors = headers.indexOf('Кол-во этажей');
    const idxProfit = headers.indexOf('Валовая'); 
    
    const idxCity = headers.indexOf('Город');
    const idxRegion = headers.indexOf('Регион');
    const idxYear = headers.indexOf('Год');
    const idxStatus = headers.indexOf('Сдан да/нет');
    const idxTotal = headers.indexOf('Итого (Да/Нет)');
    const idxNoBreakdown = headers.indexOf('Отдельный литер (Да/Нет)');

    // Text Fields
    const idxClient = headers.indexOf('Клиент');
    const idxObjectType = headers.indexOf('Тип объекта');

    // --- New Financial Columns ---
    const idxIncomeFact = headers.indexOf('Доходы + Итого + Факт');
    const idxExpenseFact = headers.indexOf('Расходы + Итого + Факт');
    
    const idxIncomeLO = headers.indexOf('Доходы + Лифтовое оборудование + Факт');
    const idxExpenseLO = headers.indexOf('Расходы + Лифтовое оборудование + Факт');
    
    const idxIncomeObr = headers.indexOf('Доходы + Обрамление + Факт');
    const idxExpenseObr = headers.indexOf('Расходы + Обрамление + Факт');
    
    const idxIncomeMont = headers.indexOf('Доходы + Монтаж ЛО + Факт');
    const idxExpenseMont = headers.indexOf('Расходы + Монтаж ЛО + Факт');
    
    // Averages
    const idxProfitPerLift = headers.indexOf('Прибыль с 1 лифта');

    if (idxJK === -1 || idxElevators === -1 || idxCity === -1) {
      return emptyResult;
    }

    const rawItems: RawItem[] = [];
    
    // Collectors for Filter Options (Unique values)
    const optionsSet = {
        years: new Set<string>(),
        regions: new Set<string>(),
        cities: new Set<string>(),
        jks: new Set<string>(),
        clients: new Set<string>(),
        statuses: new Set<string>(),
        objectTypes: new Set<string>()
    };

    sheetData.rows.forEach(row => {
      if (idxTotal !== -1 && String(row[idxTotal]).trim().toLowerCase() === 'да') return;
      if (idxNoBreakdown !== -1 && String(row[idxNoBreakdown]).trim().toLowerCase() === 'нет') return;

      const rowCity = String(row[idxCity] ?? '').trim();
      const jk = String(row[idxJK] ?? '').trim();
      
      if (!rowCity || !jk) return;

      const literRaw = idxLiter !== -1 ? String(row[idxLiter] ?? '').trim() : '';
      const liter = literRaw || jk;
      const statusRaw = idxStatus !== -1 ? String(row[idxStatus] ?? '').trim().toLowerCase() : '';
      const isHandedOver = statusRaw === 'да';
      
      const region = idxRegion !== -1 ? cleanStr(row[idxRegion]) : '';
      const client = idxClient !== -1 ? cleanStr(row[idxClient]) : '';
      const objectType = idxObjectType !== -1 ? cleanStr(row[idxObjectType]) : '';
      const rowYear = idxYear !== -1 ? String(row[idxYear] ?? '').trim() : '';

      const value = parseFloatSafe(row[idxElevators]);
      
      if (value === 0) return; // Skip zero value rows

      // --- Collect Options (Before Filtering) ---
      if (rowYear) optionsSet.years.add(rowYear);
      if (region) optionsSet.regions.add(region);
      if (rowCity) optionsSet.cities.add(rowCity);
      if (jk) optionsSet.jks.add(jk);
      if (client) optionsSet.clients.add(client);
      if (objectType) optionsSet.objectTypes.add(objectType);
      optionsSet.statuses.add(isHandedOver ? 'Сдан' : 'В работе');

      // --- Apply Filters ---
      if (filters.years.length > 0 && !filters.years.includes(rowYear)) return;
      if (filters.regions.length > 0 && !filters.regions.includes(region)) return;
      if (filters.cities.length > 0 && !filters.cities.includes(rowCity)) return;
      if (filters.jks.length > 0 && !filters.jks.includes(jk)) return;
      if (filters.clients.length > 0 && !filters.clients.includes(client)) return;
      if (filters.objectTypes.length > 0 && !filters.objectTypes.includes(objectType)) return;
      
      const statusStr = isHandedOver ? 'Сдан' : 'В работе';
      if (filters.statuses.length > 0 && !filters.statuses.includes(statusStr)) return;

      // --- Process Metrics ---
      const floors = idxFloors !== -1 ? parseFloatSafe(row[idxFloors]) : 0;
      const profit = idxProfit !== -1 ? parseFloatSafe(row[idxProfit]) : 0;

      const incomeFact = idxIncomeFact !== -1 ? parseFloatSafe(row[idxIncomeFact]) : 0;
      const expenseFact = idxExpenseFact !== -1 ? parseFloatSafe(row[idxExpenseFact]) : 0;
      const incomeLO = idxIncomeLO !== -1 ? parseFloatSafe(row[idxIncomeLO]) : 0;
      const expenseLO = idxExpenseLO !== -1 ? parseFloatSafe(row[idxExpenseLO]) : 0;
      const incomeObr = idxIncomeObr !== -1 ? parseFloatSafe(row[idxIncomeObr]) : 0;
      const expenseObr = idxExpenseObr !== -1 ? parseFloatSafe(row[idxExpenseObr]) : 0;
      const incomeMont = idxIncomeMont !== -1 ? parseFloatSafe(row[idxIncomeMont]) : 0;
      const expenseMont = idxExpenseMont !== -1 ? parseFloatSafe(row[idxExpenseMont]) : 0;
      
      const profitPerLift = idxProfitPerLift !== -1 ? parseFloatSafe(row[idxProfitPerLift]) : 0;

      rawItems.push({ 
          city: rowCity, jk, liter, 
          client, objectType, year: rowYear,
          value, floors, profit, isHandedOver,
          incomeFact, expenseFact,
          incomeLO, expenseLO,
          incomeObr, expenseObr,
          incomeMont, expenseMont,
          profitPerLift
      });
    });

    // Prepare Filter Options Object
    const filterOptions: FilterOptions = {
        years: Array.from(optionsSet.years).sort().reverse(),
        regions: Array.from(optionsSet.regions).sort(),
        cities: Array.from(optionsSet.cities).sort(),
        jks: Array.from(optionsSet.jks).sort(),
        clients: Array.from(optionsSet.clients).sort(),
        statuses: Array.from(optionsSet.statuses).sort(),
        objectTypes: Array.from(optionsSet.objectTypes).sort()
    };

    if (rawItems.length === 0) {
      return {
        ...emptyResult,
        filterOptions
      };
    }

    rawItems.sort((a, b) => {
      if (a.city !== b.city) return a.city.localeCompare(b.city);
      if (a.jk !== b.jk) return a.jk.localeCompare(b.jk);
      return a.liter.localeCompare(b.liter, undefined, { numeric: true, sensitivity: 'base' });
    });

    const uniqueJKsList = Array.from(new Set(rawItems.map(i => i.jk)));
    
    // --- Determine active values for nodes and total based on selected metric ---
    const getValue = (item: RawItem, metric: MetricKey): number => {
        // Direct access since RawItem keys match MetricKey
        return (item as any)[metric] || 0;
    };

    // Calculate Grand Total for the ACTIVE METRIC to use in percentages
    const totalMetricValue = rawItems.reduce((acc, curr) => acc + getValue(curr, activeMetric), 0);

    // --- Aggregation Structures ---
    type Aggregator = {
        count: number;
        // We aggregate EVERYTHING so we can switch views or show tooltips
        value: number; // Elevators
        floors: number;
        profit: number;
        incomeFact: number; expenseFact: number;
        incomeLO: number; expenseLO: number;
        incomeObr: number; expenseObr: number;
        incomeMont: number; expenseMont: number;
        sumProfitPerLift: number;
        
        // Sets for text aggregation
        clients: Set<string>;
        cities: Set<string>;
        jks: Set<string>;
        statuses: Set<string>;
        objectTypes: Set<string>;
        years: Set<string>;

        // This is the aggregated value of the currently selected metric
        activeMetricSum: number; 
    }

    const createAggregator = (): Aggregator => ({
        count: 0,
        value: 0, floors: 0, profit: 0,
        incomeFact: 0, expenseFact: 0,
        incomeLO: 0, expenseLO: 0,
        incomeObr: 0, expenseObr: 0,
        incomeMont: 0, expenseMont: 0,
        sumProfitPerLift: 0,
        
        clients: new Set(),
        cities: new Set(),
        jks: new Set(),
        statuses: new Set(),
        objectTypes: new Set(),
        years: new Set(),

        activeMetricSum: 0
    });

    const accumulate = (acc: Aggregator, item: RawItem) => {
        acc.count += 1;
        acc.value += item.value;
        acc.floors += item.floors;
        acc.profit += item.profit;
        
        acc.incomeFact += item.incomeFact;
        acc.expenseFact += item.expenseFact;
        acc.incomeLO += item.incomeLO;
        acc.expenseLO += item.expenseLO;
        acc.incomeObr += item.incomeObr;
        acc.expenseObr += item.expenseObr;
        acc.incomeMont += item.incomeMont;
        acc.expenseMont += item.expenseMont;
        
        acc.sumProfitPerLift += item.profitPerLift;

        // Text Aggregation
        if (item.client) acc.clients.add(item.client);
        if (item.city) acc.cities.add(item.city);
        if (item.jk) acc.jks.add(item.jk);
        if (item.objectType) acc.objectTypes.add(item.objectType);
        if (item.year) acc.years.add(item.year);
        acc.statuses.add(item.isHandedOver ? 'Сдан' : 'В работе');

        // Accumulate active metric specifically
        acc.activeMetricSum += getValue(item, activeMetric);
    };

    const cityMap = new Map<string, { 
      agg: Aggregator;
      jks: Map<string, { agg: Aggregator; liters: RawItem[] }> 
    }>();
    
    rawItems.forEach(item => {
      if (!cityMap.has(item.city)) {
        cityMap.set(item.city, { agg: createAggregator(), jks: new Map() });
      }
      const cityEntry = cityMap.get(item.city)!;
      accumulate(cityEntry.agg, item);

      if (!cityEntry.jks.has(item.jk)) {
        cityEntry.jks.set(item.jk, { agg: createAggregator(), liters: [] });
      }
      const jkEntry = cityEntry.jks.get(item.jk)!;
      accumulate(jkEntry.agg, item);
      jkEntry.liters.push(item);
    });

    const citySummary: CitySummaryItem[] = Array.from(cityMap.entries())
      .map(([cityName, data], idx) => {
        const cityColor = COLORS[idx % COLORS.length];
        const cityActiveValue = data.agg.activeMetricSum;

        const jksArray = Array.from(data.jks.entries())
          .map(([jkName, jkData]) => {
             const jkActiveValue = jkData.agg.activeMetricSum;

             // Map liters for this JK
             const litersArray = jkData.liters.map(l => {
                 const literActiveValue = getValue(l, activeMetric);
                 return {
                    name: l.liter,
                    // DYNAMIC VALUE FOR CHART
                    value: literActiveValue, 
                    
                    // DYNAMIC PERCENT based on JK Total of active metric (or handle 0)
                    percent: jkActiveValue > 0 ? ((literActiveValue / jkActiveValue) * 100).toFixed(1) : '0',
                    
                    // Static props for tooltip
                    elevators: l.value,
                    floors: l.floors,
                    profit: l.profit,
                    isHandedOver: l.isHandedOver,
                    
                    incomeFact: l.incomeFact,
                    expenseFact: l.expenseFact,
                    incomeLO: l.incomeLO,
                    expenseLO: l.expenseLO,
                    incomeObr: l.incomeObr,
                    expenseObr: l.expenseObr,
                    incomeMont: l.incomeMont,
                    expenseMont: l.expenseMont,
                    profitPerLift: l.profitPerLift,

                    // Text Metadata
                    clients: l.client ? [l.client] : [],
                    cities: [l.city],
                    jks: [l.jk],
                    statuses: [l.isHandedOver ? 'Сдан' : 'В работе'],
                    objectTypes: l.objectType ? [l.objectType] : [],
                    years: l.year ? [l.year] : []
                 };
             }).sort((a, b) => b.value - a.value);

             return {
                name: jkName,
                // DYNAMIC VALUE FOR CHART
                value: jkActiveValue,
                // DYNAMIC PERCENT based on City Total of active metric
                percent: cityActiveValue > 0 ? ((jkActiveValue / cityActiveValue) * 100).toFixed(1) : '0',
                
                // Static props for tooltip
                elevators: jkData.agg.value,
                floors: jkData.agg.floors,
                profit: jkData.agg.profit,
                liters: litersArray,

                // Aggregated Fields
                incomeFact: jkData.agg.incomeFact,
                expenseFact: jkData.agg.expenseFact,
                incomeLO: jkData.agg.incomeLO,
                expenseLO: jkData.agg.expenseLO,
                incomeObr: jkData.agg.incomeObr,
                expenseObr: jkData.agg.expenseObr,
                incomeMont: jkData.agg.incomeMont,
                expenseMont: jkData.agg.expenseMont,
                profitPerLift: jkData.agg.count > 0 ? jkData.agg.sumProfitPerLift / jkData.agg.count : 0,

                // Text Aggregates
                clients: Array.from(jkData.agg.clients),
                cities: Array.from(jkData.agg.cities),
                jks: Array.from(jkData.agg.jks),
                statuses: Array.from(jkData.agg.statuses),
                objectTypes: Array.from(jkData.agg.objectTypes),
                years: Array.from(jkData.agg.years),
             };
          })
          .sort((a, b) => b.value - a.value);

        return {
          name: cityName,
          // DYNAMIC VALUE FOR CHART
          value: cityActiveValue,
          // DYNAMIC PERCENT based on Grand Total of active metric
          percent: totalMetricValue > 0 ? ((cityActiveValue / totalMetricValue) * 100).toFixed(1) : '0',
          
          color: cityColor,
          childrenJKs: jksArray,

          // Static props
          elevators: data.agg.value,
          floors: data.agg.floors,
          profit: data.agg.profit,

          // City Aggregates
          incomeFact: data.agg.incomeFact,
          expenseFact: data.agg.expenseFact,
          incomeLO: data.agg.incomeLO,
          expenseLO: data.agg.expenseLO,
          incomeObr: data.agg.incomeObr,
          expenseObr: data.agg.expenseObr,
          incomeMont: data.agg.incomeMont,
          expenseMont: data.agg.expenseMont,
          profitPerLift: data.agg.count > 0 ? data.agg.sumProfitPerLift / data.agg.count : 0,

          // Text Aggregates
          clients: Array.from(data.agg.clients),
          cities: Array.from(data.agg.cities),
          jks: Array.from(data.agg.jks),
          statuses: Array.from(data.agg.statuses),
          objectTypes: Array.from(data.agg.objectTypes),
          years: Array.from(data.agg.years),
        };
      })
      .sort((a, b) => b.value - a.value);

    const getItemColor = (jkName: string, isHandedOver: boolean) => {
      if (colorMode === 'status') return isHandedOver ? STATUS_COLORS.yes : STATUS_COLORS.no;
      return COLORS[uniqueJKsList.indexOf(jkName) % COLORS.length];
    };

    // Bar Data - Use Active Metric for Value
    const chartData = rawItems.map(item => ({
      value: getValue(item, activeMetric), // DYNAMIC VALUE
      name: `${item.city} / ${item.jk} / ${item.liter}`,
      jkName: item.jk,
      cityName: item.city,
      literName: item.liter,
      isHandedOver: item.isHandedOver,
      itemStyle: {
        color: getItemColor(item.jk, item.isHandedOver),
        borderRadius: [3, 3, 0, 0],
      },
      // Pass all original fields for tooltip
      elevators: item.value,
      floors: item.floors,
      profit: item.profit,
      incomeFact: item.incomeFact,
      expenseFact: item.expenseFact,
      incomeLO: item.incomeLO,
      expenseLO: item.expenseLO,
      incomeObr: item.incomeObr,
      expenseObr: item.expenseObr,
      incomeMont: item.incomeMont,
      expenseMont: item.expenseMont,
      profitPerLift: item.profitPerLift,

      // Text Fields for Tooltip (wrapped in arrays)
      clients: item.client ? [item.client] : [],
      cities: [item.city],
      jks: [item.jk],
      statuses: [item.isHandedOver ? 'Сдан' : 'В работе'],
      objectTypes: item.objectType ? [item.objectType] : [],
      years: item.year ? [item.year] : []
    }));
    const xLabels = chartData.map(i => i.name);

    // Sunburst Data with ROOT Node
    const sunburstChildren = citySummary.map((city) => {
      const cityId = `city:${city.name}`;
      
      return {
        id: cityId,
        name: city.name,
        value: city.value, // Uses Active Metric
        // Embed calculated percentages and ALL financials
        data: {
            percent: city.percent, // Already relative to active metric total
            
            // Raw values for tooltip
            elevators: city.elevators,
            floors: city.floors,
            profit: city.profit,
            
            incomeFact: city.incomeFact,
            expenseFact: city.expenseFact,
            incomeLO: city.incomeLO,
            expenseLO: city.expenseLO,
            incomeObr: city.incomeObr,
            expenseObr: city.expenseObr,
            incomeMont: city.incomeMont,
            expenseMont: city.expenseMont,
            profitPerLift: city.profitPerLift,

            // Text Aggregates
            clients: city.clients,
            cities: city.cities,
            jks: city.jks,
            statuses: city.statuses,
            objectTypes: city.objectTypes,
            years: city.years
        },
        itemStyle: { color: city.color },
        children: city.childrenJKs.map(jk => {
          const jkId = `city:${city.name}|jk:${jk.name}`;
          const jkColor = COLORS[uniqueJKsList.indexOf(jk.name) % COLORS.length];

          return {
            id: jkId,
            name: `${city.name}${SEPARATOR}${jk.name}`,
            value: jk.value, // Uses Active Metric
            data: {
                percent: jk.percent,

                elevators: jk.elevators,
                floors: jk.floors,
                profit: jk.profit,

                incomeFact: jk.incomeFact,
                expenseFact: jk.expenseFact,
                incomeLO: jk.incomeLO,
                expenseLO: jk.expenseLO,
                incomeObr: jk.incomeObr,
                expenseObr: jk.expenseObr,
                incomeMont: jk.incomeMont,
                expenseMont: jk.expenseMont,
                profitPerLift: jk.profitPerLift,

                // Text Aggregates
                clients: jk.clients,
                cities: jk.cities,
                jks: jk.jks,
                statuses: jk.statuses,
                objectTypes: jk.objectTypes,
                years: jk.years
            },
            itemStyle: { color: jkColor },
            children: jk.liters.map(lit => {
              const literId = `city:${city.name}|jk:${jk.name}|liter:${lit.name}`;
              return {
                id: literId,
                name: `${city.name}${SEPARATOR}${jk.name}${SEPARATOR}${lit.name}`,
                value: lit.value, // Uses Active Metric
                data: {
                    percent: lit.percent,

                    elevators: lit.elevators,
                    floors: lit.floors,
                    profit: lit.profit,

                    incomeFact: lit.incomeFact,
                    expenseFact: lit.expenseFact,
                    incomeLO: lit.incomeLO,
                    expenseLO: lit.expenseLO,
                    incomeObr: lit.incomeObr,
                    expenseObr: lit.expenseObr,
                    incomeMont: lit.incomeMont,
                    expenseMont: lit.expenseMont,
                    profitPerLift: lit.profitPerLift,

                    // Text Aggregates
                    clients: lit.clients,
                    cities: lit.cities,
                    jks: lit.jks,
                    statuses: lit.statuses,
                    objectTypes: lit.objectTypes,
                    years: lit.years
                },
                itemStyle: {
                  color: getItemColor(jk.name, lit.isHandedOver),
                  opacity: colorMode === 'status' ? 1 : 0.8,
                },
              };
            }),
          };
        }),
      };
    });

    const sunburstData = [{
        id: ROOT_ID,
        name: '',
        itemStyle: { color: 'transparent' }, 
        children: sunburstChildren
    }];

    return {
      chartData,
      sunburstData,
      xLabels,
      uniqueJKs: uniqueJKsList,
      citySummary,
      totalValue: totalMetricValue, // Total of active metric
      filterOptions // Return collected options for the menu
    };
  }, [googleSheets, sheetConfigs, filters, colorMode, activeMetric]);
};
