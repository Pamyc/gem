
import React, { useState, useRef, useEffect } from 'react';
import { Columns, ChevronDown, ChevronRight, Loader2, Key, Trash2, Plus, Edit2 } from 'lucide-react';
import { ExistingColumn } from './types';

interface SchemaSectionProps {
  isOpen: boolean;
  onToggle: () => void;
  loading: boolean;
  schema: ExistingColumn[];
  onDeleteColumn: (name: string) => void;
  onAddColumn: (name: string, type: string) => Promise<void>;
  onRenameColumn: (oldName: string, newName: string) => Promise<void>;
  actionLoading: boolean;
}

const EditableColumnName: React.FC<{ 
  name: string; 
  onRename: (newName: string) => void; 
}> = ({ name, onRename }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleFinish = () => {
    setIsEditing(false);
    if (tempName && tempName !== name) {
      onRename(tempName);
    } else {
      setTempName(name); // Revert
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleFinish();
    if (e.key === 'Escape') {
      setTempName(name);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={tempName}
        onChange={(e) => setTempName(e.target.value)}
        onBlur={handleFinish}
        onKeyDown={handleKeyDown}
        className="font-mono font-bold text-sm bg-white dark:bg-black/20 text-indigo-600 dark:text-indigo-400 outline-none border-b border-indigo-500 min-w-[80px]"
      />
    );
  }

  return (
    <span 
      onClick={() => setIsEditing(true)}
      className="font-mono font-bold text-sm text-gray-800 dark:text-white truncate cursor-pointer hover:text-indigo-500 hover:underline decoration-dashed underline-offset-4" 
      title="Нажмите для переименования"
    >
      {name}
    </span>
  );
};

const SchemaSection: React.FC<SchemaSectionProps> = ({
  isOpen,
  onToggle,
  loading,
  schema,
  onDeleteColumn,
  onAddColumn,
  onRenameColumn,
  actionLoading
}) => {
  const [addColName, setAddColName] = useState('');
  const [addColType, setAddColType] = useState('VARCHAR(255)');

  const handleAddClick = async () => {
    if (addColName) {
      await onAddColumn(addColName, addColType);
      setAddColName(''); 
    }
  };

  return (
    <div className="border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden shrink-0">
      <button 
        onClick={onToggle}
        className="w-full flex items-center justify-between px-6 py-4 bg-gray-50 dark:bg-[#1e293b] hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3 font-bold text-gray-700 dark:text-gray-200">
            <Columns size={18} className="text-indigo-500" />
            Структура таблицы
            <span className="ml-2 px-2 py-0.5 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs rounded-full">
              {schema.length}
            </span>
        </div>
        <div className="text-gray-400">
            {isOpen ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
        </div>
      </button>
      
      {isOpen && (
        <div className="p-6 bg-white dark:bg-[#151923] border-t border-gray-200 dark:border-white/10">
            {loading ? (
              <div className="py-8 flex justify-center text-indigo-500"><Loader2 className="animate-spin" /></div>
            ) : (
              <div className="space-y-4">
                  {/* Ограничиваем высоту и добавляем скролл */}
                  <div className="max-h-[300px] overflow-y-auto hover-scrollbar pr-2 -mr-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {schema.map(col => (
                            <div key={col.column_name} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-[#0b0f19] group hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-colors">
                            <div className="min-w-0 flex-1 mr-2">
                                <div className="flex items-center gap-2">
                                    <EditableColumnName 
                                    name={col.column_name} 
                                    onRename={(newName) => onRenameColumn(col.column_name, newName)} 
                                    />
                                    {col.column_default?.includes('nextval') && <Key size={12} className="text-yellow-500 shrink-0" />}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 flex gap-2">
                                    <span className="font-mono text-indigo-500">{col.data_type}</span>
                                    {col.is_nullable === 'NO' && <span className="text-red-400">NOT NULL</span>}
                                </div>
                            </div>
                            <button 
                                onClick={() => onDeleteColumn(col.column_name)}
                                className="p-1.5 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                title="Удалить колонку"
                            >
                                <Trash2 size={14} />
                            </button>
                            </div>
                        ))}
                    </div>
                  </div>
                  
                  {/* Add Column Form */}
                  <div className="flex items-center gap-3 pt-4 border-t border-gray-100 dark:border-white/5 mt-4">
                      <span className="text-xs font-bold uppercase text-gray-400">Добавить:</span>
                      <input 
                        type="text" 
                        placeholder="имя_колонки" 
                        value={addColName}
                        onChange={(e) => setAddColName(e.target.value)}
                        className="bg-gray-50 dark:bg-[#0b0f19] border border-gray-200 dark:border-white/10 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-indigo-500"
                      />
                      <select 
                        value={addColType}
                        onChange={(e) => setAddColType(e.target.value)}
                        className="bg-gray-50 dark:bg-[#0b0f19] border border-gray-200 dark:border-white/10 rounded-lg px-3 py-1.5 text-sm outline-none"
                      >
                        <option value="VARCHAR(255)">VARCHAR</option>
                        <option value="INTEGER">INTEGER</option>
                        <option value="BOOLEAN">BOOLEAN</option>
                        <option value="TEXT">TEXT</option>
                        <option value="TIMESTAMP">TIMESTAMP</option>
                        <option value="JSONB">JSONB</option>
                      </select>
                      <button 
                        onClick={handleAddClick}
                        disabled={!addColName || actionLoading}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1 disabled:opacity-50"
                      >
                        <Plus size={14} /> Добавить
                      </button>
                  </div>
              </div>
            )}
        </div>
      )}
    </div>
  );
};

export default SchemaSection;
