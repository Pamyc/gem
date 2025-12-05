
import { COLORS } from './constants';
import { DataByYearMap } from './types';

export const getTooltipFormatter = (
  isDarkMode: boolean,
  sortedYears: string[],
  sortedJKs: string[],
  dataByYear: DataByYearMap,
  textColor: string,
  visibleMetrics: { income: boolean; expense: boolean },
  groupingMode: 'jk' | 'client'
) => {
  return (params: any) => {
    const hoveredGroup = params.seriesName;
    
    // Если навели на фантомную серию или что-то без имени, не показываем
    if (!hoveredGroup || hoveredGroup.includes('Total')) return '';

    // Формируем текст подзаголовка в зависимости от видимости
    let subHeader = '';
    if (visibleMetrics.income && visibleMetrics.expense) {
        subHeader = 'Доходы фактические / Расходы фактические';
    } else if (visibleMetrics.income) {
        subHeader = 'Доходы фактические';
    } else if (visibleMetrics.expense) {
        subHeader = 'Расходы фактические';
    }

    const groupTitle = groupingMode === 'jk' ? 'Жилой Комплекс' : 'Заказчик';

    // --- HEADER ---
    let head = `<thead style="border-bottom: 1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}">
        <tr>
            <th style="padding:10px 15px; text-align:left; color:${isDarkMode ? '#94a3b8' : '#64748b'}; font-size:13px; text-transform:uppercase;">${groupTitle}</th>`;
    
    sortedYears.forEach(y => {
         head += `<th style="text-align:center; padding:10px 15px; border-left:1px solid ${isDarkMode ? '#ffffff10' : '#00000010'}">
            <div style="font-size:16px; font-weight:bold; color:${textColor}">${y}</div>
            ${subHeader ? `<div style="font-size:10px; font-weight:normal; color:${isDarkMode ? '#64748b' : '#94a3b8'}; margin-top:2px;">${subHeader}</div>` : ''}
         </th>`;
    });
    head += `</tr></thead>`;

    // --- BODY ---
    let body = `<tbody>`;
    sortedJKs.forEach((groupName, idx) => {
         const color = COLORS[idx % COLORS.length];
         const isSelected = groupName === hoveredGroup;
         
         // Стили для строки: Подсветка если выбран
         const bgStyle = isSelected 
            ? `background-color: ${isDarkMode ? 'rgba(99, 102, 241, 0.2)' : 'rgba(99, 102, 241, 0.1)'};` 
            : ``;
         
         const textStyle = isSelected
            ? `color: ${isDarkMode ? '#fff' : '#000'}; font-weight:bold;`
            : `color: ${isDarkMode ? '#cbd5e1' : '#475569'};`;

         let rowHtml = `<tr style="${bgStyle}">`;
         
         // Name Cell
         rowHtml += `<td style="padding:8px 15px; text-align:left; ${textStyle} border-bottom: 1px solid ${isDarkMode ? '#ffffff05' : '#00000005'};">
            <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background-color:${color};margin-right:8px;"></span>${groupName}
         </td>`;

         // Year Cells
         sortedYears.forEach(y => {
            const inc = dataByYear.get(y)?.get(groupName)?.income || 0;
            const exp = dataByYear.get(y)?.get(groupName)?.expense || 0;
            
            // Show FULL numbers
            const incStr = inc > 0 ? inc.toLocaleString('ru-RU') : '<span style="color:#aaa; opacity:0.3">-</span>';
            const expStr = exp > 0 ? exp.toLocaleString('ru-RU') : '<span style="color:#aaa; opacity:0.3">-</span>';
            
            // Цвета значений (немного ярче если строка выбрана)
            const incColor = isDarkMode ? '#86efac' : '#16a34a';
            const expColor = isDarkMode ? '#fca5a5' : '#dc2626';

            // Формируем контент ячейки в зависимости от видимости
            let cellContent = '';
            if (visibleMetrics.income && visibleMetrics.expense) {
                cellContent = `<span style="color:${incColor}">${incStr}</span> <span style="opacity:0.3; margin:0 2px;">/</span> <span style="color:${expColor}">${expStr}</span>`;
            } else if (visibleMetrics.income) {
                cellContent = `<span style="color:${incColor}">${incStr}</span>`;
            } else if (visibleMetrics.expense) {
                cellContent = `<span style="color:${expColor}">${expStr}</span>`;
            } else {
                cellContent = `<span style="opacity:0.3">-</span>`;
            }
            
            rowHtml += `<td style="padding:8px 15px; text-align:center; border-left:1px solid ${isDarkMode ? '#ffffff10' : '#00000010'}; font-family:monospace; font-size:13px; border-bottom: 1px solid ${isDarkMode ? '#ffffff05' : '#00000005'}; ${isSelected ? 'font-weight:bold;' : ''}">${cellContent}</td>`;
         });
         
         rowHtml += `</tr>`;
         body += rowHtml;
    });
    body += `</tbody>`;

    return `<div style="max-height:500px; overflow-y:auto; overflow-x:hidden;">
        <table style="border-collapse:collapse; font-size:14px; font-family:sans-serif; min-width:420px;">${head}${body}</table>
    </div>`;
  };
};
