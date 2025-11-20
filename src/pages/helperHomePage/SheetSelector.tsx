import React, { useState, useEffect } from 'react';
import { Database, Loader2, AlertCircle, FileSpreadsheet, Columns } from 'lucide-react';
import { useDataStore, GoogleSheetsData } from '../../contexts/DataContext';

interface SheetOption {
  id: number;
  label: string;
}

interface SheetSelectorProps {
  selectedSheetKey: string;
  onSheetChange: (key: string) => void;
}

const SheetSelector: React.FC<SheetSelectorProps> = ({ selectedSheetKey, onSheetChange }) => {
  const { googleSheets, sheetConfigs, isLoading, error } = useDataStore();
  
  const [columnOptions, setColumnOptions] = useState<SheetOption[]>([]);
  const [selectedCol, setSelectedCol] = useState<string>('');

  useEffect(() => {
    if (!selectedSheetKey) {
      setColumnOptions([]);
      return;
    }

    const sheetData = googleSheets[selectedSheetKey as keyof GoogleSheetsData];

    if (sheetData && sheetData.headers && sheetData.headers.length >= 1) {
      const config = sheetConfigs.find(c => c.key === selectedSheetKey);
      const headerRowsCount = config?.headerRows || 3;
      const headerRows = sheetData.headers.slice(0, headerRowsCount);
      
      if (headerRows.length === 0) {
        setColumnOptions([]);
        return;
      }

      const colCount = headerRows[0].length;
      const generatedOptions: SheetOption[] = [];

      for (let i = 0; i < colCount; i++) {
        const values = headerRows.map(row => row[i]?.toString().trim() || '');
        const nonEmptyValues = values.filter(Boolean);
        const uniqueValues = Array.from(new Set(nonEmptyValues));

        let label = '';
        if (uniqueValues.length === 0) {
           label = `Столбец ${i + 1}`;
        } else if (uniqueValues.length === 1) {
           label = uniqueValues[0];
        } else {
           label = values.filter(Boolean).join(' + '); 
        }

        generatedOptions.push({ id: i, label });
      }

      setColumnOptions(generatedOptions);
      
      if (generatedOptions.length > 0) {
        setSelectedCol(generatedOptions[0].label);
      } else {
        setSelectedCol('');
      }
    } else {
      setColumnOptions([]);
      setSelectedCol('');
    }
  }, [selectedSheetKey, googleSheets, sheetConfigs]);

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-[#151923] p-6 rounded-3xl shadow-sm border border-gray-200 dark:border-white/5 flex items-center justify-center h-40">
        <div className="flex items-center gap-3 text-indigo-600 dark:text-violet-400">
          <Loader2 className="animate-spin" />
          <span className="font-medium">Синхронизация данных...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/10 p-6 rounded-3xl shadow-sm border border-red-100 dark:border-red-500/20 flex items-center gap-3 text-red-600 dark:text-red-400">
        <AlertCircle />
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#151923] p-8 rounded-3xl shadow-sm border border-gray-200 dark:border-white/5 transition-colors">
      <div className="flex items-center gap-3 mb-8 text-gray-800 dark:text-white">
        <div className="bg-indigo-100 dark:bg-indigo-500/20 p-2.5 rounded-xl text-indigo-700 dark:text-indigo-300">
          <Database size={22} />
        </div>
        <h3 className="font-bold text-xl tracking-tight">Исследование данных</h3>
      </div>

      <div className="space-y-6">
        {/* 1. Выбор таблицы */}
        <div className="space-y-2.5">
          <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 flex items-center gap-2 ml-1">
            <FileSpreadsheet size={16} className="text-indigo-500 dark:text-indigo-400" /> 
            Выберите таблицу
          </label>
          <div className="relative group">
            <select
              value={selectedSheetKey}
              onChange={(e) => onSheetChange(e.target.value)}
              className="w-full px-5 py-4 rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#0b0f19] text-gray-800 dark:text-gray-200 font-medium focus:border-indigo-500 dark:focus:border-violet-500 focus:ring-4 focus:ring-indigo-500/10 dark:focus:ring-violet-500/20 transition-all outline-none appearance-none cursor-pointer hover:bg-white dark:hover:bg-[#0f131e]"
            >
              {sheetConfigs.map((cfg) => (
                <option key={cfg.key} value={cfg.key}>
                  {cfg.sheetName}
                </option>
              ))}
            </select>
            <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-indigo-500 transition-colors">
               <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </div>
          </div>
        </div>

        {/* 2. Выбор столбца */}
        <div className="space-y-2.5">
          <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 flex items-center gap-2 ml-1">
            <Columns size={16} className="text-fuchsia-500 dark:text-fuchsia-400" />
            Выберите столбец
          </label>
          <div className="relative group">
            <select
              value={selectedCol}
              onChange={(e) => setSelectedCol(e.target.value)}
              className="w-full px-5 py-4 rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#0b0f19] text-gray-800 dark:text-gray-200 font-medium focus:border-fuchsia-500 dark:focus:border-fuchsia-500 focus:ring-4 focus:ring-fuchsia-500/10 dark:focus:ring-fuchsia-500/20 transition-all outline-none appearance-none cursor-pointer hover:bg-white dark:hover:bg-[#0f131e]"
              disabled={columnOptions.length === 0}
            >
              {columnOptions.length > 0 ? (
                columnOptions.map((opt) => (
                  <option key={opt.id} value={opt.label}>
                    {opt.label}
                  </option>
                ))
              ) : (
                <option>Нет данных для этой таблицы</option>
              )}
            </select>
            <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-fuchsia-500 transition-colors">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SheetSelector;