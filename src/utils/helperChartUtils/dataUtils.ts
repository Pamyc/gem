
export const detectColumnType = (value: any): 'number' | 'date' | 'string' => {
  if (!value) return 'string';
  const strVal = String(value).trim();

  // Check for number (replace comma with dot just in case of RU locale)
  if (!isNaN(Number(strVal.replace(',', '.'))) && strVal !== '') return 'number';

  // Simple date check (YYYY-MM-DD or DD.MM.YYYY)
  if (strVal.match(/^\d{4}-\d{2}-\d{2}$/) || strVal.match(/^\d{2}\.\d{2}\.\d{4}$/)) return 'date';

  return 'string';
};

export const parseValue = (value: any, type: 'number' | 'date' | 'string') => {
  if (type === 'number') {
    return parseFloat(String(value).replace(',', '.')) || 0;
  }
  return String(value);
};
