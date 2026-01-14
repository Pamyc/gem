
import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { ExistingColumn } from './types';

interface AddRowModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTable: string | null;
  schema: ExistingColumn[];
  onInsert: (data: Record<string, any>) => Promise<void>;
  loading: boolean;
}

const AddRowModal: React.FC<AddRowModalProps> = ({ 
  isOpen, 
  onClose, 
  activeTable, 
  schema, 
  onInsert, 
  loading 
}) => {
  const [newRowData, setNewRowData] = useState<Record<string, any>>({});

  const isRequired = (col: ExistingColumn) => {
    return col.is_nullable === 'NO' && col.column_default === null;
  };

  const handleInsert = async () => {
    await onInsert(newRowData);
    setNewRowData({});
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
        <div className="bg-white dark:bg-[#151923] w-full max-w-lg rounded-3xl shadow-2xl border border-gray-200 dark:border-white/10 flex flex-col max-h-[85vh]">
            <div className="p-6 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-gray-50 dark:bg-[#1e293b]">
                <div>
                    <h3 className="text-xl font-black text-gray-900 dark:text-white">Добавить строку</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">В таблицу: {activeTable}</p>
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white">
                    <X size={24} />
                </button>
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar space-y-4 hover-scrollbar">
                {schema.map(col => {
                    // Skip auto-increment IDs for input
                    if (col.column_default?.includes('nextval')) return null;
                    
                    const required = isRequired(col);
                    const hasError = required && !newRowData[col.column_name];

                    return (
                        <div key={col.column_name}>
                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1.5 flex justify-between">
                                <span>{col.column_name}</span>
                                {required && <span className="text-red-500 text-[10px] bg-red-50 dark:bg-red-900/20 px-1.5 py-0.5 rounded">Required</span>}
                            </label>
                            <div className={`flex items-center gap-2 bg-gray-50 dark:bg-[#0b0f19] p-3 rounded-xl border transition-colors ${hasError ? 'border-red-300 dark:border-red-500/50 bg-red-50/10' : 'border-gray-200 dark:border-white/10 focus-within:border-indigo-500'}`}>
                                <input 
                                    type="text" 
                                    value={newRowData[col.column_name] || ''} 
                                    onChange={(e) => setNewRowData({ ...newRowData, [col.column_name]: e.target.value })}
                                    className="bg-transparent w-full outline-none text-gray-800 dark:text-white font-mono text-sm placeholder-gray-400"
                                    placeholder={col.data_type}
                                />
                            </div>
                            {hasError && <p className="text-[10px] text-red-500 mt-1 pl-1">Это поле обязательно для заполнения</p>}
                        </div>
                    );
                })}
            </div>

            <div className="p-6 border-t border-gray-100 dark:border-white/5 flex justify-end gap-3 bg-white dark:bg-[#151923]">
                <button onClick={onClose} className="px-4 py-2 rounded-xl text-gray-500 font-bold hover:bg-gray-100 dark:hover:bg-white/5">Отмена</button>
                <button 
                    onClick={handleInsert} 
                    disabled={loading} 
                    className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 flex items-center gap-2 disabled:opacity-50"
                >
                    {loading && <Loader2 className="animate-spin" size={16} />}
                    Добавить
                </button>
            </div>
        </div>
    </div>
  );
};

export default AddRowModal;
