
import React, { useState, useEffect } from 'react';
import { Database, Plus, Table, Loader2, RefreshCw, Server, X, Check, Terminal, Trash2, Settings, AlertTriangle, Key } from 'lucide-react';
import { executeDbQuery, DbConfig } from '../utils/dbGatewayApi';

// Конфигурация подключения по умолчанию (от пользователя 1)
const DEFAULT_CONFIG: DbConfig = {
  host: '192.168.0.4',
  port: '5432',
  database: 'default_db',
  user: 'gen_user',
  password: '@gemdb@gemdb'
};

interface ColumnDef {
  name: string;
  type: string;
  isPrimaryKey: boolean;
  isNullable: boolean;
}

// Интерфейс для существующей колонки из БД
interface ExistingColumn {
  column_name: string;
  data_type: string;
  is_nullable: string;
  column_default: string | null;
}

const CrudPage: React.FC = () => {
  const [databases, setDatabases] = useState<string[]>([]);
  const [tables, setTables] = useState<string[]>([]);
  const [selectedDb, setSelectedDb] = useState<string>(DEFAULT_CONFIG.database || 'default_db');
  
  const [loadingDb, setLoadingDb] = useState(false);
  const [loadingTables, setLoadingTables] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- Create Modal State ---
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTableName, setNewTableName] = useState('');
  const [newColumns, setNewColumns] = useState<ColumnDef[]>([
    { name: 'id', type: 'SERIAL', isPrimaryKey: true, isNullable: false }
  ]);
  const [actionLoading, setActionLoading] = useState(false);

  // --- Edit/View Modal State ---
  const [viewingTable, setViewingTable] = useState<string | null>(null);
  const [tableColumns, setTableColumns] = useState<ExistingColumn[]>([]);
  const [loadingSchema, setLoadingSchema] = useState(false);
  
  // New Column in Edit Mode
  const [addColName, setAddColName] = useState('');
  const [addColType, setAddColType] = useState('VARCHAR(255)');

  // --- ACTIONS: LISTING ---

  const fetchDatabases = async () => {
    setLoadingDb(true);
    setError(null);
    try {
      const sql = "SELECT datname FROM pg_database WHERE datistemplate = false ORDER BY datname;";
      const res = await executeDbQuery(sql, DEFAULT_CONFIG);
      
      if (res.ok && res.data) {
        const dbs = res.data.map((row: any) => row.datname);
        setDatabases(dbs);
      } else {
        throw new Error(res.error || "Failed to fetch databases");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingDb(false);
    }
  };

  const fetchTables = async (dbName: string) => {
    setLoadingTables(true);
    setTables([]); 
    setError(null);
    try {
      const sql = "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;";
      const config = { ...DEFAULT_CONFIG, database: dbName };
      const res = await executeDbQuery(sql, config);
      
      if (res.ok && res.data) {
        const tbs = res.data.map((row: any) => row.table_name);
        setTables(tbs);
      } else {
        if (res.error) setError(`Ошибка доступа к БД '${dbName}': ${res.error}`);
      }
    } catch (err: any) {
      setError(`Ошибка подключения к '${dbName}': ${err.message}`);
    } finally {
      setLoadingTables(false);
    }
  };

  // --- ACTIONS: DETAILS & EDIT ---

  const fetchTableSchema = async (tableName: string) => {
    setLoadingSchema(true);
    setTableColumns([]);
    try {
      const sql = `
        SELECT column_name, data_type, is_nullable, column_default 
        FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = '${tableName}'
        ORDER BY ordinal_position;
      `;
      const config = { ...DEFAULT_CONFIG, database: selectedDb };
      const res = await executeDbQuery(sql, config);
      
      if (res.ok && res.data) {
        setTableColumns(res.data);
      }
    } catch (err: any) {
      alert("Ошибка получения схемы: " + err.message);
    } finally {
      setLoadingSchema(false);
    }
  };

  const openTableDetails = (tableName: string) => {
    setViewingTable(tableName);
    fetchTableSchema(tableName);
    // Reset add form
    setAddColName('');
    setAddColType('VARCHAR(255)');
  };

  // --- ACTIONS: DDL (CREATE / DROP / ALTER) ---

  const createTable = async () => {
    if (!newTableName) return;
    setActionLoading(true);
    setError(null);

    try {
      const columnsSql = newColumns.map(col => {
        let def = `"${col.name}" ${col.type}`;
        if (col.isPrimaryKey) def += ' PRIMARY KEY';
        if (!col.isNullable && !col.isPrimaryKey) def += ' NOT NULL';
        return def;
      }).join(', ');

      const sql = `CREATE TABLE IF NOT EXISTS "${newTableName}" (${columnsSql});`;
      const config = { ...DEFAULT_CONFIG, database: selectedDb };
      
      const res = await executeDbQuery(sql, config);

      if (res.ok) {
        setIsCreateModalOpen(false);
        setNewTableName('');
        setNewColumns([{ name: 'id', type: 'SERIAL', isPrimaryKey: true, isNullable: false }]);
        fetchTables(selectedDb);
      } else {
        throw new Error(res.error || "Failed to create table");
      }
    } catch (err: any) {
      alert("Ошибка создания: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const deleteTable = async (tableName: string) => {
    if (!confirm(`Вы уверены, что хотите удалить таблицу "${tableName}"? Это действие необратимо.`)) return;
    
    setActionLoading(true);
    try {
      const sql = `DROP TABLE IF EXISTS "${tableName}";`;
      const config = { ...DEFAULT_CONFIG, database: selectedDb };
      const res = await executeDbQuery(sql, config);
      
      if (res.ok) {
        if (viewingTable === tableName) setViewingTable(null); // Close modal if open
        fetchTables(selectedDb);
      } else {
        alert("Ошибка удаления: " + res.error);
      }
    } catch (err: any) {
      alert("Ошибка: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const addColumnToTable = async () => {
    if (!viewingTable || !addColName) return;
    setActionLoading(true);
    try {
      const sql = `ALTER TABLE "${viewingTable}" ADD COLUMN "${addColName}" ${addColType};`;
      const config = { ...DEFAULT_CONFIG, database: selectedDb };
      const res = await executeDbQuery(sql, config);

      if (res.ok) {
        setAddColName('');
        fetchTableSchema(viewingTable);
      } else {
        alert("Не удалось добавить колонку: " + res.error);
      }
    } catch (err: any) {
      alert("Ошибка: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const dropColumnFromTable = async (colName: string) => {
    if (!viewingTable || !confirm(`Удалить колонку "${colName}" из таблицы "${viewingTable}"?`)) return;
    
    setActionLoading(true);
    try {
      const sql = `ALTER TABLE "${viewingTable}" DROP COLUMN "${colName}";`;
      const config = { ...DEFAULT_CONFIG, database: selectedDb };
      const res = await executeDbQuery(sql, config);

      if (res.ok) {
        fetchTableSchema(viewingTable);
      } else {
        alert("Не удалось удалить колонку: " + res.error);
      }
    } catch (err: any) {
      alert("Ошибка: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // --- EFFECTS ---

  useEffect(() => {
    fetchDatabases();
  }, []);

  useEffect(() => {
    if (selectedDb) {
      fetchTables(selectedDb);
    }
  }, [selectedDb]);

  // --- CREATE MODAL HELPERS ---

  const addNewColumnRow = () => {
    setNewColumns([...newColumns, { name: '', type: 'VARCHAR(255)', isPrimaryKey: false, isNullable: true }]);
  };

  const removeNewColumnRow = (idx: number) => {
    setNewColumns(newColumns.filter((_, i) => i !== idx));
  };

  const updateNewColumnRow = (idx: number, field: keyof ColumnDef, value: any) => {
    setNewColumns(newColumns.map((col, i) => i === idx ? { ...col, [field]: value } : col));
  };

  return (
    <div className="w-full h-[calc(100vh-8rem)] flex flex-col gap-6 p-2 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3">
            <Server className="text-indigo-500" />
            CRUD Менеджер
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Управление базами и таблицами через шлюз</p>
        </div>
        <div className="bg-indigo-50 dark:bg-indigo-500/10 px-3 py-1.5 rounded-lg border border-indigo-100 dark:border-indigo-500/20 text-xs font-mono text-indigo-600 dark:text-indigo-300 flex items-center gap-2">
           <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
           Gateway Active
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl border border-red-200 dark:border-red-500/30 text-sm font-medium">
          {error}
        </div>
      )}

      <div className="flex flex-1 gap-6 min-h-0">
        
        {/* Left: Databases */}
        <div className="w-1/3 max-w-xs flex flex-col bg-white dark:bg-[#151923] rounded-3xl border border-gray-200 dark:border-white/10 shadow-sm overflow-hidden">
           <div className="p-4 border-b border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-[#1e293b] flex justify-between items-center">
              <h3 className="font-bold text-gray-700 dark:text-gray-200 text-sm uppercase tracking-wide flex items-center gap-2">
                <Database size={14} /> Базы данных
              </h3>
              <button onClick={fetchDatabases} className="p-1.5 hover:bg-gray-200 dark:hover:bg-white/10 rounded-lg transition-colors" title="Обновить">
                <RefreshCw size={14} className={loadingDb ? "animate-spin" : ""} />
              </button>
           </div>
           
           <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
              {databases.map(db => (
                <button
                  key={db}
                  onClick={() => setSelectedDb(db)}
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
              {!loadingDb && databases.length === 0 && (
                <div className="text-center py-10 text-gray-400 text-sm">Базы не найдены</div>
              )}
           </div>
        </div>

        {/* Right: Tables */}
        <div className="flex-1 flex flex-col bg-white dark:bg-[#151923] rounded-3xl border border-gray-200 dark:border-white/10 shadow-sm overflow-hidden relative">
           
           {/* Header */}
           <div className="p-4 border-b border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-[#1e293b] flex justify-between items-center">
              <h3 className="font-bold text-gray-700 dark:text-gray-200 text-sm uppercase tracking-wide flex items-center gap-2">
                <Table size={14} /> Таблицы в <span className="text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2 rounded">{selectedDb}</span>
              </h3>
              
              <div className="flex gap-2">
                <button 
                    onClick={() => fetchTables(selectedDb)} 
                    className="p-2 hover:bg-gray-200 dark:hover:bg-white/10 rounded-lg transition-colors text-gray-500" 
                    title="Обновить список"
                >
                    <RefreshCw size={16} className={loadingTables ? "animate-spin" : ""} />
                </button>
                <button 
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-lg shadow-emerald-500/20"
                >
                    <Plus size={16} /> Создать таблицу
                </button>
              </div>
           </div>

           {/* Content */}
           <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
              {loadingTables ? (
                  <div className="flex items-center justify-center h-full text-indigo-500">
                      <Loader2 className="animate-spin" size={32} />
                  </div>
              ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {tables.map(table => (
                          <div 
                            key={table} 
                            onClick={() => openTableDetails(table)}
                            className="bg-gray-50 dark:bg-[#0b0f19] border border-gray-200 dark:border-white/5 p-4 rounded-2xl hover:border-indigo-500 dark:hover:border-indigo-500 transition-colors group cursor-pointer relative"
                          >
                              {/* Delete Button (Hover) */}
                              <button 
                                onClick={(e) => { e.stopPropagation(); deleteTable(table); }}
                                className="absolute top-2 right-2 p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                title="Удалить таблицу"
                              >
                                  <Trash2 size={14} />
                              </button>

                              <div className="flex items-center gap-3 mb-2">
                                  <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                                      <Table size={16} />
                                  </div>
                                  <span className="font-bold text-gray-800 dark:text-gray-200 truncate pr-6" title={table}>
                                      {table}
                                  </span>
                              </div>
                              <div className="text-[10px] text-gray-400 uppercase font-mono mt-2 pt-2 border-t border-gray-200 dark:border-white/5 flex justify-between">
                                  <span>public</span>
                                  <span className="group-hover:text-indigo-500 transition-colors flex items-center gap-1">
                                    <Settings size={10} /> Настроить
                                  </span>
                              </div>
                          </div>
                      ))}
                      {tables.length === 0 && (
                          <div className="col-span-full flex flex-col items-center justify-center h-64 text-gray-400 border-2 border-dashed border-gray-200 dark:border-white/5 rounded-3xl">
                              <Database size={48} className="opacity-20 mb-4" />
                              <p>В этой базе данных нет публичных таблиц</p>
                          </div>
                      )}
                  </div>
              )}
           </div>
        </div>

      </div>

      {/* --- CREATE TABLE MODAL --- */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-[#151923] w-full max-w-2xl rounded-3xl shadow-2xl border border-gray-200 dark:border-white/10 flex flex-col max-h-[90vh]">
                
                <div className="p-6 border-b border-gray-100 dark:border-white/5 flex justify-between items-center">
                    <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                        <Plus className="text-emerald-500" /> Создать таблицу
                    </h3>
                    <button onClick={() => setIsCreateModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-white">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">
                    {/* Name */}
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">Имя таблицы</label>
                        <div className="flex items-center gap-2 bg-gray-50 dark:bg-[#0b0f19] p-2 rounded-xl border border-gray-200 dark:border-white/10 focus-within:border-indigo-500 transition-colors">
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

                    {/* Columns */}
                    <div>
                        <div className="flex justify-between items-end mb-2">
                            <label className="text-xs font-bold text-gray-500 uppercase block">Поля (Columns)</label>
                            <button onClick={addNewColumnRow} className="text-indigo-500 hover:text-indigo-600 text-xs font-bold flex items-center gap-1">
                                <Plus size={12} /> Добавить поле
                            </button>
                        </div>
                        
                        <div className="space-y-2">
                            {newColumns.map((col, idx) => (
                                <div key={idx} className="flex gap-2 items-center bg-gray-50 dark:bg-[#0b0f19] p-2 rounded-xl border border-gray-200 dark:border-white/10">
                                    <input 
                                        type="text" 
                                        placeholder="name" 
                                        value={col.name}
                                        onChange={(e) => updateNewColumnRow(idx, 'name', e.target.value)}
                                        className="flex-1 bg-transparent outline-none text-sm font-mono border-b border-transparent focus:border-indigo-500 px-1"
                                    />
                                    <select 
                                        value={col.type}
                                        onChange={(e) => updateNewColumnRow(idx, 'type', e.target.value)}
                                        className="bg-white dark:bg-[#1e293b] text-xs rounded border border-gray-200 dark:border-white/10 px-2 py-1 outline-none"
                                    >
                                        <option value="SERIAL">SERIAL</option>
                                        <option value="INTEGER">INTEGER</option>
                                        <option value="VARCHAR(255)">VARCHAR</option>
                                        <option value="TEXT">TEXT</option>
                                        <option value="BOOLEAN">BOOLEAN</option>
                                        <option value="TIMESTAMP">TIMESTAMP</option>
                                        <option value="DATE">DATE</option>
                                        <option value="JSONB">JSONB</option>
                                    </select>
                                    
                                    <label className="flex items-center gap-1 cursor-pointer" title="Primary Key">
                                        <input 
                                            type="checkbox" 
                                            checked={col.isPrimaryKey} 
                                            onChange={(e) => updateNewColumnRow(idx, 'isPrimaryKey', e.target.checked)}
                                            className="accent-indigo-500"
                                        />
                                        <span className="text-[10px] font-bold text-gray-500">PK</span>
                                    </label>

                                    <label className="flex items-center gap-1 cursor-pointer" title="Nullable">
                                        <input 
                                            type="checkbox" 
                                            checked={col.isNullable} 
                                            onChange={(e) => updateNewColumnRow(idx, 'isNullable', e.target.checked)}
                                            className="accent-indigo-500"
                                        />
                                        <span className="text-[10px] font-bold text-gray-500">NULL</span>
                                    </label>

                                    <button 
                                        onClick={() => removeNewColumnRow(idx)}
                                        disabled={newColumns.length === 1}
                                        className="text-gray-400 hover:text-red-500 p-1 disabled:opacity-30"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-gray-100 dark:border-white/5 flex justify-end gap-3">
                    <button 
                        onClick={() => setIsCreateModalOpen(false)}
                        className="px-4 py-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors font-bold"
                    >
                        Отмена
                    </button>
                    <button 
                        onClick={createTable}
                        disabled={actionLoading || !newTableName}
                        className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {actionLoading && <Loader2 className="animate-spin" size={16} />}
                        Создать
                    </button>
                </div>

            </div>
        </div>
      )}

      {/* --- EDIT / VIEW MODAL --- */}
      {viewingTable && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-[#151923] w-full max-w-3xl rounded-3xl shadow-2xl border border-gray-200 dark:border-white/10 flex flex-col max-h-[90vh]">
                
                {/* Modal Header */}
                <div className="p-6 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-gray-50 dark:bg-[#1e293b]">
                    <div className="flex items-center gap-3">
                       <div className="p-2 bg-indigo-100 dark:bg-indigo-500/20 rounded-xl text-indigo-600 dark:text-indigo-400">
                          <Settings size={20} />
                       </div>
                       <div>
                          <h3 className="text-xl font-black text-gray-900 dark:text-white">
                              {viewingTable}
                          </h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Структура таблицы</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-3">
                       <button 
                          onClick={() => deleteTable(viewingTable)}
                          className="flex items-center gap-2 px-3 py-1.5 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 rounded-lg text-xs font-bold hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <Trash2 size={14} /> Удалить таблицу
                       </button>
                       <button onClick={() => setViewingTable(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-white">
                          <X size={24} />
                       </button>
                    </div>
                </div>

                {/* Columns List */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
                    {loadingSchema ? (
                       <div className="flex justify-center py-10"><Loader2 className="animate-spin text-indigo-500" /></div>
                    ) : (
                       <div className="space-y-2">
                          <div className="grid grid-cols-12 gap-2 px-2 pb-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-white/5">
                             <div className="col-span-4">Name</div>
                             <div className="col-span-4">Type</div>
                             <div className="col-span-2 text-center">Nullable</div>
                             <div className="col-span-2 text-right">Actions</div>
                          </div>
                          
                          {tableColumns.map((col, idx) => (
                             <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-gray-50 dark:bg-[#0b0f19] p-2 rounded-xl border border-gray-200 dark:border-white/5 hover:border-indigo-500 transition-colors group">
                                <div className="col-span-4 font-mono font-bold text-sm text-gray-800 dark:text-white truncate" title={col.column_name}>
                                   {col.column_name}
                                   {/* If it looks like a PK (usually 'id' with default nextval) add icon */}
                                   {(col.column_default?.includes('nextval') || col.column_name === 'id') && 
                                      <Key size={10} className="inline ml-1 text-yellow-500" />
                                   }
                                </div>
                                <div className="col-span-4 text-xs font-mono text-indigo-600 dark:text-indigo-400 truncate" title={col.data_type}>
                                   {col.data_type}
                                </div>
                                <div className="col-span-2 text-center">
                                   {col.is_nullable === 'YES' ? 
                                      <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded">NULL</span> : 
                                      <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded">NOT NULL</span>
                                   }
                                </div>
                                <div className="col-span-2 text-right">
                                   <button 
                                      onClick={() => dropColumnFromTable(col.column_name)}
                                      disabled={actionLoading}
                                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-white dark:hover:bg-white/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                      title="Удалить колонку"
                                   >
                                      <Trash2 size={14} />
                                   </button>
                                </div>
                             </div>
                          ))}
                          {tableColumns.length === 0 && <div className="text-center text-gray-400 py-4">Нет колонок</div>}
                       </div>
                    )}
                </div>

                {/* Footer: Add Column */}
                <div className="p-6 border-t border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-[#1e293b]">
                    <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Добавить колонку</label>
                    <div className="flex gap-2">
                       <input 
                          type="text" 
                          placeholder="new_column_name"
                          value={addColName}
                          onChange={(e) => setAddColName(e.target.value)}
                          className="flex-1 bg-white dark:bg-[#0b0f19] outline-none text-sm font-mono border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 focus:border-indigo-500 transition-colors"
                       />
                       <select 
                          value={addColType}
                          onChange={(e) => setAddColType(e.target.value)}
                          className="bg-white dark:bg-[#0b0f19] text-xs rounded-xl border border-gray-200 dark:border-white/10 px-3 py-2 outline-none w-1/3"
                       >
                          <option value="INTEGER">INTEGER</option>
                          <option value="VARCHAR(255)">VARCHAR</option>
                          <option value="TEXT">TEXT</option>
                          <option value="BOOLEAN">BOOLEAN</option>
                          <option value="TIMESTAMP">TIMESTAMP</option>
                          <option value="JSONB">JSONB</option>
                       </select>
                       <button 
                          onClick={addColumnToTable}
                          disabled={actionLoading || !addColName}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                       >
                          {actionLoading ? <Loader2 className="animate-spin" size={14} /> : <Plus size={14} />}
                          Добавить
                       </button>
                    </div>
                </div>

            </div>
        </div>
      )}

    </div>
  );
};

export default CrudPage;
