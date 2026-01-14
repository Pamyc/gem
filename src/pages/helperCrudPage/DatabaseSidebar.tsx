
import React from 'react';
import { Database, RefreshCw, Loader2 } from 'lucide-react';

interface DatabaseSidebarProps {
  databases: string[];
  selectedDb: string;
  onSelectDb: (db: string) => void;
  loading: boolean;
  onRefresh: () => void;
}

const DatabaseSidebar: React.FC<DatabaseSidebarProps> = ({ 
  databases, 
  selectedDb, 
  onSelectDb, 
  loading, 
  onRefresh 
}) => {
  return (
    <div className="w-64 flex flex-col bg-white dark:bg-[#151923] rounded-3xl border border-gray-200 dark:border-white/10 shadow-sm overflow-hidden shrink-0">
      <div className="p-4 border-b border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-[#1e293b] flex justify-between items-center">
        <h3 className="font-bold text-gray-700 dark:text-gray-200 text-xs uppercase tracking-wide flex items-center gap-2">
          <Database size={12} /> Базы данных
        </h3>
        <button onClick={onRefresh} className="text-gray-400 hover:text-indigo-500 transition-colors">
          <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1 hover-scrollbar">
        {databases.map(db => (
          <button
            key={db}
            onClick={() => onSelectDb(db)}
            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-between group ${
              selectedDb === db 
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30' 
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'
            }`}
          >
            <span className="truncate">{db}</span>
            {selectedDb === db && <div className="w-2 h-2 bg-white rounded-full"></div>}
          </button>
        ))}
      </div>
    </div>
  );
};

export default DatabaseSidebar;
