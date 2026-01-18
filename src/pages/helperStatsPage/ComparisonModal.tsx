
import React, { useState } from 'react';
import { X, Database, FileSpreadsheet, SplitSquareHorizontal, Code, LayoutDashboard, Copy } from 'lucide-react';
import ComplexComparisons from './helperElevatorTab/ComplexComparisons';
import ComplexComparisonsDB from './helperElevatorTab/ComplexComparisonsDB';
import { useDataStore } from '../../contexts/DataContext';

interface ComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  selectedCity: string;
  selectedYear: string;
  selectedRegion: string;
}

const ComparisonModal: React.FC<ComparisonModalProps> = ({ 
  isOpen, 
  onClose, 
  isDarkMode,
  selectedCity,
  selectedYear,
  selectedRegion
}) => {
  const { googleSheets } = useDataStore();
  const [viewMode, setViewMode] = useState<'visual' | 'code'>('visual');

  if (!isOpen) return null;

  // Helper to prepare preview data
  const getPreviewData = (key: string) => {
      const data = googleSheets[key as keyof typeof googleSheets];
      if (!data) return { info: "Нет данных", rows: [] };
      
      return {
          headers: data.headers?.slice(0, 3) || [],
          rowsCount: data.rows?.length || 0,
          sample: data.rows?.slice(0, 50) || [] // Show first 50 rows
      };
  };

  const dbPreview = getPreviewData('database_clientGrowth');
  const gsPreview = getPreviewData('clientGrowth');

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-gray-100 dark:bg-[#0b0f19] w-[95vw] h-[90vh] rounded-3xl shadow-2xl border border-gray-200 dark:border-white/10 flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-white/5 bg-white dark:bg-[#151923] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-500/20 rounded-lg text-indigo-600 dark:text-indigo-400">
              <SplitSquareHorizontal size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Сравнение источников</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                Регион: <span className="font-mono text-indigo-500">{selectedRegion || 'Все'}</span> • 
                Город: <span className="font-mono text-indigo-500">{selectedCity || 'Все'}</span> • 
                Год: <span className="font-mono text-indigo-500">{selectedYear || 'Все'}</span>
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
              {/* View Toggle */}
              <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-xl border border-gray-200 dark:border-white/10">
                  <button
                    onClick={() => setViewMode('visual')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        viewMode === 'visual' 
                        ? 'bg-white dark:bg-[#1e2433] text-indigo-600 dark:text-indigo-400 shadow-sm' 
                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                    }`}
                  >
                      <LayoutDashboard size={14} /> Визуализация
                  </button>
                  <button
                    onClick={() => setViewMode('code')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        viewMode === 'code' 
                        ? 'bg-white dark:bg-[#1e2433] text-emerald-600 dark:text-emerald-400 shadow-sm' 
                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                    }`}
                  >
                      <Code size={14} /> JSON / Код
                  </button>
              </div>

              <div className="w-px h-6 bg-gray-200 dark:bg-white/10 mx-1"></div>

              <button 
                onClick={onClose}
                className="p-2 bg-gray-100 dark:bg-white/10 rounded-full text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-gray-50 dark:bg-[#0b0f19]">
          
          {viewMode === 'visual' ? (
              // --- VISUAL MODE ---
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 h-full">
                {/* Left Column: Database (PostgreSQL) */}
                <div className="flex flex-col gap-4 h-full">
                    <div className="flex items-center gap-3 pb-2 border-b-2 border-emerald-500 bg-white dark:bg-[#151923] p-4 rounded-xl shadow-sm">
                        <div className="bg-emerald-100 dark:bg-emerald-500/20 p-2 rounded-xl text-emerald-600 dark:text-emerald-400">
                            <Database size={24} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">PostgreSQL</h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">key: "database_clientGrowth"</p>
                        </div>
                    </div>

                    <div className="relative flex-1">
                        <ComplexComparisonsDB 
                            isDarkMode={isDarkMode}
                            selectedCity={selectedCity}
                            selectedYear={selectedYear}
                            selectedRegion={selectedRegion}
                        />
                    </div>
                </div>

                {/* Right Column: Google Sheets */}
                <div className="flex flex-col gap-4 h-full">
                    <div className="flex items-center gap-3 pb-2 border-b-2 border-indigo-500 bg-white dark:bg-[#151923] p-4 rounded-xl shadow-sm">
                        <div className="bg-indigo-100 dark:bg-indigo-500/20 p-2 rounded-xl text-indigo-600 dark:text-indigo-400">
                            <FileSpreadsheet size={24} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Google Sheets</h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">key: "clientGrowth"</p>
                        </div>
                    </div>
                    
                    <div className="relative flex-1">
                        <ComplexComparisons 
                            isDarkMode={isDarkMode}
                            selectedCity={selectedCity}
                            selectedYear={selectedYear}
                            selectedRegion={selectedRegion}
                        />
                    </div>
                </div>
              </div>
          ) : (
              // --- CODE MODE ---
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 h-full">
                  
                  {/* Left Code Block */}
                  <div className="flex flex-col h-full overflow-hidden rounded-3xl border border-gray-200 dark:border-white/10 bg-[#1e1e1e] shadow-xl">
                      <div className="flex items-center justify-between px-4 py-3 bg-[#252526] border-b border-[#3e3e42]">
                          <div className="flex items-center gap-2 text-emerald-400">
                              <Database size={16} />
                              <span className="text-xs font-mono font-bold">database_clientGrowth.json</span>
                          </div>
                          <span className="text-[10px] text-gray-400">{dbPreview.rowsCount} records</span>
                      </div>
                      <div className="flex-1 overflow-auto custom-scrollbar p-4">
                          <pre className="text-xs font-mono text-[#d4d4d4] leading-relaxed whitespace-pre-wrap break-all">
                              {JSON.stringify(dbPreview, null, 2)}
                          </pre>
                      </div>
                  </div>

                  {/* Right Code Block */}
                  <div className="flex flex-col h-full overflow-hidden rounded-3xl border border-gray-200 dark:border-white/10 bg-[#1e1e1e] shadow-xl">
                      <div className="flex items-center justify-between px-4 py-3 bg-[#252526] border-b border-[#3e3e42]">
                          <div className="flex items-center gap-2 text-indigo-400">
                              <FileSpreadsheet size={16} />
                              <span className="text-xs font-mono font-bold">clientGrowth.json</span>
                          </div>
                          <span className="text-[10px] text-gray-400">{gsPreview.rowsCount} records</span>
                      </div>
                      <div className="flex-1 overflow-auto custom-scrollbar p-4">
                          <pre className="text-xs font-mono text-[#d4d4d4] leading-relaxed whitespace-pre-wrap break-all">
                              {JSON.stringify(gsPreview, null, 2)}
                          </pre>
                      </div>
                  </div>

              </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default ComparisonModal;
