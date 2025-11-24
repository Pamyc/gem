import React, { useState, useMemo, useEffect } from 'react';
import { Code, LayoutTemplate, Loader2, BarChart, Table as TableIcon, FileJson, Calculator, ChevronDown } from 'lucide-react';
import CardConfigPanel from './helperCardConstructor/CardConfigPanel';
import DynamicCard from '../components/cards/DynamicCard';
import CardCodeModal from './helperCardConstructor/CardCodeModal';
import { useDataStore } from '../contexts/DataContext';
import { getMergedHeaders } from '../utils/chartUtils';
import { CardConfig } from '../types/card';
import { useProcessedChartData } from '../hooks/useProcessedChartData';
import { ChartConfig } from '../types/chart';

interface CardConstructorPageProps {
  isDarkMode: boolean;
}

const CardConstructorPage: React.FC<CardConstructorPageProps> = ({ isDarkMode }) => {
  const { googleSheets, sheetConfigs, isLoading } = useDataStore();
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);

  // Debug Table State
  const [debugGroupBy, setDebugGroupBy] = useState<string>('');
  const [viewMode, setViewMode] = useState<'table' | 'json'>('table');

  // Default Configuration
  const [config, setConfig] = useState<CardConfig>({
    template: 'classic',
    title: 'Мой показатель',
    
    // Data defaults
    sheetKey: '',
    dataColumn: '',
    aggregation: 'sum',
    filters: [],

    valuePrefix: '',
    valueSuffix: '',

    icon: 'Users',
    showIcon: true,
    showTrend: false,
    trendValue: '0%',
    trendDirection: 'neutral',
    
    // Size
    width: '100%',
    height: 'auto',

    colorTheme: 'blue', 
    gradientFrom: 'purple',
    gradientTo: 'blue',
  });

  // Set default sheet
  useEffect(() => {
    if (!config.sheetKey && sheetConfigs.length > 0) {
      setConfig(prev => ({ ...prev, sheetKey: sheetConfigs[0].key }));
    }
  }, [sheetConfigs, config.sheetKey]);

  // Get Available Columns for Settings Panel
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

  // Set default group by for debug
  useEffect(() => {
    if (!debugGroupBy && availableColumns.length > 0) {
      setDebugGroupBy(availableColumns[0]);
    }
  }, [availableColumns, debugGroupBy]);

  // Data processing for Debug Table
  const debugChartConfig = useMemo<Partial<ChartConfig>>(() => ({
    sheetKey: config.sheetKey,
    xAxisColumn: debugGroupBy, // Group by this column
    yAxisColumn: config.dataColumn, // Value column
    aggregation: config.aggregation === 'unique' ? 'count' : config.aggregation as any, // Map unique to count for visual table if needed, or stick to what hook supports
    filters: config.filters
  }), [config, debugGroupBy]);

  const { data: debugData, isLoading: isDebugLoading } = useProcessedChartData(debugChartConfig);

  const totalValue = useMemo(() => {
     return debugData.reduce((acc, item) => acc + item.value, 0);
  }, [debugData]);


  if (isLoading) {
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
              <LayoutTemplate size={20} className="text-indigo-500" />
              Конструктор Карточек
           </h2>
        </div>
        
        <CardConfigPanel 
          config={config} 
          setConfig={setConfig}
          sheetConfigs={sheetConfigs}
          availableColumns={availableColumns}
          rows={currentRows}
        />

        <div className="pt-4 mt-auto border-t border-gray-100 dark:border-white/5">
           <button 
            onClick={() => setIsCodeModalOpen(true)}
            className="w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 cursor-pointer"
           >
             <Code size={18} /> Получить код
           </button>
        </div>
      </div>

      {/* Right Pane: Split View (Preview + Debug) */}
      <div className="flex-1 flex flex-col gap-6 overflow-hidden">
        
        {/* Top: Card Preview */}
        <div className="bg-white dark:bg-[#151923] rounded-3xl shadow-sm border border-gray-200 dark:border-white/5 p-6 flex flex-col relative transition-colors shrink-0 max-h-[50%]">
          <div className="flex justify-between items-center mb-6">
               <h3 className="text-xs font-bold uppercase text-gray-400 tracking-wider">Предпросмотр</h3>
               <span className="text-xs font-mono text-gray-500 dark:text-gray-500">
                   Live DynamicCard
               </span>
          </div>
          
          <div className="flex-1 w-full min-h-[200px] flex items-center justify-center bg-gray-50 dark:bg-[#0b0f19] rounded-2xl border border-dashed border-gray-200 dark:border-white/10 p-8 overflow-auto custom-scrollbar">
             {/* Wrapper with max-width to ensure the card looks like a card and not a banner */}
             <div className="w-full max-w-md flex items-center justify-center">
                {config.sheetKey && config.dataColumn ? (
                    <DynamicCard config={config} />
                ) : (
                    <div className="text-center text-gray-400 py-6">
                      <BarChart size={48} className="mx-auto mb-2 opacity-20" />
                      <p>Выберите данные в настройках,<br/>чтобы увидеть результат</p>
                    </div>
                )}
             </div>
          </div>
        </div>

        {/* Bottom: Data Debugger */}
        <div className="flex-1 bg-white dark:bg-[#151923] rounded-3xl shadow-sm border border-gray-200 dark:border-white/5 p-6 flex flex-col relative transition-colors overflow-hidden">
           
           {/* Debug Header */}
           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
              <div className="flex items-center gap-3">
                 <h3 className="text-xs font-bold uppercase text-gray-400 tracking-wider">Результат запроса</h3>
                 
                 {/* Group By Selector */}
                 <div className="relative">
                    <select
                      value={debugGroupBy}
                      onChange={(e) => setDebugGroupBy(e.target.value)}
                      className="pl-3 pr-8 py-1.5 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs font-medium text-gray-700 dark:text-gray-300 appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer hover:bg-gray-100 dark:hover:bg-white/10"
                    >
                      {availableColumns.map(col => (
                        <option key={col} value={col}>Группировка: {col}</option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                 </div>
              </div>

              <div className="flex items-center gap-3">
                  {/* View Toggles */}
                  <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-lg">
                    <button
                      onClick={() => setViewMode('table')}
                      className={`p-1.5 rounded-md transition-colors ${viewMode === 'table' ? 'bg-white dark:bg-[#1e2433] text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                      title="Таблица"
                    >
                      <TableIcon size={14} />
                    </button>
                    <button
                      onClick={() => setViewMode('json')}
                      className={`p-1.5 rounded-md transition-colors ${viewMode === 'json' ? 'bg-white dark:bg-[#1e2433] text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                      title="JSON"
                    >
                      <FileJson size={14} />
                    </button>
                  </div>
                  
                  {/* Total */}
                  <div className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg border border-emerald-100 dark:border-emerald-500/20 flex items-center gap-2">
                    <Calculator size={14} className="text-emerald-600 dark:text-emerald-400" />
                    <span className="text-xs font-bold text-gray-900 dark:text-white font-mono">
                      {totalValue.toLocaleString('ru-RU')}
                    </span>
                  </div>
              </div>
           </div>

           {/* Debug Content */}
           <div className="flex-1 overflow-hidden bg-gray-50 dark:bg-[#0b0f19] rounded-2xl border border-gray-200 dark:border-white/10 relative">
              {isDebugLoading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-black/50 backdrop-blur-sm z-10">
                  <Loader2 className="animate-spin text-indigo-500" size={24} />
                </div>
              ) : null}

              {debugData.length === 0 && !isDebugLoading ? (
                <div className="flex items-center justify-center h-full text-gray-400 flex-col gap-2">
                  <p className="text-xs">Нет данных</p>
                </div>
              ) : (
                <div className="h-full overflow-auto custom-scrollbar p-0">
                  {viewMode === 'table' ? (
                    <table className="w-full text-left border-collapse">
                      <thead className="sticky top-0 bg-gray-100 dark:bg-[#1e2433] z-10 shadow-sm">
                        <tr>
                          <th className="px-4 py-2 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            {debugGroupBy} (Group)
                          </th>
                          <th className="px-4 py-2 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">
                            {config.dataColumn} ({config.aggregation})
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-white/5">
                        {debugData.map((item, idx) => (
                          <tr key={idx} className="hover:bg-white dark:hover:bg-white/5 transition-colors">
                            <td className="px-4 py-2 text-xs text-gray-700 dark:text-gray-300 font-medium truncate max-w-[200px]" title={item.name}>
                              {item.name}
                            </td>
                            <td className="px-4 py-2 text-xs text-gray-900 dark:text-white font-mono text-right">
                              {item.value.toLocaleString('ru-RU', { maximumFractionDigits: 2 })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <pre className="p-4 font-mono text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {JSON.stringify(debugData, null, 2)}
                    </pre>
                  )}
                </div>
              )}
           </div>

        </div>

      </div>

      <CardCodeModal 
        isOpen={isCodeModalOpen} 
        onClose={() => setIsCodeModalOpen(false)} 
        config={config}
      />
    </div>
  );
};

export default CardConstructorPage;