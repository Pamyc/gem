import React, { useState, useMemo, useEffect } from 'react';
import { useDataStore } from '../contexts/DataContext';
import { ChartConfig } from '../types/chart';
import ConfigPanel from './helperConstructor/ConfigPanel';
import EChartComponent from '../components/charts/EChartComponent';
import { processChartData } from '../utils/chartUtils';
import { Code, Download, Loader2, BarChart } from 'lucide-react';
import CodeViewerModal from './helperConstructor/CodeViewerModal';

const ConstructorPage: React.FC = () => {
  const { googleSheets, sheetConfigs, isLoading } = useDataStore();
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);

  // Default Config State
  const [config, setConfig] = useState<ChartConfig>({
    title: 'Мой новый график',
    sheetKey: '',
    chartType: 'line',
    xAxisColumn: '',
    yAxisColumn: '',
    segmentColumn: '',
    aggregation: 'sum',
    isCumulative: false,
    showLabels: false,
    filters: []
  });

  // Effect to select first available sheet by default
  useEffect(() => {
    if (!config.sheetKey && sheetConfigs.length > 0) {
      setConfig(prev => ({ ...prev, sheetKey: sheetConfigs[0].key }));
    }
  }, [sheetConfigs, config.sheetKey]);

  // Compute available columns based on selected sheet with multi-level header support
  const { availableColumns, currentRows } = useMemo(() => {
    if (!config.sheetKey) return { availableColumns: [], currentRows: [] };
    
    const sheetData = googleSheets[config.sheetKey as keyof typeof googleSheets];
    if (!sheetData || !sheetData.headers || sheetData.headers.length === 0) return { availableColumns: [], currentRows: [] };
    
    // Find config to know how many header rows to use
    const currentSheetConfig = sheetConfigs.find(c => c.key === config.sheetKey);
    const headerRowsCount = currentSheetConfig?.headerRows || 1;

    // Slice the headers based on config
    const headerRows = sheetData.headers.slice(0, headerRowsCount);
    const rows = sheetData.rows || [];

    if (headerRows.length === 0) return { availableColumns: [], currentRows: rows };

    const colCount = headerRows[0].length;
    const mergedHeaders: string[] = [];

    // Loop through columns and merge headers
    for (let i = 0; i < colCount; i++) {
      const values = headerRows.map(row => row[i]?.toString().trim() || '');
      const nonEmptyValues = values.filter(Boolean);
      
      // Remove duplicates (e.g. if "Income" spans 2 columns, it effectively appears once in the path for that column)
      const uniqueValues = Array.from(new Set(nonEmptyValues));

      let label = '';
      if (uniqueValues.length === 0) {
         label = `Столбец ${i + 1}`;
      } else {
         label = uniqueValues.join(' + ');
      }
      mergedHeaders.push(label);
    }

    return { availableColumns: mergedHeaders, currentRows: rows };
  }, [googleSheets, config.sheetKey, sheetConfigs]);

  // Process Data for Chart
  const chartOptions = useMemo(() => {
    if (!config.sheetKey || !config.xAxisColumn || !config.yAxisColumn) return null;
    
    const sheetData = googleSheets[config.sheetKey as keyof typeof googleSheets];
    if (!sheetData) return null;

    const isDark = document.documentElement.classList.contains('dark');
    
    return processChartData(
      sheetData.rows, 
      availableColumns, 
      config, 
      isDark
    );
  }, [googleSheets, config, availableColumns]); // Re-calc when config changes

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
      <div className="w-full md:w-80 bg-white dark:bg-[#151923] rounded-3xl shadow-sm border border-gray-200 dark:border-white/5 p-6 flex flex-col shrink-0 transition-colors">
        <div className="mb-4 border-b border-gray-100 dark:border-white/5 pb-4">
          <input 
            type="text" 
            value={config.title}
            onChange={(e) => setConfig({...config, title: e.target.value})}
            className="w-full bg-transparent font-bold text-lg text-gray-800 dark:text-white outline-none placeholder-gray-400"
            placeholder="Название графика"
          />
        </div>
        
        <ConfigPanel 
          config={config} 
          setConfig={setConfig} 
          sheetConfigs={sheetConfigs}
          availableColumns={availableColumns}
          rows={currentRows}
        />

        <div className="pt-4 mt-auto border-t border-gray-100 dark:border-white/5">
           <button 
            onClick={() => setIsCodeModalOpen(true)}
            className="w-full py-3 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 font-bold flex items-center justify-center gap-2 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors"
           >
             <Code size={18} /> Получить код
           </button>
        </div>
      </div>

      {/* Right Pane: Preview */}
      <div className="flex-1 bg-white dark:bg-[#151923] rounded-3xl shadow-sm border border-gray-200 dark:border-white/5 p-6 flex flex-col relative transition-colors overflow-hidden">
        <h3 className="text-xs font-bold uppercase text-gray-400 mb-4 tracking-wider">Предпросмотр</h3>
        
        <div className="flex-1 w-full h-full min-h-[300px] flex items-center justify-center">
          {chartOptions ? (
             <EChartComponent 
                options={chartOptions} 
                height="100%" 
                theme={document.documentElement.classList.contains('dark') ? 'dark' : 'light'} 
             />
          ) : (
            <div className="text-center text-gray-400">
               <BarChart size={48} className="mx-auto mb-2 opacity-20" />
               <p>Выберите источник данных, ось X и ось Y <br/> чтобы построить график</p>
            </div>
          )}
        </div>
      </div>

      <CodeViewerModal 
        isOpen={isCodeModalOpen} 
        onClose={() => setIsCodeModalOpen(false)} 
        config={config}
      />
    </div>
  );
};

export default ConstructorPage;