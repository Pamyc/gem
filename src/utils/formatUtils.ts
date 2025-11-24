
export const formatLargeNumber = (value: number | undefined | null, prefix: string = ''): string => {
  if (value === undefined || value === null) return '';
  if (value === 0) return `${prefix}0`;
  
  const abs = Math.abs(value);
  let formatted = '';

  // Helper to truncate without rounding up, matching the user's examples
  // e.g. 1.7245... -> 1.724
  const toFixedTrunc = (num: number, decimals: number) => {
    const factor = Math.pow(10, decimals);
    return (Math.floor(num * factor) / factor).toFixed(decimals);
  };

  if (abs >= 1.0e+9) {
    // Billion
    formatted = toFixedTrunc(abs / 1.0e+9, 3) + 'B';
  } else if (abs >= 1.0e+6) {
    // Million
    formatted = toFixedTrunc(abs / 1.0e+6, 3) + 'M';
  } else if (abs >= 1.0e+3) {
    // Thousand
    formatted = toFixedTrunc(abs / 1.0e+3, 1) + 'k';
  } else {
    // Less than 1000
    formatted = Number(abs.toFixed(2)).toString();
  }

  // Remove trailing zeros (e.g. 1.500M -> 1.5M, 100.000k -> 100k)
  formatted = formatted.replace(/\.?0+([BMk])$/, '$1');

  // Handle negative
  const sign = value < 0 ? '-' : '';
  return `${sign}${prefix}${formatted}`;
};
