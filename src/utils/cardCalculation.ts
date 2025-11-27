
import { CardConfig, ElementDataSettings, CardVariable } from '../types/card';
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

// Helper to calculate a single numeric value based on settings
const calculateSingleValue = (
    googleSheets: GoogleSheetsData,
    sheetConfigs: SheetConfig[],
    settings: {
        sheetKey: string;
        dataColumn: string;
        aggregation: string;
        filters: any[];
    }
): { result: number; min: number; max: number } => {
    
    if (!settings.sheetKey || !settings.dataColumn) return { result: 0, min: 0, max: 0 };

    const sheetData = googleSheets[settings.sheetKey as keyof typeof googleSheets];
    if (!sheetData || !sheetData.headers || sheetData.headers.length === 0 || !sheetData.rows) {
       return { result: 0, min: 0, max: 0 };
    }

    const currentSheetConfig = sheetConfigs.find(c => c.key === settings.sheetKey);
    const headerRowsCount = currentSheetConfig?.headerRows || 1;
    const availableColumns = getMergedHeaders(sheetData.headers, headerRowsCount);
    
    const colIndex = availableColumns.indexOf(settings.dataColumn);
    if (colIndex === -1) return { result: 0, min: 0, max: 0 };

    const currentRows = sheetData.rows;

    // Filter Data
    let filteredData = currentRows;
    if (settings.filters && settings.filters.length > 0) {
        filteredData = currentRows.filter(row => {
            for (const filter of settings.filters) {
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
    if (settings.aggregation === 'count') {
      result = filteredData.filter(row => {
          const val = row[colIndex];
          return val !== undefined && val !== null && String(val).trim() !== '';
      }).length;
      min = result; 
      max = result;
    }
    else if (settings.aggregation === 'unique') {
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
        if (settings.aggregation === 'sum') {
            result = values.reduce((a, b) => a + b, 0);
        } else if (settings.aggregation === 'average') {
            result = values.reduce((a, b) => a + b, 0) / values.length;
        } else if (settings.aggregation === 'max') {
            result = Math.max(...values);
        } else if (settings.aggregation === 'min') {
            result = Math.min(...values);
        }

        min = Math.min(...values);
        max = Math.max(...values);
      }
    }

    return { result, min, max };
};

export const calculateCardMetrics = (
    googleSheets: GoogleSheetsData,
    sheetConfigs: SheetConfig[],
    globalConfig: CardConfig,
    elementSettings?: ElementDataSettings
): CalculationResult => {
    
    // Determine effective variables and formula
    // If elementSettings is provided, we prefer its formula/variables if they exist.
    // If not, we fall back to global config (though usually element overrides are exclusive).
    
    const elementVars = elementSettings?.variables;
    const elementFormula = elementSettings?.formula;
    
    // Check if we should use formula mode
    // 1. Element has explicit formula and variables
    const isElementFormula = elementFormula && elementVars && elementVars.length > 0;
    // 2. Global fallback (only if no element settings, or element wants to use global - not implemented yet)
    const isGlobalFormula = !elementSettings && globalConfig.mainFormula && globalConfig.variables && globalConfig.variables.length > 0;

    const shouldUseFormula = isElementFormula || isGlobalFormula;

    const { valuePrefix, valueSuffix, compactNumbers } = globalConfig;
    const format = (val: number) => {
        if (!isFinite(val) || isNaN(val)) return 'Error';
        if (compactNumbers) {
            return `${formatLargeNumber(val, valuePrefix)}${valueSuffix}`;
        }
        // If integer, don't show decimals
        const maximumFractionDigits = Number.isInteger(val) ? 0 : 2;
        return `${valuePrefix}${val.toLocaleString('ru-RU', { maximumFractionDigits })}${valueSuffix}`;
    };

    let finalResult = 0;
    let finalMin = 0;
    let finalMax = 0;

    if (shouldUseFormula) {
        // --- FORMULA MODE ---
        const activeVars = isElementFormula ? elementVars : globalConfig.variables;
        const activeFormulaStr = isElementFormula ? elementFormula : globalConfig.mainFormula;
        
        const variableValues: Record<string, number> = {};

        // Calculate each variable
        activeVars?.forEach(v => {
            const { result } = calculateSingleValue(googleSheets, sheetConfigs, v);
            variableValues[v.name] = result;
        });

        // Parse and Evaluate Formula
        try {
            // Replace {varName} with actual values
            let formulaStr = activeFormulaStr || '';
            for (const [name, val] of Object.entries(variableValues)) {
                // Regex to replace {name} globally
                const regex = new RegExp(`\\{${name}\\}`, 'g');
                formulaStr = formulaStr.replace(regex, String(val));
            }

            // Safety check: ensure only numbers and math operators remain
            // Allow digits, dot, +, -, *, /, (, ), and spaces
            if (!/^[0-9.+\-*/()\s]+$/.test(formulaStr)) {
                 console.warn("Formula contains invalid characters:", formulaStr);
                 finalResult = 0; // Fallback
            } else {
                 // Evaluate safely
                 // eslint-disable-next-line no-new-func
                 finalResult = new Function(`return (${formulaStr})`)();
            }
            
            // Min/Max doesn't make sense for a formula result usually, just use result
            finalMin = finalResult;
            finalMax = finalResult;

        } catch (e) {
            console.error("Error evaluating formula", e);
            finalResult = 0;
        }

    } else {
        // --- STANDARD SINGLE COLUMN MODE ---
        // Determine effective configuration (Element override > Global)
        const sheetKey = elementSettings?.sheetKey || globalConfig.sheetKey;
        const dataColumn = elementSettings?.dataColumn || globalConfig.dataColumn;
        const aggregation = elementSettings?.aggregation || globalConfig.aggregation;
        const filters = elementSettings?.filters || globalConfig.filters;

        const calc = calculateSingleValue(googleSheets, sheetConfigs, {
            sheetKey, dataColumn, aggregation, filters
        });
        
        finalResult = calc.result;
        finalMin = calc.min;
        finalMax = calc.max;
    }

    return {
        displayValue: format(finalResult),
        minValue: format(finalMin),
        maxValue: format(finalMax),
        rawMin: finalMin,
        rawMax: finalMax
    };
};
