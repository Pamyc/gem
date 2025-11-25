
import { CardConfig, ElementDataSettings } from '../types/card';
import { GoogleSheetsData, SheetConfig } from '../contexts/DataContext';
import { getMergedHeaders } from './chartUtils';
import { formatLargeNumber } from './formatUtils';

export interface CalculationResult {
    displayValue: string;
    minValue: string;
    maxValue: string;
    rawMin: number;
    rawMax: number;
}

export const calculateCardMetrics = (
    googleSheets: GoogleSheetsData,
    sheetConfigs: SheetConfig[],
    globalConfig: CardConfig,
    elementSettings?: ElementDataSettings
): CalculationResult => {
    
    // Determine effective configuration (Element override > Global)
    const sheetKey = elementSettings?.sheetKey || globalConfig.sheetKey;
    const dataColumn = elementSettings?.dataColumn || globalConfig.dataColumn;
    const aggregation = elementSettings?.aggregation || globalConfig.aggregation;
    const filters = elementSettings?.filters || globalConfig.filters;
    
    // Use global formatting unless we add overrides for that too later
    const { valuePrefix, valueSuffix, compactNumbers } = globalConfig;

    const emptyResult = { 
        displayValue: '---', 
        minValue: '---', 
        maxValue: '---',
        rawMin: 0,
        rawMax: 0
    };

    if (!sheetKey || !dataColumn) {
        if (compactNumbers) {
            const zero = `${formatLargeNumber(0, valuePrefix)}${valueSuffix}`;
            return { displayValue: zero, minValue: zero, maxValue: zero, rawMin: 0, rawMax: 0 };
        }
        const zero = `${valuePrefix}0${valueSuffix}`;
        return { displayValue: zero, minValue: zero, maxValue: zero, rawMin: 0, rawMax: 0 };
    }

    const sheetData = googleSheets[sheetKey as keyof typeof googleSheets];
    if (!sheetData || !sheetData.headers || sheetData.headers.length === 0 || !sheetData.rows) {
       return emptyResult;
    }

    const currentSheetConfig = sheetConfigs.find(c => c.key === sheetKey);
    const headerRowsCount = currentSheetConfig?.headerRows || 1;
    const availableColumns = getMergedHeaders(sheetData.headers, headerRowsCount);
    
    const colIndex = availableColumns.indexOf(dataColumn);
    if (colIndex === -1) return { ...emptyResult, displayValue: 'Err Col' };

    const currentRows = sheetData.rows;

    // Filter Data
    let filteredData = currentRows;
    if (filters && filters.length > 0) {
        filteredData = currentRows.filter(row => {
            for (const filter of filters) {
                const fColIdx = availableColumns.indexOf(filter.column);
                if (fColIdx === -1) continue;

                const cellValue = String(row[fColIdx] || '').toLowerCase();
                const filterValue = filter.value.toLowerCase();
                const cellNum = parseFloat(cellValue);
                const filterNum = parseFloat(filterValue);

                switch (filter.operator) {
                    case 'equals': if (cellValue !== filterValue) return false; break;
                    case 'contains': if (!cellValue.includes(filterValue)) return false; break;
                    case 'greater': if (isNaN(cellNum) || cellNum <= filterNum) return false; break;
                    case 'less': if (isNaN(cellNum) || cellNum >= filterNum) return false; break;
                }
            }
            return true;
        });
    }

    let result = 0;
    let min = 0;
    let max = 0;

    // Aggregation Logic
    if (aggregation === 'count') {
      result = filteredData.filter(row => {
          const val = row[colIndex];
          return val !== undefined && val !== null && String(val).trim() !== '';
      }).length;
      min = result; 
      max = result;
    }
    else if (aggregation === 'unique') {
      const uniqueSet = new Set();
      filteredData.forEach(row => {
          const val = row[colIndex];
          if (val !== undefined && val !== null && String(val).trim() !== '') {
              uniqueSet.add(String(val).trim());
          }
      });
      result = uniqueSet.size;
      min = result;
      max = result;
    }
    else {
      const values = filteredData.map(row => {
          const val = row[colIndex];
          if (typeof val === 'number') return val;
          const str = String(val).replace(/\s/g, '').replace(',', '.');
          const num = parseFloat(str);
          return isNaN(num) ? 0 : num;
      });

      if (values.length > 0) {
        if (aggregation === 'sum') {
            result = values.reduce((a, b) => a + b, 0);
        } else if (aggregation === 'average') {
            result = values.reduce((a, b) => a + b, 0) / values.length;
        } else if (aggregation === 'max') {
            result = Math.max(...values);
        } else if (aggregation === 'min') {
            result = Math.min(...values);
        }

        min = Math.min(...values);
        max = Math.max(...values);
      }
    }

    // Formatting
    const format = (val: number) => {
        if (compactNumbers) {
            return `${formatLargeNumber(val, valuePrefix)}${valueSuffix}`;
        }
        return `${valuePrefix}${val.toLocaleString('ru-RU', { maximumFractionDigits: 2 })}${valueSuffix}`;
    };

    return {
        displayValue: format(result),
        minValue: format(min),
        maxValue: format(max),
        rawMin: min,
        rawMax: max
    };
};
