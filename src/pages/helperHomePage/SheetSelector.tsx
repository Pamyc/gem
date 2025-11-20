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
  
  // Состояние для опций колонок текущей таблицы (локальное, так как нужно только здесь)
  const [columnOptions, setColumnOptions] = useState<SheetOption[]>([]);
  const [selectedCol, setSelectedCol] = useState<string>('');

  // Пересчет колонок при смене таблицы или обновлении данных
  useEffect(() => {
    if (!selectedSheetKey) {
      setColumnOptions([]);
      return;
    }

    // Получаем данные конкретного листа по ключу
    const sheetData = googleSheets[selectedSheetKey as keyof GoogleSheetsData];

    if (sheetData && sheetData.headers && sheetData.headers.length >= 1) {
      // Определяем сколько строк заголовков использовать (берем из конфига или дефолт 3)
      const config = sheetConfigs.find(c => c.key === selectedSheetKey);
      const headerRowsCount = config?.headerRows || 3;

      // Берем доступные строки заголовков
      const headerRows = sheetData.headers.slice(0, headerRowsCount);
      
      if (headerRows.length === 0) {
        setColumnOptions([]);
        return;
      }

      // Количество колонок определяем по первой строке
      const colCount = headerRows[0].length;
      const generatedOptions: SheetOption[] = [];

      for (let i = 0; i < colCount; i++) {
        // Собираем значения из всех строк заголовка для этой колонки
        const values = headerRows.map(row => row[i]?.toString().trim() || '');
        
        // Фильтруем пустые
        const nonEmptyValues = values.filter(Boolean);
        
        // Удаляем дубликаты
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
      
      // Сбрасываем или устанавливаем первый столбец
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
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex items-center justify-center h-32">
        <div className="flex items-center gap-3 text-indigo-600">
          <Loader2 className="animate-spin" />
          <span>Синхронизация данных...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-6 rounded-2xl shadow-sm border border-red-100 flex items-center gap-3 text-red-600">
        <AlertCircle />
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
      <div className="flex items-center gap-3 mb-6 text-gray-800">
        <div className="bg-indigo-100 p-2 rounded-lg text-indigo-700">
          <Database size={20} />
        </div>
        <h3 className="font-bold text-lg">Исследование данных</h3>
      </div>

      <div className="space-y-5">
        {/* 1. Выбор таблицы */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
            <FileSpreadsheet size={16} className="text-gray-400" /> 
            Выберите таблицу
          </label>
          <div className="relative">
            <select
              value={selectedSheetKey}
              onChange={(e) => onSheetChange(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none bg-gray-50 focus:bg-white appearance-none cursor-pointer text-gray-800 font-medium"
            >
              {sheetConfigs.map((cfg) => (
                <option key={cfg.key} value={cfg.key}>
                  {cfg.sheetName}
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
               <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </div>
          </div>
        </div>

        {/* 2. Выбор столбца */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
            <Columns size={16} className="text-gray-400" />
            Выберите столбец
          </label>
          <div className="relative">
            <select
              value={selectedCol}
              onChange={(e) => setSelectedCol(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none bg-gray-50 focus:bg-white appearance-none cursor-pointer text-gray-700"
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
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SheetSelector;