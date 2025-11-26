
import React, { useMemo, useState, useEffect } from 'react';
import { X, Table, AlertCircle, Loader2, ListFilter, FileSpreadsheet, Layers } from 'lucide-react';
import { CardConfig } from '../../../../types/card';
import { useDataStore } from '../../../../contexts/DataContext';
import { getMergedHeaders } from '../../../../utils/chartUtils';

interface DetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: CardConfig;
  dataContexts?: Array<{ name: string, config: CardConfig }>;
}

type TabType = 'summary' | 'source';

const DetailsModal: React.FC<DetailsModalProps> = ({ isOpen, onClose, config, dataContexts = [] }) => {
  const { googleSheets, sheetConfigs, isLoading } = useDataStore();
  const [activeTab, setActiveTab] = useState<TabType>('summary');
  const [activeContextIdx, setActiveContextIdx] = useState(0);

  // Reset context when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveContextIdx(0);
      setActiveTab('summary');
    }
  }, [isOpen]);

  // Determine which contexts to use
  const effectiveContexts = useMemo(() => {
    if (dataContexts.length > 0) return dataContexts;
    return [{ name: 'Данные', config }];
  }, [dataContexts, config]);

  // Current Active Config based on selection
  const currentContext = effectiveContexts[activeContextIdx] || effectiveContexts[0];
  const currentConfig = currentContext.config;

  const { headers, rows, filteredRows, summaryData } = useMemo(() => {
    if (!currentConfig.sheetKey || !googleSheets[currentConfig.sheetKey as keyof typeof googleSheets]) {
      return { headers: [], rows: [], filteredRows: [], summaryData: [] };
    }

    const sheetData = googleSheets[currentConfig.sheetKey as keyof typeof googleSheets];
    const sheetConfig = sheetConfigs.find(c => c.key === currentConfig.sheetKey);
    const headerRowsCount = sheetConfig?.headerRows || 1;
    
    if (!sheetData?.headers || !sheetData?.rows) return { headers: [], rows: [], filteredRows: [], summaryData: [] };

    // Get friendly headers
    const mergedHeaders = getMergedHeaders(sheetData.headers, headerRowsCount);
    
    // Perform Filtering
    let resultRows = sheetData.rows;
    if (currentConfig.filters && currentConfig.filters.length > 0) {
        resultRows = sheetData.rows.filter(row => {
            for (const filter of currentConfig.filters) {
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

    // Calculate Summary Data (Group by Data Column)
    let summary: { value: string; count: number }[] = [];
    if (currentConfig.dataColumn) {
        const colIndex = mergedHeaders.indexOf(currentConfig.dataColumn);
        if (colIndex !== -1) {
            const counts = new Map<string, number>();
            resultRows.forEach(row => {
                const rawVal = row[colIndex];
                const val = (rawVal === undefined || rawVal === null) ? '(пусто)' : String(rawVal).trim();
                if (val !== '') {
                    counts.set(val, (counts.get(val) || 0) + 1);
                }
            });
            // Convert to array and sort by count descending
            summary = Array.from(counts.entries())
                .map(([value, count]) => ({ value, count }))
                .sort((a, b) => b.count - a.count);
        }
    }

    return { headers: mergedHeaders, rows: sheetData.rows, filteredRows: resultRows, summaryData: summary };
  }, [currentConfig, googleSheets, sheetConfigs]);

  if (!isOpen) return null;

  const hasDataColumn = !!currentConfig.dataColumn && summaryData.length > 0;

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
        <div className="px-6 pt-6 pb-0 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-[#151923] flex flex-col gap-4">
            
            {/* Top Row: Title & Close */}
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-100 dark:bg-indigo-500/20 rounded-2xl text-indigo-600 dark:text-indigo-400">
                        <Table size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            {config.title}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-1">
                            <span>{filteredRows.length.toLocaleString()} строк найдено из {rows.length.toLocaleString()}</span>
                            {effectiveContexts.length > 1 && (
                                <>
                                    <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600"></span>
                                    <span className="text-indigo-600 dark:text-indigo-400 font-medium">{currentContext.name}</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>
                
                <button 
                    onClick={onClose}
                    className="p-2 bg-gray-100 dark:bg-white/10 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/20 hover:text-gray-900 dark:hover:text-white transition-all"
                >
                    <X size={20} />
                </button>
            </div>

            {/* Data Context Tabs (If multiple) */}
            {effectiveContexts.length > 1 && (
                <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
                    {effectiveContexts.map((ctx, idx) => (
                        <button
                            key={idx}
                            onClick={() => setActiveContextIdx(idx)}
                            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                                activeContextIdx === idx
                                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                                    : 'bg-white dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 border border-gray-200 dark:border-white/5'
                            }`}
                        >
                            {ctx.name}
                        </button>
                    ))}
                </div>
            )}

            {/* View Tabs (Summary/Source) */}
            <div className="flex gap-6 mt-2">
                <button
                    onClick={() => setActiveTab('summary')}
                    disabled={!hasDataColumn}
                    className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${
                        activeTab === 'summary'
                            ? 'text-indigo-600 border-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                            : 'text-gray-500 border-transparent hover:text-gray-700 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed'
                    }`}
                >
                    <ListFilter size={16} />
                    Группировка {hasDataColumn && <span className="bg-gray-100 dark:bg-white/10 px-1.5 py-0.5 rounded text-xs ml-1">{summaryData.length}</span>}
                </button>
                
                <button
                    onClick={() => setActiveTab('source')}
                    className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${
                        activeTab === 'source'
                            ? 'text-indigo-600 border-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                            : 'text-gray-500 border-transparent hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                >
                    <FileSpreadsheet size={16} />
                    Исходные данные
                </button>
            </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden bg-white dark:bg-[#0b0f19] relative">
            {isLoading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-black/50 backdrop-blur-sm z-10">
                    <Loader2 className="animate-spin text-indigo-500" size={32} />
                </div>
            ) : null}

            {!currentConfig.sheetKey ? (
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
                    
                    {/* VIEW: SUMMARY TABLE */}
                    {activeTab === 'summary' && hasDataColumn && (
                        <table className="w-full text-left border-collapse">
                            <thead className="sticky top-0 bg-gray-50 dark:bg-[#1e2433] z-10 shadow-sm">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-white/10 w-full">
                                        Значение ({currentConfig.dataColumn})
                                    </th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-white/10 text-right whitespace-nowrap">
                                        Кол-во строк
                                    </th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-white/10 text-right whitespace-nowrap">
                                        % от выборки
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                {summaryData.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-indigo-50/50 dark:hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-3 text-sm text-gray-800 dark:text-gray-200 font-medium">
                                            {item.value}
                                        </td>
                                        <td className="px-6 py-3 text-sm text-gray-600 dark:text-gray-400 text-right font-mono">
                                            {item.count}
                                        </td>
                                        <td className="px-6 py-3 text-sm text-gray-400 dark:text-gray-500 text-right font-mono">
                                            {((item.count / filteredRows.length) * 100).toFixed(1)}%
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                    {/* VIEW: SOURCE TABLE */}
                    {activeTab === 'source' && (
                        <table className="w-full text-left border-collapse">
                            <thead className="sticky top-0 bg-gray-50 dark:bg-[#1e2433] z-10 shadow-sm">
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
                                            Показаны первые 500 строк из {filteredRows.length}. Полный экспорт недоступен в демо-режиме.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default DetailsModal;
