import React from 'react';
import { Columns, Rows, Table2, AlertCircle } from 'lucide-react';
import { useDataStore, GoogleSheetsData } from '../../contexts/DataContext';

interface SheetMetricsProps {
  selectedSheetKey: string;
}

const SheetMetrics: React.FC<SheetMetricsProps> = ({ selectedSheetKey }) => {
  const { googleSheets, sheetConfigs, isLoading } = useDataStore();

  if (!selectedSheetKey) {
    return (
      <div className="bg-white dark:bg-[#151923] p-6 rounded-3xl shadow-sm border border-gray-200 dark:border-white/5 flex flex-col justify-center h-full text-center">
         <p className="text-gray-400 dark:text-gray-500 text-sm font-medium">Выберите таблицу для просмотра статистики</p>
      </div>
    );
  }

  const config = sheetConfigs.find(c => c.key === selectedSheetKey);
  const data = googleSheets[selectedSheetKey as keyof GoogleSheetsData];

  if (!data || !data.rows) {
     return (
        <div className="bg-white dark:bg-[#151923] p-6 rounded-3xl shadow-sm border border-gray-200 dark:border-white/5 flex flex-col justify-center h-full">
             {isLoading ? (
                 <p className="text-center text-gray-400 dark:text-gray-500 text-sm font-medium">Загрузка метрик...</p>
             ) : (
                 <div className="text-center text-gray-400 flex flex-col items-center gap-2">
                    <AlertCircle size={24} className="text-gray-300 dark:text-gray-600" />
                    <span className="text-sm font-medium">Нет данных</span>
                 </div>
             )}
        </div>
     );
  }

  const rowCount = data.rows.length;
  const colCount = data.headers && data.headers.length > 0 
        ? data.headers[0].length 
        : (rowCount > 0 ? data.rows[0].length : 0);
  
  const totalCells = rowCount * colCount;

  const metrics = [
    { 
      label: 'Строк', 
      value: rowCount.toLocaleString('ru-RU'), 
      icon: Rows, 
      color: 'text-blue-600 dark:text-blue-400', 
      bg: 'bg-blue-100 dark:bg-blue-500/10',
      border: 'border-blue-100 dark:border-blue-500/20'
    },
    { 
      label: 'Столбцов', 
      value: colCount, 
      icon: Columns, 
      color: 'text-fuchsia-600 dark:text-fuchsia-400', 
      bg: 'bg-fuchsia-100 dark:bg-fuchsia-500/10',
      border: 'border-fuchsia-100 dark:border-fuchsia-500/20'
    },
    { 
      label: 'Всего ячеек', 
      value: totalCells.toLocaleString('ru-RU'), 
      icon: Table2, 
      color: 'text-emerald-600 dark:text-emerald-400', 
      bg: 'bg-emerald-100 dark:bg-emerald-500/10',
      border: 'border-emerald-100 dark:border-emerald-500/20'
    },
  ];

  return (
    <div className="bg-white dark:bg-[#151923] p-8 rounded-3xl shadow-sm border border-gray-200 dark:border-white/5 flex flex-col justify-center h-full transition-colors">
        <div className="mb-6 flex items-center justify-between border-b border-gray-100 dark:border-white/5 pb-4">
           <h3 className="text-gray-800 dark:text-white font-bold text-lg">Метрики</h3>
           <span className="text-xs font-mono text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-white/5 px-3 py-1 rounded-lg border border-gray-200 dark:border-white/5 max-w-[150px] truncate">
             {config?.sheetName}
           </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {metrics.map((m, i) => {
                const Icon = m.icon;
                return (
                    <div key={i} className={`bg-gray-50 dark:bg-[#0b0f19] p-5 rounded-2xl border ${m.border} hover:shadow-md transition-all text-center group`}>
                        <div className={`w-12 h-12 ${m.bg} rounded-xl flex items-center justify-center mx-auto mb-3 ${m.color} group-hover:scale-110 transition-transform`}>
                           <Icon size={22} />
                        </div>
                        <h3 className="text-gray-500 dark:text-gray-400 text-xs font-bold mb-1 uppercase tracking-wider">{m.label}</h3>
                        <p className="text-2xl font-black text-gray-800 dark:text-gray-100">{m.value}</p>
                    </div>
                );
            })}
        </div>
    </div>
  );
};

export default SheetMetrics;