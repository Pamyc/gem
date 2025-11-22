import React, { useState, useMemo, useEffect } from 'react';
import { useDataStore } from '../contexts/DataContext';
import { ChartConfig } from '../types/chart';
import { useProcessedChartData } from '../hooks/useProcessedChartData';
import { getMergedHeaders } from '../utils/chartUtils';
import { Loader2, Filter, FileJson, Table as TableIcon, Calculator } from 'lucide-react';
import DataConfigPanel from './helperFilterTest/DataConfigPanel';

interface FilterTestPageProps {
  isDarkMode: boolean;
}

const FilterTestPage: React.FC<FilterTestPageProps> = ({ isDarkMode }) => {
  const { googleSheets, sheetConfigs, isLoading: isStoreLoading } = useDataStore();

  // Tab state for result view
  const [viewMode, setViewMode] = useState<'table' | 'json'>('table');

  // Configuration State
  const [config, setConfig] = useState<ChartConfig>({
    title: 'Data Explorer',
    sheetKey: '',
    chartType: 'bar', // Not used for data logic, but required by type
    xAxisColumn: '', // Group Key
    yAxisColumn: '', // Value Column
    segmentColumn: '',
    aggregation: 'count',
    isCumulative: false,
    showLabels: true,
    showDataZoomSlider: false,
    showLegend: false,
    filters: []
  });

  // Select first sheet by default
  useEffect(() => {
    if (!config.sheetKey && sheetConfigs.length > 0) {
      setConfig(prev => ({ ...prev, sheetKey: sheetConfigs[0].key }));
    }
  }, [sheetConfigs, config.sheetKey]);

  // Get Available Columns (Same logic as Constructor)
  const { availableColumns, currentRows } = useMemo(() => {
    if (!config.sheetKey) return { availableColumns: [], currentRows: [] };

    const sheetData = googleSheets[config.sheetKey as keyof typeof googleSheets];
    if (!sheetData || !sheetData.headers || sheetData.headers.length === 0) return { availableColumns: [], currentRows: [] };

    const currentSheetConfig = sheetConfigs.find(c => c.key === config.sheetKey);
    const headerRowsCount = currentSheetConfig?.headerRows || 1;

    const mergedHeaders = getMergedHeaders(sheetData.headers, headerRowsCount);
    const rows = sheetData.rows || [];

    return { availableColumns: mergedHeaders, currentRows: rows };
  }, [googleSheets, config.sheetKey, sheetConfigs]);

  // Get Processed Data using the Hook
  const { data, isLoading: isProcessing } = useProcessedChartData(config);

  // Total Calculation
  const totalValue = useMemo(() => {
    return data.reduce((acc, item) => acc + item.value, 0);
  }, [data]);

  if (isStoreLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="animate-spin text-indigo-500" size={32} />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col md:flex-row gap-6">

      {/* Left Pane: Settings */}
      <div className="w-full md:w-80 bg-white dark:bg-[#151923] rounded-3xl shadow-sm border border-gray-200 dark:border-white/5 p-6 flex flex-col shrink-0 transition-colors overflow-hidden">
        <div className="mb-4 border-b border-gray-100 dark:border-white/5 pb-4">
          <h2 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <Filter size={20} className="text-indigo-500" />
            Тест Фильтров
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Настройте параметры запроса для проверки работы хука <code className="font-mono bg-gray-100 dark:bg-white/10 px-1 rounded">useProcessedChartData</code>
          </p>
        </div>

        <DataConfigPanel
          config={config}
          setConfig={setConfig}
          sheetConfigs={sheetConfigs}
          availableColumns={availableColumns}
          rows={currentRows}
        />
      </div>

      {/* Right Pane: Output */}
      <div className="flex-1 bg-white dark:bg-[#151923] rounded-3xl shadow-sm border border-gray-200 dark:border-white/5 p-6 flex flex-col relative transition-colors overflow-hidden">

        {/* Output Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <h3 className="text-xs font-bold uppercase text-gray-400 tracking-wider">Результат запроса</h3>

            <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-lg">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-md transition-colors ${viewMode === 'table' ? 'bg-white dark:bg-[#1e2433] text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                title="Таблица"
              >
                <TableIcon size={16} />
              </button>
              <button
                onClick={() => setViewMode('json')}
                className={`p-1.5 rounded-md transition-colors ${viewMode === 'json' ? 'bg-white dark:bg-[#1e2433] text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                title="JSON"
              >
                <FileJson size={16} />
              </button>
            </div>
          </div>

          {/* Summary Badge */}
          <div className="flex items-center gap-4">
            <div className="px-4 py-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl border border-emerald-100 dark:border-emerald-500/20 flex items-center gap-2">
              <Calculator size={16} className="text-emerald-600 dark:text-emerald-400" />
              <div>
                <span className="text-xs text-gray-500 dark:text-gray-400 mr-2">Итого:</span>
                <span className="font-bold text-gray-900 dark:text-white font-mono">{totalValue.toLocaleString('ru-RU')}</span>
              </div>
            </div>
            <div className="text-xs text-gray-400 font-mono">
              Rows: {data.length}
            </div>
          </div>
        </div>

        {/* Output Content */}
        <div className="flex-1 overflow-hidden bg-gray-50 dark:bg-[#0b0f19] rounded-2xl border border-gray-200 dark:border-white/10 relative">
          {isProcessing ? (
            <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-black/50 backdrop-blur-sm z-10">
              <Loader2 className="animate-spin text-indigo-500" size={32} />
            </div>
          ) : null}

          {data.length === 0 && !isProcessing ? (
            <div className="flex items-center justify-center h-full text-gray-400 flex-col gap-2">
              <Filter size={32} className="opacity-20" />
              <p>Нет данных или ничего не найдено по заданным фильтрам</p>
            </div>
          ) : (
            <div className="h-full overflow-auto custom-scrollbar p-4">
              {viewMode === 'table' ? (
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 bg-gray-100 dark:bg-[#1e2433] z-10">
                    <tr>
                      <th className="px-4 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider rounded-tl-lg">
                        {config.xAxisColumn || 'Группа'} (Name)
                      </th>
                      <th className="px-4 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right rounded-tr-lg">
                        {config.yAxisColumn || 'Значение'} (Value)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-white/5">
                    {data.map((item, idx) => (
                      <tr key={idx} className="hover:bg-white dark:hover:bg-white/5 transition-colors">
                        <td className="px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 font-medium">
                          {item.name}
                        </td>
                        <td className="px-4 py-2.5 text-sm text-gray-900 dark:text-white font-mono text-right">
                          {item.value.toLocaleString('ru-RU')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <pre className="font-mono text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {JSON.stringify(data, null, 2)}
                </pre>
              )}
            </div>
          )}
        </div>

        {/* Code Snippet Tip */}
        <div className="mt-4 p-3 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 flex items-start gap-3">
          <div className="p-1.5 bg-indigo-100 dark:bg-indigo-500/20 rounded text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5">
            <FileJson size={14} />
          </div>
          <div className="flex-1">
            <p className="text-xs font-bold text-gray-700 dark:text-gray-200 mb-1">Как использовать в коде:</p>
            <code className="block text-[10px] font-mono text-indigo-600 dark:text-indigo-300 bg-white dark:bg-black/20 p-2 rounded border border-indigo-100 dark:border-indigo-500/20 overflow-x-auto whitespace-pre">
              {`const config = useMemo(() => ({ 
  sheetKey: '${config.sheetKey}', 
  xAxisColumn: '${config.xAxisColumn}', 
  yAxisColumn: '${config.yAxisColumn}', 
  aggregation: '${config.aggregation}',
  filters: ${JSON.stringify(config.filters, null, 2).replace(/\n/g, '\n  ')} 
}), []);

const { data } = useProcessedChartData(config);`}
            </code>
          </div>
        </div>

      </div>
    </div>
  );
};

export default FilterTestPage;