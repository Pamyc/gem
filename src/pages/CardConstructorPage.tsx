import React, { useState, useMemo, useEffect } from 'react';
import { Code, LayoutTemplate, Loader2, BarChart } from 'lucide-react';
import CardConfigPanel from './helperCardConstructor/CardConfigPanel';
import DynamicCard from '../components/cards/DynamicCard';
import CardCodeModal from './helperCardConstructor/CardCodeModal';
import { useDataStore } from '../contexts/DataContext';
import { getMergedHeaders } from '../utils/chartUtils';
import { CardConfig } from '../types/card';

interface CardConstructorPageProps {
  isDarkMode: boolean;
}

const CardConstructorPage: React.FC<CardConstructorPageProps> = ({ isDarkMode }) => {
  const { googleSheets, sheetConfigs, isLoading } = useDataStore();
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);

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

      {/* Right Pane: Preview */}
      <div className="flex-1 bg-white dark:bg-[#151923] rounded-3xl shadow-sm border border-gray-200 dark:border-white/5 p-6 flex flex-col relative transition-colors overflow-hidden">
        <div className="flex justify-between items-center mb-6">
             <h3 className="text-xs font-bold uppercase text-gray-400 tracking-wider">Предпросмотр</h3>
             <span className="text-xs font-mono text-gray-500 dark:text-gray-500">
                 Live DynamicCard
             </span>
        </div>
        
        <div className="flex-1 w-full h-full min-h-[300px] flex items-center justify-center bg-gray-50 dark:bg-[#0b0f19] rounded-2xl border border-dashed border-gray-200 dark:border-white/10 p-8 overflow-auto">
           {/* Wrapper with max-width to ensure the card looks like a card and not a banner */}
           <div className="w-full max-w-md flex items-center justify-center">
              {config.sheetKey && config.dataColumn ? (
                  <DynamicCard config={config} />
              ) : (
                  <div className="text-center text-gray-400 py-12">
                    <BarChart size={48} className="mx-auto mb-2 opacity-20" />
                    <p>Выберите данные в настройках,<br/>чтобы увидеть результат</p>
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