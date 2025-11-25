
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { ArrowLeft, Loader2, ChevronLeft } from 'lucide-react';
import CardConfigPanel from './helperCardConstructor/helperCardConfigPanel';
import ElementConfigPanel from './helperCardConstructor/ElementConfigPanel';
import CardCodeModal from './helperCardConstructor/CardCodeModal';
import EditorCanvas from './helperCardConstructor/EditorCanvas';
import DebugTable from './helperCardConstructor/DebugTable';
import { useDataStore } from '../contexts/DataContext';
import { getMergedHeaders } from '../utils/chartUtils';
import { CardConfig, CardElement } from '../types/card';
import { useProcessedChartData } from '../hooks/useProcessedChartData';
import { ChartConfig } from '../types/chart';
import { getPresetLayout } from '../utils/cardPresets';
import { formatLargeNumber } from '../utils/formatUtils';
import { CalculationResult, calculateCardMetrics } from '../utils/cardCalculation';

interface CardConstructorPageProps {
  isDarkMode: boolean;
}

const CardConstructorPage: React.FC<CardConstructorPageProps> = ({ isDarkMode }) => {
  const { googleSheets, sheetConfigs, isLoading } = useDataStore();
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);

  // Editor State
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [clipboard, setClipboard] = useState<CardElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debug Table State
  const [debugGroupBy, setDebugGroupBy] = useState<string>('');

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
    if (config.elements.length === 0 && !config.sheetKey) {
       // Optional: Load a starter preset so canvas isn't empty
       // const preset = getPresetLayout('classic');
       // setConfig(prev => ({ ...prev, ...preset }));
    }
  }, []);

  // --- KEYBOARD SHORTCUTS (Copy/Paste/Delete) ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input fields
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Copy: Ctrl+C
      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        if (selectedElementId) {
            const el = config.elements.find(el => el.id === selectedElementId);
            if (el) {
                setClipboard(el);
            }
        }
      }

      // Paste: Ctrl+V
      if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        if (clipboard) {
            const newId = `${clipboard.type}-${Math.random().toString(36).substr(2, 9)}`;
            const newElement: CardElement = {
                ...clipboard,
                id: newId,
                style: {
                    ...clipboard.style,
                    top: (clipboard.style.top || 0) + 10,
                    left: (clipboard.style.left || 0) + 10
                }
            };
            setConfig(prev => ({
                ...prev,
                elements: [...prev.elements, newElement]
            }));
            setSelectedElementId(newId);
        }
      }

      // Delete: Delete/Backspace
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedElementId) {
            setConfig(prev => ({
                ...prev,
                elements: prev.elements.filter(el => el.id !== selectedElementId)
            }));
            setSelectedElementId(null);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElementId, clipboard, config.elements]);


  // --- HELPERS ---

  const { availableColumns, currentRows } = useMemo(() => {
    const sheetKey = config.sheetKey; // Or selected element override
    if (!sheetKey) return { availableColumns: [], currentRows: [] };
    
    const sheetData = googleSheets[sheetKey as keyof typeof googleSheets];
    if (!sheetData || !sheetData.headers || sheetData.headers.length === 0) return { availableColumns: [], currentRows: [] };
    
    const currentSheetConfig = sheetConfigs.find(c => c.key === sheetKey);
    const headerRowsCount = currentSheetConfig?.headerRows || 1;
    const mergedHeaders = getMergedHeaders(sheetData.headers, headerRowsCount);
    
    return { availableColumns: mergedHeaders, currentRows: sheetData.rows || [] };
  }, [googleSheets, config.sheetKey, sheetConfigs]);

  // Calculate global card metrics for preview
  const previewData = useMemo(() => {
      return calculateCardMetrics(googleSheets, sheetConfigs, config);
  }, [googleSheets, sheetConfigs, config]);


  // --- HANDLERS ---

  const handleAddElement = (type: CardElement['type']) => {
      const id = `${type}-${Math.random().toString(36).substr(2, 9)}`;
      const newElement: CardElement = {
          id,
          type,
          style: {
              top: 20,
              left: 20,
              width: type === 'icon' || type === 'shape' ? 40 : 'auto',
              height: type === 'icon' || type === 'shape' ? 40 : 'auto',
              fontSize: type === 'value' ? 32 : 14,
              color: isDarkMode ? '#ffffff' : '#000000',
              zIndex: 1
          }
      };
      
      setConfig(prev => ({
          ...prev,
          elements: [...prev.elements, newElement]
      }));
      setSelectedElementId(id);
  };

  const handleUpdateElement = (id: string, updates: Partial<CardElement> | Partial<CardElement['style']>) => {
      setConfig(prev => ({
          ...prev,
          elements: prev.elements.map(el => {
              if (el.id !== id) return el;
              
              // If updates has 'style' property, merge it deep
              if ('style' in updates) {
                  return { ...el, ...updates, style: { ...el.style, ...(updates as any).style } };
              }
              // Otherwise check if updates are style properties directly (legacy support)
              const isStyleUpdate = Object.keys(updates).some(k => k in el.style || k === 'top' || k === 'left' || k === 'width' || k === 'height');
              if (isStyleUpdate) {
                   return { ...el, style: { ...el.style, ...updates } };
              }
              
              // Standard property update
              return { ...el, ...updates };
          })
      }));
  };

  const selectedElement = useMemo(() => 
      config.elements.find(el => el.id === selectedElementId), 
  [config.elements, selectedElementId]);

  // Debug Data Logic (Optional)
  const debugChartConfig: ChartConfig = useMemo(() => ({
    title: "Debug",
    sheetKey: config.sheetKey,
    chartType: "bar",
    xAxisColumn: debugGroupBy,
    yAxisColumn: config.dataColumn,
    segmentColumn: "",
    aggregation: config.aggregation,
    isCumulative: false,
    showLabels: true,
    showDataZoomSlider: false,
    showLegend: false,
    filters: config.filters
  }), [config, debugGroupBy]);

  const { data: debugData, isLoading: isDebugLoading } = useProcessedChartData(debugChartConfig);


  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="animate-spin text-indigo-500" size={32} />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col gap-6">
       
       <div className="flex flex-col lg:flex-row gap-6 h-full min-h-[600px]">
          
          {/* LEFT COLUMN: Combined Config Panel */}
          <div className="w-full lg:w-80 bg-white dark:bg-[#151923] rounded-3xl shadow-sm border border-gray-200 dark:border-white/5 p-6 flex flex-col shrink-0 overflow-hidden relative transition-all duration-300">
              
              {/* Header / Switcher */}
              <div className="mb-4 shrink-0 min-h-[32px] flex items-center">
                 {selectedElement ? (
                   <button 
                     onClick={() => setSelectedElementId(null)}
                     className="flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors uppercase tracking-wider"
                   >
                     <ChevronLeft size={14} /> Настройки Карточки
                   </button>
                 ) : (
                   <h3 className="text-sm font-bold text-gray-800 dark:text-white flex items-center gap-2">
                      Настройки Карточки
                   </h3>
                 )}
              </div>

              {/* Content Swapper */}
              <div className="flex-1 overflow-hidden relative">
                 {selectedElement ? (
                    <div className="h-full flex flex-col animate-in slide-in-from-right-4 duration-300">
                       <div className="mb-2 pb-2 border-b border-gray-100 dark:border-white/5">
                          <span className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                             Элемент: <span className="text-indigo-500">{selectedElement.type}</span>
                          </span>
                       </div>
                       <ElementConfigPanel 
                           element={selectedElement}
                           onUpdate={(updates) => handleUpdateElement(selectedElement.id, updates)}
                           onDelete={() => {
                               setConfig(prev => ({...prev, elements: prev.elements.filter(e => e.id !== selectedElement.id)}));
                               setSelectedElementId(null);
                           }}
                           googleSheets={googleSheets}
                           sheetConfigs={sheetConfigs}
                           globalSheetKey={config.sheetKey}
                       />
                    </div>
                 ) : (
                    <div className="h-full animate-in slide-in-from-left-4 duration-300">
                       <CardConfigPanel 
                           config={config} 
                           setConfig={setConfig} 
                           sheetConfigs={sheetConfigs}
                           availableColumns={availableColumns}
                           rows={currentRows}
                       />
                    </div>
                 )}
              </div>
          </div>

          {/* RIGHT COLUMN: Canvas & Editor */}
          <div className="flex-1 flex flex-col gap-6 h-full overflow-hidden">
              
              {/* Canvas Area */}
              <EditorCanvas 
                  config={config}
                  selectedElementId={selectedElementId}
                  setSelectedElementId={setSelectedElementId}
                  onAddElement={handleAddElement}
                  onElementUpdate={handleUpdateElement}
                  previewData={previewData}
                  containerRef={containerRef}
                  editorBackground={isDarkMode ? '#0b0f19' : '#f9fafb'}
                  onOpenCodeModal={() => setIsCodeModalOpen(true)}
              />

              {/* Bottom: Debug Table (Collapsible idea?) */}
              {config.sheetKey && (
                  <DebugTable 
                      debugData={debugData}
                      isLoading={isDebugLoading}
                      debugGroupBy={debugGroupBy}
                      setDebugGroupBy={setDebugGroupBy}
                      availableColumns={availableColumns}
                  />
              )}
          </div>

       </div>

       {/* Code Modal */}
       <CardCodeModal 
         isOpen={isCodeModalOpen} 
         onClose={() => setIsCodeModalOpen(false)} 
         config={config}
         onConfigUpdate={setConfig}
       />
    </div>
  );
};

export default CardConstructorPage;
