
import React from 'react';
import { Loader2 } from 'lucide-react';

interface TableTabsProps {
  tables: string[];
  activeTable: string | null;
  onSelectTable: (table: string) => void;
  loading: boolean;
}

const TableTabs: React.FC<TableTabsProps> = ({ tables, activeTable, onSelectTable, loading }) => {
  return (
    <div className="flex items-center border-b border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-[#1e293b] px-2 pt-2 gap-1 overflow-x-auto custom-scrollbar shrink-0 h-14 hover-scrollbar">
      {tables.length === 0 && !loading && (
          <div className="px-4 text-sm text-gray-400 italic">Нет таблиц</div>
      )}
      {loading && (
          <div className="px-4 flex items-center gap-2 text-sm text-indigo-500"><Loader2 className="animate-spin" size={14}/> Загрузка...</div>
      )}
      {tables.map(table => (
          <button
            key={table}
            onClick={() => onSelectTable(table)}
            className={`px-5 py-2.5 rounded-t-xl text-sm font-bold transition-all whitespace-nowrap border-t border-x border-transparent relative top-[1px] ${
                activeTable === table
                  ? 'bg-white dark:bg-[#151923] text-indigo-600 dark:text-indigo-400 border-gray-200 dark:border-white/10 border-b-white dark:border-b-[#151923]'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5'
            }`}
          >
            {table}
          </button>
      ))}
    </div>
  );
};

export default TableTabs;
