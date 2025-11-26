
import React, { useMemo } from 'react';
import { X, Table, AlertCircle, Loader2 } from 'lucide-react';
import { CardConfig } from '../../../../types/card';
import { useDataStore } from '../../../../contexts/DataContext';
import { getMergedHeaders } from '../../../../utils/chartUtils';

interface DetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: CardConfig;
}

const DetailsModal: React.FC<DetailsModalProps> = ({ isOpen, onClose, config }) => {
  const { googleSheets, sheetConfigs, isLoading } = useDataStore();

  const { headers, rows, filteredRows } = useMemo(() => {
    if (!config.sheetKey || !googleSheets[config.sheetKey as keyof typeof googleSheets]) {
      return { headers: [], rows: [], filteredRows: [] };
    }

    const sheetData = googleSheets[config.sheetKey as keyof typeof googleSheets];
    const sheetConfig = sheetConfigs.find(c => c.key === config.sheetKey);
    const headerRowsCount = sheetConfig?.headerRows || 1;
    
    if (!sheetData?.headers || !sheetData?.rows) return { headers: [], rows: [], filteredRows: [] };

    // Get friendly headers
    const mergedHeaders = getMergedHeaders(sheetData.headers, headerRowsCount);
    
    // Perform Filtering
    let resultRows = sheetData.rows;
    if (config.filters && config.filters.length > 0) {
        resultRows = sheetData.rows.filter(row => {
            for (const filter of config.filters) {
                const fColIdx = mergedHeaders.indexOf(filter.column);
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

    return { headers: mergedHeaders, rows: sheetData.rows, filteredRows: resultRows };
  }, [config.sheetKey, config.filters, googleSheets, sheetConfigs]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-[#151923] w-full max-w-6xl h-[85vh] rounded-3xl shadow-2xl border border-gray-200 dark:border-white/10 flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between bg-gray-50/50 dark:bg-[#151923]">
            <div className="flex items-center gap-4">
                <div className="p-2.5 bg-indigo-100 dark:bg-indigo-500/20 rounded-xl text-indigo-600 dark:text-indigo-400">
                    <Table size={24} />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        Детализация: {config.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                        {filteredRows.length.toLocaleString()} строк найдено из {rows.length.toLocaleString()}
                    </p>
                </div>
            </div>
            
            <button 
                onClick={onClose}
                className="p-2.5 bg-gray-100 dark:bg-white/10 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/20 hover:text-gray-900 dark:hover:text-white transition-all"
            >
                <X size={24} />
            </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden bg-white dark:bg-[#0b0f19] relative">
            {isLoading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-black/50 backdrop-blur-sm z-10">
                    <Loader2 className="animate-spin text-indigo-500" size={32} />
                </div>
            ) : null}

            {!config.sheetKey ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                    <AlertCircle size={48} className="mb-2 opacity-20" />
                    <p>Источник данных не выбран</p>
                </div>
            ) : filteredRows.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                    <Table size={48} className="mb-2 opacity-20" />
                    <p>Нет данных по заданным фильтрам</p>
                </div>
            ) : (
                <div className="h-full overflow-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 bg-gray-100 dark:bg-[#1e2433] z-10 shadow-sm">
                            <tr>
                                {headers.map((h, i) => (
                                    <th key={i} className="px-4 py-3 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-white/10 whitespace-nowrap">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                            {filteredRows.slice(0, 500).map((row, rIdx) => (
                                <tr key={rIdx} className="hover:bg-indigo-50/50 dark:hover:bg-white/5 transition-colors">
                                    {row.map((cell: any, cIdx: number) => (
                                        <td key={cIdx} className="px-4 py-2.5 text-xs text-gray-700 dark:text-gray-300 whitespace-nowrap max-w-[300px] truncate border-r border-transparent last:border-0 hover:border-gray-200 dark:hover:border-white/5">
                                            {String(cell)}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                            {filteredRows.length > 500 && (
                                <tr>
                                    <td colSpan={headers.length} className="px-4 py-4 text-center text-xs text-gray-400 bg-gray-50 dark:bg-white/5 font-medium italic">
                                        Показаны первые 500 строк из {filteredRows.length}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default DetailsModal;
