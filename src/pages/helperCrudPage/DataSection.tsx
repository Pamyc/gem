
import React from 'react';
import { List, ChevronDown, ChevronRight, Plus, Loader2, ArrowLeft, ArrowRight, Trash2 } from 'lucide-react';
import { ExistingColumn, PAGE_SIZES } from './types';

interface DataSectionProps {
  isOpen: boolean;
  onToggle: () => void;
  loading: boolean;
  rows: any[];
  schema: ExistingColumn[];
  totalRows: number;
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  pageSize: number;
  setPageSize: React.Dispatch<React.SetStateAction<number>>;
  onDeleteRow: (id: any) => void;
  onAddRowClick: () => void;
}

const DataSection: React.FC<DataSectionProps> = ({
  isOpen,
  onToggle,
  loading,
  rows,
  schema,
  totalRows,
  page,
  setPage,
  pageSize,
  setPageSize,
  onDeleteRow,
  onAddRowClick
}) => {

  const getColIcon = (type: string) => {
    if (type.includes('int') || type.includes('serial')) return '123';
    if (type.includes('char') || type.includes('text')) return 'Aa';
    if (type.includes('date') || type.includes('time')) return '📅';
    if (type.includes('bool')) return '☑';
    return '?';
  };

  return (
    <div className="flex-1 flex flex-col border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden min-h-0">
        <button 
          onClick={onToggle}
          className="w-full flex items-center justify-between px-6 py-4 bg-gray-50 dark:bg-[#1e293b] hover:bg-gray-100 dark:hover:bg-white/5 transition-colors shrink-0"
        >
          <div className="flex items-center gap-3 font-bold text-gray-700 dark:text-gray-200">
              <List size={18} className="text-emerald-500" />
              Данные таблицы
          </div>
          <div className="text-gray-400">
              {isOpen ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          </div>
        </button>

        {isOpen && (
          <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-[#151923] relative">
              
              {/* Toolbar */}
              <div className="p-4 border-b border-gray-100 dark:border-white/5 flex flex-wrap gap-4 justify-between items-center shrink-0">
                <button 
                    onClick={onAddRowClick}
                    className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-lg shadow-emerald-500/20"
                >
                    <Plus size={16} /> Добавить строку
                </button>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                      <span>Показать:</span>
                      <select 
                          value={pageSize} 
                          onChange={(e) => setPageSize(Number(e.target.value))}
                          className="bg-gray-100 dark:bg-white/10 rounded-lg px-2 py-1 outline-none cursor-pointer"
                      >
                          {PAGE_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button 
                          disabled={page === 1}
                          onClick={() => setPage(p => p - 1)}
                          className="p-1.5 rounded-lg border border-gray-200 dark:border-white/10 disabled:opacity-30 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                      >
                          <ArrowLeft size={14} />
                      </button>
                      <span className="text-xs font-mono w-16 text-center text-gray-600 dark:text-gray-400">
                          {page} / {Math.ceil(totalRows / pageSize) || 1}
                      </span>
                      <button 
                          disabled={page * pageSize >= totalRows}
                          onClick={() => setPage(p => p + 1)}
                          className="p-1.5 rounded-lg border border-gray-200 dark:border-white/10 disabled:opacity-30 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                      >
                          <ArrowRight size={14} />
                      </button>
                    </div>
                </div>
              </div>

              {/* Table Container with Hover Scrollbar */}
              <div className="flex-1 overflow-auto hover-scrollbar p-4 relative">
                {loading ? (
                    <div className="h-full flex items-center justify-center text-indigo-500"><Loader2 className="animate-spin" size={32} /></div>
                ) : rows.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-gray-400 italic">Нет данных</div>
                ) : (
                    <table className="w-auto text-left border-collapse">
                      <thead className="sticky top-0 bg-gray-50 dark:bg-[#1e2433] z-10 shadow-sm">
                          <tr>
                            {schema.map(col => (
                                <th key={col.column_name} className="px-4 py-3 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-white/10 whitespace-nowrap min-w-[100px] max-w-[200px]">
                                  <div className="flex items-center gap-1">
                                      <span className="truncate">{col.column_name}</span>
                                      <span className="text-[8px] opacity-50 bg-gray-200 dark:bg-white/10 px-1 rounded shrink-0">{getColIcon(col.data_type)}</span>
                                  </div>
                                </th>
                            ))}
                            <th className="px-4 py-3 border-b border-gray-200 dark:border-white/10 w-10 sticky right-0 bg-gray-50 dark:bg-[#1e2433] z-20"></th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                          {rows.map((row, idx) => (
                            <tr key={idx} className="hover:bg-indigo-50/50 dark:hover:bg-white/5 transition-colors group">
                                {schema.map(col => (
                                  <td key={col.column_name} className={`px-4 py-2 text-xs text-gray-700 dark:text-gray-300 font-mono whitespace-nowrap truncate border-r border-transparent last:border-0 ${col.column_name === 'id' ? 'w-[60px] max-w-[60px]' : 'max-w-[200px]'}`}>
                                      {row[col.column_name] === null ? <span className="text-gray-300 italic">NULL</span> : String(row[col.column_name])}
                                  </td>
                                ))}
                                <td className="px-2 py-2 text-right sticky right-0 bg-white dark:bg-[#151923] group-hover:bg-indigo-50/50 dark:group-hover:bg-[#151923] transition-colors border-l border-transparent dark:border-white/5">
                                  {row.id && (
                                      <button 
                                        onClick={() => onDeleteRow(row.id)}
                                        className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded opacity-0 group-hover:opacity-100 transition-all"
                                        title="Удалить строку"
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                  )}
                                </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                )}
              </div>

          </div>
        )}
    </div>
  );
};

export default DataSection;
