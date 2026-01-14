
import React, { useState } from 'react';
import { Plus, X, Terminal, Trash2, Loader2 } from 'lucide-react';
import { ColumnDef } from './types';

interface CreateTableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, columns: ColumnDef[]) => Promise<void>;
  loading: boolean;
}

const CreateTableModal: React.FC<CreateTableModalProps> = ({ isOpen, onClose, onCreate, loading }) => {
  const [newTableName, setNewTableName] = useState('');
  const [newColumns, setNewColumns] = useState<ColumnDef[]>([
    { name: 'id', type: 'SERIAL', isPrimaryKey: true, isNullable: false }
  ]);

  if (!isOpen) return null;

  const handleCreate = async () => {
    await onCreate(newTableName, newColumns);
    setNewTableName('');
    setNewColumns([{ name: 'id', type: 'SERIAL', isPrimaryKey: true, isNullable: false }]);
  };

  const updateColumn = (index: number, field: keyof ColumnDef, value: any) => {
    const updated = [...newColumns];
    updated[index] = { ...updated[index], [field]: value };
    setNewColumns(updated);
  };

  const removeColumn = (index: number) => {
    setNewColumns(newColumns.filter((_, i) => i !== index));
  };

  const addColumnItem = () => {
    setNewColumns([...newColumns, { name: '', type: 'VARCHAR(255)', isPrimaryKey: false, isNullable: true }]);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
        <div className="bg-white dark:bg-[#151923] w-full max-w-2xl rounded-3xl shadow-2xl border border-gray-200 dark:border-white/10 flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 dark:border-white/5 flex justify-between items-center">
                <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                    <Plus className="text-emerald-500" /> Создать таблицу
                </h3>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white">
                    <X size={24} />
                </button>
            </div>
            <div className="p-6 overflow-y-auto custom-scrollbar space-y-6 hover-scrollbar">
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">Имя таблицы</label>
                    <div className="flex items-center gap-2 bg-gray-50 dark:bg-[#0b0f19] p-2 rounded-xl border border-gray-200 dark:border-white/10">
                        <Terminal size={16} className="text-gray-400 ml-2" />
                        <input 
                            type="text" 
                            value={newTableName} 
                            onChange={(e) => setNewTableName(e.target.value)} 
                            className="bg-transparent w-full outline-none text-gray-800 dark:text-white font-mono text-sm"
                            placeholder="users_data"
                        />
                    </div>
                </div>
                <div>
                    <div className="flex justify-between items-end mb-2">
                        <label className="text-xs font-bold text-gray-500 uppercase block">Поля (Columns)</label>
                        <button onClick={addColumnItem} className="text-indigo-500 text-xs font-bold flex items-center gap-1"><Plus size={12}/> Добавить</button>
                    </div>
                    <div className="space-y-2">
                        {newColumns.map((col, idx) => (
                            <div key={idx} className="flex gap-2 items-center bg-gray-50 dark:bg-[#0b0f19] p-2 rounded-xl border border-gray-200 dark:border-white/10">
                                <input type="text" placeholder="name" value={col.name} onChange={(e) => updateColumn(idx, 'name', e.target.value)} className="flex-1 bg-transparent outline-none text-sm font-mono border-b border-transparent focus:border-indigo-500 px-1" />
                                <select value={col.type} onChange={(e) => updateColumn(idx, 'type', e.target.value)} className="bg-white dark:bg-[#1e293b] text-xs rounded border border-gray-200 dark:border-white/10 px-2 py-1 outline-none">
                                    <option value="SERIAL">SERIAL</option>
                                    <option value="INTEGER">INTEGER</option>
                                    <option value="VARCHAR(255)">VARCHAR</option>
                                    <option value="TEXT">TEXT</option>
                                    <option value="BOOLEAN">BOOLEAN</option>
                                    <option value="TIMESTAMP">TIMESTAMP</option>
                                </select>
                                <button onClick={() => removeColumn(idx)} className="text-gray-400 hover:text-red-500 p-1"><Trash2 size={14} /></button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className="p-6 border-t border-gray-100 dark:border-white/5 flex justify-end gap-3">
                <button onClick={onClose} className="px-4 py-2 rounded-xl text-gray-500 font-bold">Отмена</button>
                <button onClick={handleCreate} disabled={loading || !newTableName} className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 disabled:opacity-50">Создать</button>
            </div>
        </div>
    </div>
  );
};

export default CreateTableModal;
