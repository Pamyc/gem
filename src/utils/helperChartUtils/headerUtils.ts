
/**
 * Helper to merge multi-level headers into a single array of strings
 */
export const getMergedHeaders = (headers: any[][], headerRowsCount: number): string[] => {
  if (!headers || headers.length === 0) return [];
  
  const rowsToProcess = headers.slice(0, headerRowsCount);
  if (rowsToProcess.length === 0) return [];

  const colCount = rowsToProcess[0].length;
  const mergedHeaders: string[] = [];

  for (let i = 0; i < colCount; i++) {
    const values = rowsToProcess.map(row => row[i]?.toString().trim() || '');
    const nonEmptyValues = values.filter(Boolean);
    const uniqueValues = Array.from(new Set(nonEmptyValues));

    let label = '';
    if (uniqueValues.length === 0) {
       label = `Столбец ${i + 1}`;
    } else {
       label = uniqueValues.join(' + ');
    }
    mergedHeaders.push(label);
  }
  return mergedHeaders;
};
