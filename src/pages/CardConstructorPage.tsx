
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Code, LayoutTemplate, Loader2, Table as TableIcon, FileJson, Calculator, ChevronDown, MousePointer2, Plus, ArrowLeft } from 'lucide-react';
import CardConfigPanel from './helperCardConstructor/CardConfigPanel';
import ElementConfigPanel from './helperCardConstructor/ElementConfigPanel';
import DraggableElement from './helperCardConstructor/DraggableElement';
import CardCodeModal from './helperCardConstructor/CardCodeModal';
import { useDataStore } from '../contexts/DataContext';
import { getMergedHeaders } from '../utils/chartUtils';
import { CardConfig, CardElement } from '../types/card';
import { useProcessedChartData } from '../hooks/useProcessedChartData';
import { ChartConfig } from '../types/chart';
import { getPresetLayout } from '../utils/cardPresets';
import { formatLargeNumber } from '../utils/formatUtils';
import { CalculationResult } from '../components/cards/DynamicCard';

interface CardConstructorPageProps {
  isDarkMode: boolean;
}

const CardConstructorPage: React.FC<CardConstructorPageProps> = ({ isDarkMode }) => {
  const { googleSheets, sheetConfigs, isLoading } = useDataStore();
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);

  // Editor State
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debug Table State
  const [debugGroupBy, setDebugGroupBy] = useState<string>('');
  const [viewMode, setViewMode] = useState<'table' | 'json'>('table');

  // Default Configuration
  const [config, setConfig] = useState<CardConfig>({
    template: 'custom', // Always start in custom/editor mode
    title: 'Мой показатель',
    
    // Data defaults
    sheetKey: '',
    dataColumn: '',
    aggregation: 'sum',
    filters: [],

    valuePrefix: '',
    valueSuffix: '',
    compactNumbers: false,

    icon: 'Users',
    showIcon: true,
    showTrend: false,
    trendValue: '0%',
    trendDirection: 'neutral',
    
    // Size (Fixed defaults to avoid stretching)
    width: '350px',
    height: '200px',

    colorTheme: 'blue', 
    gradientFrom: '',
    gradientTo: '',

    elements: [] 
  });

  // Init default elements from Classic preset if empty
  useEffect(() => {
    if (config.elements.length === 0) {
       const preset = getPresetLayout('classic');
       if (preset.elements) {
           setConfig(prev => ({
             ...prev,
             ...preset,
             sheetKey: prev.sheetKey // Preserve sheet key if set
           }));
       }
    }
  }, []);

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
    xAxisColumn: debugGroupBy,
    yAxisColumn: config.dataColumn,
    aggregation: config.aggregation === 'unique' ? 'count' : config.aggregation as any,
    filters: config.filters
  }), [config, debugGroupBy]);

  const { data: debugData, isLoading: isDebugLoading } = useProcessedChartData(debugChartConfig);

  const totalValue = useMemo(() => {
     return debugData.reduce((acc, item) => acc + item.value, 0);
  }, [debugData]);

  // Calculate Single Value for the Card Editor Preview
  const previewData: CalculationResult = useMemo(() => {
     let val = 0;
     
     if (config.aggregation === 'count' || config.aggregation === 'unique') {
        val = totalValue;
     } else {
        if (config.aggregation === 'min') {
           val = debugData.length > 0 ? Math.min(...debugData.map(d => d.value)) : 0;
        } else if (config.aggregation === 'max') {
           val = debugData.length > 0 ? Math.max(...debugData.map(d => d.value)) : 0;
        } else if (config.aggregation === 'average') {
           val = debugData.length > 0 ? debugData.reduce((a,b) => a + b.value, 0) / debugData.length : 0;
        } else {
           val = totalValue; // Sum
        }
     }
     
     const format = (v: number) => {
        if (config.compactNumbers) {
           return formatLargeNumber(v, config.valuePrefix) + config.valueSuffix;
        }
        return `${config.valuePrefix}${v.toLocaleString('ru-RU', { maximumFractionDigits: 2 })}${config.valueSuffix}`;
     }

     return {
        displayValue: format(val),
        minValue: format(0), // Placeholder logic
        maxValue: format(val * 1.5), // Placeholder logic
        rawMin: 0,
        rawMax: val * 1.5
     };
  }, [debugData, config, totalValue]);

  // Element Actions
  const handleElementUpdate = (id: string, updates: Partial<CardElement> | Partial<CardElement['style']>) => {
    setConfig(prev => ({
      ...prev,
      elements: prev.elements.map(el => {
        if (el.id !== id) return el;
        // Check if updates are style properties
        const styleKeys = ['top', 'left', 'fontSize', 'color', 'zIndex', 'width', 'height', 'fontWeight', 'backgroundColor', 'borderRadius', 'padding', 'opacity', 'textAlign'];
        const isStyleUpdate = Object.keys(updates).some(key => styleKeys.includes(key));
        
        if (isStyleUpdate) {
            return { ...el, style: { ...el.style, ...updates } };
        }
        return { ...el, ...updates };
      })
    }));
  };

  const handleElementDelete = (id: string) => {
    setConfig(prev => ({
      ...prev,
      elements: prev.elements.filter(el => el.id !== id)
    }));
    if (selectedElementId === id) setSelectedElementId(null);
  };

  const handleAddElement = (type: CardElement['type']) => {
      const newElement: CardElement = {
          id: Math.random().toString(36).substr(2, 9),
          type,
          style: {
              top: 50,
              left: 50,
              fontSize: 14,
              color: '#000000',
              zIndex: 10,
              width: 'auto',
              height: 'auto'
          },
          content: type === 'text' ? 'Новый текст' : undefined
      };
      
      // Default styles per type
      if (type === 'value') {
          newElement.style.fontSize = 24;
          newElement.style.fontWeight = 'bold';
      } else if (type === 'icon') {
          newElement.style.fontSize = 24;
          newElement.style.color = '#6366f1';
      } else if (type === 'shape') {
          newElement.style.width = 100;
          newElement.style.height = 100;
          newElement.style.backgroundColor = '#e5e7eb';
          newElement.style.borderRadius = 8;
      }

      setConfig(prev => ({
          ...prev,
          elements: [...prev.elements, newElement]
      }));
      setSelectedElementId(newElement.id);
  };

  const selectedElement = useMemo(() => 
    config.elements.find(el => el.id === selectedElementId), 
  [config.elements, selectedElementId]);

  // --- KEYBOARD SHORTCUTS ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'SELECT' || target.tagName === 'TEXTAREA') {
        return;
      }

      if (!selectedElementId) return;

      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        handleElementDelete(selectedElementId);
        return;
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        setSelectedElementId(null);
        return;
      }

      // Nudging with arrows
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        const el = config.elements.find(el => el.id === selectedElementId);
        if (!el) return;

        let { top, left } = el.style;
        const step = e.shiftKey ? 10 : 1;

        if (e.key === 'ArrowUp') top -= step;
        if (e.key === 'ArrowDown') top += step;
        if (e.key === 'ArrowLeft') left -= step;
        if (e.key === 'ArrowRight') left += step;

        handleElementUpdate(selectedElementId, { top, left });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElementId, config.elements]);

  const getColor = (c: string) => {
     const map: any = { blue: '#3b82f6', violet: '#8b5cf6', pink: '#ec4899', orange: '#f97316', emerald: '#10b981', red: '#ef4444', cyan: '#06b6d4', slate: '#64748b', fuchsia: '#d946ef', amber: '#f59e0b', teal: '#14b8a6', purple: '#a855f7' };
     return map[c] || c || '#3b82f6';
  };

  // Determine Editor Background
  let editorBackground = config.backgroundColor || '#ffffff';
  if (config.gradientFrom && config.gradientTo && !config.backgroundColor) {
      editorBackground = `linear-gradient(135deg, ${getColor(config.gradientFrom)}, ${getColor(config.gradientTo)})`;
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col md:flex-row gap-6">
      
      {/* LEFT PANE: CONFIG */}
      <div className="w-full md:w-80 bg-white dark:bg-[#151923] rounded-3xl shadow-sm border border-gray-200 dark:border-white/5 p-6 flex flex-col shrink-0 transition-colors overflow-hidden relative">
        
        {selectedElement ? (
           <div className="flex flex-col h-full animate-in fade-in slide-in-from-left-4 duration-200">
               <button 
                  onClick={() => setSelectedElementId(null)}
                  className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-indigo-500 mb-4 transition-colors"
               >
                   <ArrowLeft size={16} /> Назад к общим
               </button>
               <ElementConfigPanel 
                  element={selectedElement}
                  onUpdate={(updates) => handleElementUpdate(selectedElement.id, updates)}
                  onDelete={() => handleElementDelete(selectedElement.id)}
                  googleSheets={googleSheets}
                  sheetConfigs={sheetConfigs}
                  globalSheetKey={config.sheetKey}
               />
           </div>
        ) : (
           <CardConfigPanel 
             config={config} 
             setConfig={setConfig} 
             sheetConfigs={sheetConfigs}
             availableColumns={availableColumns}
             rows={currentRows}
           />
        )}
      </div>

      {/* MIDDLE PANE: EDITOR */}
      <div className="flex-1 flex flex-col gap-6 min-w-0">
         
         {/* Editor Canvas Area */}
         <div className="flex-1 bg-white dark:bg-[#151923] rounded-3xl shadow-sm border border-gray-200 dark:border-white/5 p-6 flex flex-col relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase text-gray-400 tracking-wider">Интерактивный редактор</span>
                    <span className="bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1">
                        <MousePointer2 size={10} /> Drag & Resize
                    </span>
                </div>
                <div className="flex gap-2">
                   <button onClick={() => handleAddElement('text')} className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg text-gray-500" title="Добавить текст"><Plus size={16} /></button>
                   <button onClick={() => handleAddElement('value')} className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg text-gray-500" title="Добавить значение"><Calculator size={16} /></button>
                   <button onClick={() => handleAddElement('icon')} className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg text-gray-500" title="Добавить иконку"><LayoutTemplate size={16} /></button>
                </div>
            </div>

            <div 
               className="flex-1 w-full bg-gray-50 dark:bg-[#0b0f19] rounded-2xl border-2 border-dashed border-gray-200 dark:border-white/5 flex items-center justify-center relative overflow-hidden user-select-none"
               onClick={() => setSelectedElementId(null)}
               ref={containerRef}
            >
                {/* The Card Container */}
                <div 
                   style={{
                      width: config.width,
                      height: config.height,
                      background: editorBackground,
                      borderColor: config.borderColor,
                      borderWidth: config.borderColor ? 1 : 0,
                      borderStyle: 'solid',
                      position: 'relative',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                      borderRadius: 16,
                      overflow: 'hidden'
                   }}
                   onClick={(e) => e.stopPropagation()} // Prevent deselect when clicking card bg
                >
                    {config.elements.map(el => (
                        <DraggableElement 
                            key={el.id}
                            element={el}
                            isSelected={selectedElementId === el.id}
                            onSelect={setSelectedElementId}
                            onUpdate={handleElementUpdate}
                            data={previewData}
                            config={config}
                            containerRef={containerRef}
                        />
                    ))}
                </div>
            </div>
            
            <div className="mt-4 flex justify-end">
               <button 
                  onClick={() => setIsCodeModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-colors shadow-lg shadow-indigo-500/20"
               >
                   <Code size={18} /> Получить код
               </button>
            </div>
         </div>

         {/* Bottom Pane: Debug Data */}
         <div className="h-64 bg-white dark:bg-[#151923] rounded-3xl shadow-sm border border-gray-200 dark:border-white/5 p-6 flex flex-col relative overflow-hidden shrink-0">
             <div className="flex justify-between items-center mb-4">
                 <h3 className="text-xs font-bold uppercase text-gray-400 tracking-wider">Результат запроса</h3>
                 <div className="flex items-center gap-4">
                     <select 
                        value={debugGroupBy}
                        onChange={(e) => setDebugGroupBy(e.target.value)}
                        className="text-xs bg-gray-100 dark:bg-white/5 border-none rounded-lg px-2 py-1"
                     >
                        <option value="">Группировка: Не выбрано</option>
                        {availableColumns.map(c => <option key={c} value={c}>Группировка: {c}</option>)}
                     </select>
                 </div>
             </div>

             <div className="flex-1 overflow-hidden bg-gray-50 dark:bg-[#0b0f19] rounded-xl border border-gray-200 dark:border-white/10 relative">
                  {isDebugLoading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-black/50 backdrop-blur-sm z-10">
                          <Loader2 className="animate-spin text-indigo-500" size={24} />
                      </div>
                  )}
                  
                  {debugData.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                          Нет данных
                      </div>
                  ) : (
                      <div className="h-full overflow-auto custom-scrollbar p-0">
                          <table className="w-full text-left border-collapse">
                              <thead className="sticky top-0 bg-gray-100 dark:bg-[#1e2433] z-10">
                                  <tr>
                                      <th className="px-4 py-2 text-[10px] font-bold text-gray-500 uppercase">Группа</th>
                                      <th className="px-4 py-2 text-[10px] font-bold text-gray-500 uppercase text-right">Значение</th>
                                  </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200 dark:divide-white/5">
                                  {debugData.slice(0, 50).map((row, i) => (
                                      <tr key={i} className="hover:bg-white dark:hover:bg-white/5">
                                          <td className="px-4 py-2 text-xs text-gray-700 dark:text-gray-300">{row.name || '---'}</td>
                                          <td className="px-4 py-2 text-xs text-gray-900 dark:text-white font-mono text-right">{row.value.toLocaleString()}</td>
                                      </tr>
                                  ))}
                              </tbody>
                          </table>
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
