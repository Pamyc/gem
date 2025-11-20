import React from 'react';
import { Columns, Rows, Table2, AlertCircle } from 'lucide-react';
import { useDataStore, GoogleSheetsData } from '../../contexts/DataContext';

interface SheetMetricsProps {
  selectedSheetKey: string;
}

const SheetMetrics: React.FC<SheetMetricsProps> = ({ selectedSheetKey }) => {
  const { googleSheets, sheetConfigs, isLoading } = useDataStore();

  // Если ключ не выбран или данные еще грузятся
  if (!selectedSheetKey) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col justify-center h-full">
         <p className="text-center text-gray-400 text-sm">Выберите таблицу для просмотра статистики</p>
      </div>
    );
  }

  const config = sheetConfigs.find(c => c.key === selectedSheetKey);
  const data = googleSheets[selectedSheetKey as keyof GoogleSheetsData];

  if (!data || !data.rows) {
     return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col justify-center h-full">
             {isLoading ? (
                 <p className="text-center text-gray-400 text-sm">Загрузка метрик...</p>
             ) : (
                 <div className="text-center text-gray-400 flex flex-col items-center gap-2">
                    <AlertCircle size={24} className="text-gray-300" />
                    <span className="text-sm">Нет данных</span>
                 </div>
             )}
        </div>
     );
  }

  const rowCount = data.rows.length;
  // Количество столбцов считаем по заголовкам, если они есть, иначе по первой строке данных
  const colCount = data.headers && data.headers.length > 0 
        ? data.headers[0].length 
        : (rowCount > 0 ? data.rows[0].length : 0);
  
  const totalCells = rowCount * colCount;

  const metrics = [
    { 
      label: 'Строк', 
      value: rowCount.toLocaleString('ru-RU'), 
      icon: Rows, 
      color: 'text-blue-600', 
      bg: 'bg-blue-100' 
    },
    { 
      label: 'Столбцов', 
      value: colCount, 
      icon: Columns, 
      color: 'text-purple-600', 
      bg: 'bg-purple-100' 
    },
    { 
      label: 'Всего ячеек', 
      value: totalCells.toLocaleString('ru-RU'), 
      icon: Table2, 
      color: 'text-emerald-600', 
      bg: 'bg-emerald-100' 
    },
  ];

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col justify-center h-full">
        <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-2">
           <h3 className="text-gray-800 font-bold">Метрики таблицы</h3>
           <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded border border-gray-100 max-w-[150px] truncate">
             {config?.sheetName}
           </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {metrics.map((m, i) => {
                const Icon = m.icon;
                return (
                    <div key={i} className="bg-gray-50 p-4 rounded-xl border border-gray-100 hover:shadow-sm transition-shadow text-center group">
                        <div className={`w-10 h-10 ${m.bg} rounded-full flex items-center justify-center mx-auto mb-2 ${m.color} group-hover:scale-110 transition-transform`}>
                           <Icon size={20} />
                        </div>
                        <h3 className="text-gray-500 text-xs font-medium mb-1 uppercase tracking-wide">{m.label}</h3>
                        <p className="text-xl font-bold text-gray-800">{m.value}</p>
                    </div>
                );
            })}
        </div>
    </div>
  );
};

export default SheetMetrics;