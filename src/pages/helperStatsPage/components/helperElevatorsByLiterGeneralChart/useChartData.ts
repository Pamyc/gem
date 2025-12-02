
import { useMemo } from 'react';
import { useDataStore } from '../../../../contexts/DataContext';
import { getMergedHeaders } from '../../../../utils/chartUtils';
import { 
  COLORS, STATUS_COLORS, SEPARATOR, ALL_YEARS, ROOT_ID,
  ColorMode, RawItem, CitySummaryItem 
} from './types';

interface UseChartDataProps {
  selectedYear: string;
  selectedCity?: string;
  colorMode: ColorMode;
}

// Helper to safely parse float
const parseFloatSafe = (val: any) => {
    if (!val) return 0;
    const str = String(val).replace(/\s/g, '').replace(',', '.');
    const num = parseFloat(str);
    return isNaN(num) ? 0 : num;
};

export const useChartData = ({ selectedYear, selectedCity, colorMode }: UseChartDataProps) => {
  const { googleSheets, sheetConfigs } = useDataStore();

  return useMemo(() => {
    const sheetKey = 'clientGrowth';
    const sheetData = googleSheets[sheetKey];

    if (!sheetData || !sheetData.headers || !sheetData.rows) {
      return {
        chartData: [],
        sunburstData: [],
        xLabels: [],
        uniqueJKs: [],
        citySummary: [],
        totalElevators: 0,
        totalFloors: 0,
        totalProfit: 0,
        years: [ALL_YEARS],
      };
    }

    const config = sheetConfigs.find(c => c.key === sheetKey);
    const headerRows = config?.headerRows || 1;
    const headers = getMergedHeaders(sheetData.headers, headerRows);

    // Standard Columns
    const idxJK = headers.indexOf('ЖК');
    const idxLiter = headers.indexOf('Литер');
    const idxElevators = headers.indexOf('Кол-во лифтов');
    const idxFloors = headers.indexOf('Кол-во этажей');
    const idxProfit = headers.indexOf('Валовая'); // Or "Валовая + Валовая + Валовая" if logic changes, currently simple match works due to header merging logic usually picking unique
    
    const idxCity = headers.indexOf('Город');
    const idxYear = headers.indexOf('Год');
    const idxStatus = headers.indexOf('Сдан да/нет');
    const idxTotal = headers.indexOf('Итого (Да/Нет)');
    const idxNoBreakdown = headers.indexOf('Отдельный литер (Да/Нет)');

    // --- New Financial Columns ---
    // Using strict match based on user prompt convention "Row1 + Row2 + Row3"
    const idxIncomeFact = headers.indexOf('Доходы + Итого + Факт');
    const idxExpenseFact = headers.indexOf('Расходы + Итого + факт');
    
    const idxIncomeLO = headers.indexOf('Доходы + Лифтовое оборудование + Факт');
    const idxExpenseLO = headers.indexOf('Расходы + Лифтовое оборудование + Факт');
    
    const idxIncomeObr = headers.indexOf('Доходы + Обрамление + Факт');
    const idxExpenseObr = headers.indexOf('Расходы + Обрамление + Факт');
    
    const idxIncomeMont = headers.indexOf('Доходы + Монтаж ЛО + Факт');
    const idxExpenseMont = headers.indexOf('Расходы + Монтаж ЛО + Факт');
    
    // Averages
    const idxRentability = headers.indexOf('Рентабельность'); 
    const idxProfitPerLift = headers.indexOf('Прибыль с 1 лифта');

    if (idxJK === -1 || idxElevators === -1 || idxCity === -1) {
      return {
        chartData: [],
        sunburstData: [],
        xLabels: [],
        uniqueJKs: [],
        citySummary: [],
        totalElevators: 0,
        totalFloors: 0,
        totalProfit: 0,
        years: [ALL_YEARS],
      };
    }

    const yearSet = new Set<string>();
    const rawItems: RawItem[] = [];

    sheetData.rows.forEach(row => {
      if (idxTotal !== -1 && String(row[idxTotal]).trim().toLowerCase() === 'да') return;
      if (idxNoBreakdown !== -1 && String(row[idxNoBreakdown]).trim().toLowerCase() === 'нет') return;

      const rowCity = String(row[idxCity] ?? '').trim();
      if (!rowCity) return;

      // Filter by City if provided
      if (selectedCity && rowCity !== selectedCity) return;

      const rowYear = idxYear !== -1 ? String(row[idxYear] ?? '').trim() : '';
      if (rowYear) yearSet.add(rowYear);

      if (selectedYear !== ALL_YEARS && rowYear && rowYear !== selectedYear) return;

      const jk = String(row[idxJK] ?? '').trim();
      const literRaw = idxLiter !== -1 ? String(row[idxLiter] ?? '').trim() : '';
      const liter = literRaw || jk;
      const statusRaw = idxStatus !== -1 ? String(row[idxStatus] ?? '').trim().toLowerCase() : '';
      const isHandedOver = statusRaw === 'да';
      
      const value = parseFloatSafe(row[idxElevators]);
      const floors = idxFloors !== -1 ? parseFloatSafe(row[idxFloors]) : 0;
      const profit = idxProfit !== -1 ? parseFloatSafe(row[idxProfit]) : 0;

      // New Financials
      const incomeFact = idxIncomeFact !== -1 ? parseFloatSafe(row[idxIncomeFact]) : 0;
      const expenseFact = idxExpenseFact !== -1 ? parseFloatSafe(row[idxExpenseFact]) : 0;
      const incomeLO = idxIncomeLO !== -1 ? parseFloatSafe(row[idxIncomeLO]) : 0;
      const expenseLO = idxExpenseLO !== -1 ? parseFloatSafe(row[idxExpenseLO]) : 0;
      const incomeObr = idxIncomeObr !== -1 ? parseFloatSafe(row[idxIncomeObr]) : 0;
      const expenseObr = idxExpenseObr !== -1 ? parseFloatSafe(row[idxExpenseObr]) : 0;
      const incomeMont = idxIncomeMont !== -1 ? parseFloatSafe(row[idxIncomeMont]) : 0;
      const expenseMont = idxExpenseMont !== -1 ? parseFloatSafe(row[idxExpenseMont]) : 0;
      
      const rentability = idxRentability !== -1 ? parseFloatSafe(row[idxRentability]) : 0;
      const profitPerLift = idxProfitPerLift !== -1 ? parseFloatSafe(row[idxProfitPerLift]) : 0;

      if (!jk || !liter || value === 0) return;

      rawItems.push({ 
          city: rowCity, jk, liter, value, floors, profit, isHandedOver,
          incomeFact, expenseFact,
          incomeLO, expenseLO,
          incomeObr, expenseObr,
          incomeMont, expenseMont,
          rentability, profitPerLift
      });
    });

    if (rawItems.length === 0) {
      const yearsArr = Array.from(yearSet).sort((a, b) => a.localeCompare(b, 'ru', { numeric: true }));
      return {
        chartData: [],
        sunburstData: [],
        xLabels: [],
        uniqueJKs: [],
        citySummary: [],
        totalElevators: 0,
        totalFloors: 0,
        totalProfit: 0,
        years: [ALL_YEARS, ...yearsArr],
      };
    }

    rawItems.sort((a, b) => {
      if (a.city !== b.city) return a.city.localeCompare(b.city);
      if (a.jk !== b.jk) return a.jk.localeCompare(b.jk);
      return a.liter.localeCompare(b.liter, undefined, { numeric: true, sensitivity: 'base' });
    });

    const uniqueJKsList = Array.from(new Set(rawItems.map(i => i.jk)));
    
    // Grand Totals
    const totalElevatorsCalc = rawItems.reduce((acc, curr) => acc + curr.value, 0);
    const totalFloorsCalc = rawItems.reduce((acc, curr) => acc + curr.floors, 0);
    const totalProfitCalc = rawItems.reduce((acc, curr) => acc + curr.profit, 0);

    // --- Aggregation Structures ---
    type Aggregator = {
        count: number; // for averages
        total: number;
        totalFloors: number;
        totalProfit: number;
        
        incomeFact: number;
        expenseFact: number;
        incomeLO: number;
        expenseLO: number;
        incomeObr: number;
        expenseObr: number;
        incomeMont: number;
        expenseMont: number;
        
        sumRentability: number;
        sumProfitPerLift: number;
    }

    const createAggregator = (): Aggregator => ({
        count: 0,
        total: 0, totalFloors: 0, totalProfit: 0,
        incomeFact: 0, expenseFact: 0,
        incomeLO: 0, expenseLO: 0,
        incomeObr: 0, expenseObr: 0,
        incomeMont: 0, expenseMont: 0,
        sumRentability: 0, sumProfitPerLift: 0
    });

    const accumulate = (acc: Aggregator, item: RawItem) => {
        acc.count += 1;
        acc.total += item.value;
        acc.totalFloors += item.floors;
        acc.totalProfit += item.profit;
        
        acc.incomeFact += item.incomeFact;
        acc.expenseFact += item.expenseFact;
        acc.incomeLO += item.incomeLO;
        acc.expenseLO += item.expenseLO;
        acc.incomeObr += item.incomeObr;
        acc.expenseObr += item.expenseObr;
        acc.incomeMont += item.incomeMont;
        acc.expenseMont += item.expenseMont;
        
        acc.sumRentability += item.rentability;
        acc.sumProfitPerLift += item.profitPerLift;
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
        
        const jksArray = Array.from(data.jks.entries())
          .map(([jkName, jkData]) => {
             // Map liters for this JK
             const litersArray = jkData.liters.map(l => ({
                 name: l.liter,
                 value: l.value,
                 floors: l.floors,
                 profit: l.profit,
                 isHandedOver: l.isHandedOver,
                 percent: jkData.agg.total > 0 ? ((l.value / jkData.agg.total) * 100).toFixed(1) : '0',
                 percentFloors: jkData.agg.totalFloors > 0 ? ((l.floors / jkData.agg.totalFloors) * 100).toFixed(1) : '0',
                 percentProfit: jkData.agg.totalProfit > 0 ? ((l.profit / jkData.agg.totalProfit) * 100).toFixed(1) : '0',
                 
                 // Pass through raw for liter (no averaging needed really, it's a single item)
                 incomeFact: l.incomeFact,
                 expenseFact: l.expenseFact,
                 incomeLO: l.incomeLO,
                 expenseLO: l.expenseLO,
                 incomeObr: l.incomeObr,
                 expenseObr: l.expenseObr,
                 incomeMont: l.incomeMont,
                 expenseMont: l.expenseMont,
                 rentability: l.rentability,
                 profitPerLift: l.profitPerLift,

             })).sort((a, b) => b.value - a.value);

             return {
                name: jkName,
                value: jkData.agg.total,
                floors: jkData.agg.totalFloors,
                profit: jkData.agg.totalProfit,
                percent: data.agg.total > 0 ? ((jkData.agg.total / data.agg.total) * 100).toFixed(1) : '0',
                percentFloors: data.agg.totalFloors > 0 ? ((jkData.agg.totalFloors / data.agg.totalFloors) * 100).toFixed(1) : '0',
                percentProfit: data.agg.totalProfit > 0 ? ((jkData.agg.totalProfit / data.agg.totalProfit) * 100).toFixed(1) : '0',
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
                rentability: jkData.agg.count > 0 ? jkData.agg.sumRentability / jkData.agg.count : 0,
                profitPerLift: jkData.agg.count > 0 ? jkData.agg.sumProfitPerLift / jkData.agg.count : 0,
             };
          })
          .sort((a, b) => b.value - a.value);

        return {
          name: cityName,
          value: data.agg.total,
          floors: data.agg.totalFloors,
          profit: data.agg.totalProfit,
          percent: totalElevatorsCalc > 0 ? ((data.agg.total / totalElevatorsCalc) * 100).toFixed(1) : '0',
          percentFloors: totalFloorsCalc > 0 ? ((data.agg.totalFloors / totalFloorsCalc) * 100).toFixed(1) : '0',
          percentProfit: totalProfitCalc > 0 ? ((data.agg.totalProfit / totalProfitCalc) * 100).toFixed(1) : '0',
          color: cityColor,
          jks: jksArray,

          // City Aggregates
          incomeFact: data.agg.incomeFact,
          expenseFact: data.agg.expenseFact,
          incomeLO: data.agg.incomeLO,
          expenseLO: data.agg.expenseLO,
          incomeObr: data.agg.incomeObr,
          expenseObr: data.agg.expenseObr,
          incomeMont: data.agg.incomeMont,
          expenseMont: data.agg.expenseMont,
          rentability: data.agg.count > 0 ? data.agg.sumRentability / data.agg.count : 0,
          profitPerLift: data.agg.count > 0 ? data.agg.sumProfitPerLift / data.agg.count : 0,
        };
      })
      .sort((a, b) => b.value - a.value);

    const getItemColor = (jkName: string, isHandedOver: boolean) => {
      if (colorMode === 'status') return isHandedOver ? STATUS_COLORS.yes : STATUS_COLORS.no;
      return COLORS[uniqueJKsList.indexOf(jkName) % COLORS.length];
    };

    // Bar Data
    const chartData = rawItems.map(item => ({
      value: item.value,
      floors: item.floors,
      profit: item.profit,
      name: `${item.city} / ${item.jk} / ${item.liter}`,
      jkName: item.jk,
      cityName: item.city,
      literName: item.liter,
      isHandedOver: item.isHandedOver,
      itemStyle: {
        color: getItemColor(item.jk, item.isHandedOver),
        borderRadius: [3, 3, 0, 0],
      },
      // Pass all extra fields to bar items too for consistent tooltip
      incomeFact: item.incomeFact,
      expenseFact: item.expenseFact,
      incomeLO: item.incomeLO,
      expenseLO: item.expenseLO,
      incomeObr: item.incomeObr,
      expenseObr: item.expenseObr,
      incomeMont: item.incomeMont,
      expenseMont: item.expenseMont,
      rentability: item.rentability,
      profitPerLift: item.profitPerLift,
    }));
    const xLabels = chartData.map(i => i.name);

    // Sunburst Data with ROOT Node
    const sunburstChildren = citySummary.map((city) => {
      const cityId = `city:${city.name}`;
      
      return {
        id: cityId,
        name: city.name,
        value: city.value,
        floors: city.floors,
        profit: city.profit,
        // Embed calculated percentages and ALL financials
        data: {
            percent: city.percent,
            percentFloors: city.percentFloors,
            percentProfit: city.percentProfit,
            
            incomeFact: city.incomeFact,
            expenseFact: city.expenseFact,
            incomeLO: city.incomeLO,
            expenseLO: city.expenseLO,
            incomeObr: city.incomeObr,
            expenseObr: city.expenseObr,
            incomeMont: city.incomeMont,
            expenseMont: city.expenseMont,
            rentability: city.rentability,
            profitPerLift: city.profitPerLift
        },
        itemStyle: { color: city.color },
        children: city.jks.map(jk => {
          const jkId = `city:${city.name}|jk:${jk.name}`;
          const jkColor = COLORS[uniqueJKsList.indexOf(jk.name) % COLORS.length];

          return {
            id: jkId,
            name: `${city.name}${SEPARATOR}${jk.name}`,
            value: jk.value,
            floors: jk.floors,
            profit: jk.profit,
            data: {
                percent: jk.percent,
                percentFloors: jk.percentFloors,
                percentProfit: jk.percentProfit,

                incomeFact: jk.incomeFact,
                expenseFact: jk.expenseFact,
                incomeLO: jk.incomeLO,
                expenseLO: jk.expenseLO,
                incomeObr: jk.incomeObr,
                expenseObr: jk.expenseObr,
                incomeMont: jk.incomeMont,
                expenseMont: jk.expenseMont,
                rentability: jk.rentability,
                profitPerLift: jk.profitPerLift
            },
            itemStyle: { color: jkColor },
            children: jk.liters.map(lit => {
              const literId = `city:${city.name}|jk:${jk.name}|liter:${lit.name}`;
              return {
                id: literId,
                name: `${city.name}${SEPARATOR}${jk.name}${SEPARATOR}${lit.name}`,
                value: lit.value,
                floors: lit.floors,
                profit: lit.profit,
                data: {
                    percent: lit.percent,
                    percentFloors: lit.percentFloors,
                    percentProfit: lit.percentProfit,

                    incomeFact: lit.incomeFact,
                    expenseFact: lit.expenseFact,
                    incomeLO: lit.incomeLO,
                    expenseLO: lit.expenseLO,
                    incomeObr: lit.incomeObr,
                    expenseObr: lit.expenseObr,
                    incomeMont: lit.incomeMont,
                    expenseMont: lit.expenseMont,
                    rentability: lit.rentability,
                    profitPerLift: lit.profitPerLift
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

    const yearsArr = Array.from(yearSet).sort((a, b) => a.localeCompare(b, 'ru', { numeric: true }));

    return {
      chartData,
      sunburstData,
      xLabels,
      uniqueJKs: uniqueJKsList,
      citySummary,
      totalElevators: totalElevatorsCalc,
      totalFloors: totalFloorsCalc,
      totalProfit: totalProfitCalc,
      years: [ALL_YEARS, ...yearsArr],
    };
  }, [googleSheets, sheetConfigs, selectedYear, selectedCity, colorMode]);
};
