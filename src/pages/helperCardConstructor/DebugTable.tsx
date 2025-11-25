import React from 'react';
import { Loader2 } from 'lucide-react';
import { ProcessedDataItem } from '../../hooks/useProcessedChartData';

interface DebugTableProps {
  debugData: ProcessedDataItem[];
  isLoading: boolean;
  debugGroupBy: string;
  setDebugGroupBy: (val: string) => void;
  availableColumns: string[];
}

const DebugTable: React.FC<DebugTableProps> = ({
  debugData,
  isLoading,
  debugGroupBy,
  setDebugGroupBy,
  availableColumns
}) => {
  return (
    <div className="h-64 bg-white dark:bg-[#151923] rounded-3xl shadow-sm border border-gray-200 dark:border-white/5 p-6 flex flex-col relative overflow-hidden shrink-0">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xs font-bold uppercase text-gray-400 tracking-wider">Результат запроса</h3>
        <div className="flex items-center gap-4">
          <select 
            value={debugGroupBy}
            onChange={(e) => setDebugGroupBy(e.target.value)}
            className="text-xs bg-gray-100 dark:bg-white/5 border-none rounded-lg px-2 py-1 outline-none text-gray-700 dark:text-gray-300"
          >
            <option value="">Группировка: Не выбрано</option>
            {availableColumns.map(c => <option key={c} value={c}>Группировка: {c}</option>)}
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-hidden bg-gray-50 dark:bg-[#0b0f19] rounded-xl border border-gray-200 dark:border-white/10 relative">
        {isLoading && (
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
  );
};

export default DebugTable;