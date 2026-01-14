
import React, { useState, useMemo } from 'react';
import { Server, Activity, AlertTriangle, CheckCircle2, Play, Database, List, Clock, Terminal, Key, Shield, HardDrive, Link as LinkIcon, Copy, ExternalLink } from 'lucide-react';
import { executeDbQuery, DbConfig, isInternalNetwork } from '../utils/dbGatewayApi';

const ConnectionTestPage: React.FC = () => {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Проверка окружения для UI
  const isInternal = isInternalNetwork();
  
  // Состояние для параметров подключения
  const [dbConfig, setDbConfig] = useState<DbConfig>({
    host: '192.168.0.4',
    port: '5432',
    database: 'default_db',
    user: 'gen_user',
    password: '@gemdb@gemdb'
  });

  // Дефолтный запрос
  const [sqlQuery, setSqlQuery] = useState<string>("SELECT * FROM test ORDER BY id DESC LIMIT 5;");

  const handleConfigChange = (field: keyof DbConfig, value: string) => {
    setDbConfig(prev => ({ ...prev, [field]: value }));
  };

  const runQuery = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Используем умный executeDbQuery (сам выберет маршрут)
      const data = await executeDbQuery(sqlQuery, dbConfig);
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Ссылка на скрипт для отображения
  const generatedLink = 'https://script.google.com/macros/s/AKfycbzCjczxYLar98d1mjJfEKHt2BbDcqLWgra6AUPkEe_AZ_mVUVKqk7F5sdzxCLVHWqQk/exec';

  const copyLink = () => {
      navigator.clipboard.writeText(generatedLink);
      alert('Ссылка скопирована!');
  };

  const applyTemplate = (type: 'check' | 'insert' | 'select' | 'create') => {
      switch(type) {
          case 'check':
              setSqlQuery("SELECT NOW() as server_time, version();");
              break;
          case 'insert':
              setSqlQuery(`INSERT INTO test (text) VALUES ('Test entry ${new Date().toLocaleTimeString()}')`);
              break;
          case 'select':
              setSqlQuery("SELECT * FROM test ORDER BY id DESC LIMIT 10;");
              break;
          case 'create':
              setSqlQuery("CREATE TABLE IF NOT EXISTS test (id SERIAL PRIMARY KEY, text VARCHAR(255), created_at TIMESTAMP DEFAULT NOW());");
              break;
      }
  };

  const inputClass = "w-full bg-transparent font-mono font-bold text-gray-800 dark:text-white outline-none border-b border-transparent focus:border-indigo-500 transition-colors text-sm py-1";

  return (
    <div className="w-full max-w-[900px] mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      
      {/* Header */}
      <div className="flex flex-col gap-2 mb-4">
        <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
          <Server className="text-indigo-500" size={32} />
          Шлюз Google Apps Script
        </h2>
        <p className="text-gray-500 dark:text-gray-400">
          Запросы выполняются {isInternal ? 'напрямую через backend сайта (Local Network)' : 'через прокси Google (Apps Script)'}. База данных должна быть доступна.
        </p>
      </div>

      {/* 1. Credentials Panel (Editable) */}
      <div className="bg-white dark:bg-[#151923] rounded-3xl border border-gray-200 dark:border-white/10 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-[#1e2433]/50 flex items-center gap-2">
              <Shield size={16} className="text-indigo-500" />
              <h3 className="text-sm font-bold uppercase text-gray-500 tracking-wider">Параметры подключения (Config)</h3>
          </div>
          
          <div className="p-6 grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="flex flex-col p-3 bg-gray-50 dark:bg-black/20 rounded-xl border border-gray-100 dark:border-white/5 focus-within:ring-2 ring-indigo-500/20 transition-all">
                  <span className="text-[10px] font-bold text-gray-400 uppercase mb-1">Host</span>
                  <input 
                    type="text" 
                    value={dbConfig.host}
                    onChange={(e) => handleConfigChange('host', e.target.value)}
                    className={inputClass}
                  />
              </div>
              <div className="flex flex-col p-3 bg-gray-50 dark:bg-black/20 rounded-xl border border-gray-100 dark:border-white/5 focus-within:ring-2 ring-indigo-500/20 transition-all">
                  <span className="text-[10px] font-bold text-gray-400 uppercase mb-1">Port</span>
                  <input 
                    type="text" 
                    value={String(dbConfig.port)}
                    onChange={(e) => handleConfigChange('port', e.target.value)}
                    className={`${inputClass} text-indigo-500`}
                  />
              </div>
              <div className="flex flex-col p-3 bg-gray-50 dark:bg-black/20 rounded-xl border border-gray-100 dark:border-white/5 focus-within:ring-2 ring-emerald-500/20 transition-all">
                  <span className="text-[10px] font-bold text-gray-400 uppercase mb-1">Database</span>
                  <div className="flex items-center gap-1.5 w-full">
                      <HardDrive size={14} className="text-emerald-500 shrink-0" />
                      <input 
                        type="text" 
                        value={dbConfig.database}
                        onChange={(e) => handleConfigChange('database', e.target.value)}
                        className={inputClass}
                      />
                  </div>
              </div>
              <div className="flex flex-col p-3 bg-gray-50 dark:bg-black/20 rounded-xl border border-gray-100 dark:border-white/5 focus-within:ring-2 ring-indigo-500/20 transition-all">
                  <span className="text-[10px] font-bold text-gray-400 uppercase mb-1">User</span>
                  <input 
                    type="text" 
                    value={dbConfig.user}
                    onChange={(e) => handleConfigChange('user', e.target.value)}
                    className={inputClass}
                  />
              </div>
              <div className="flex flex-col p-3 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-500/20 group relative focus-within:ring-2 ring-red-500/20 transition-all">
                  <span className="text-[10px] font-bold text-red-400 uppercase mb-1 flex items-center gap-1">Password <Key size={10}/></span>
                  <input 
                    type="text" 
                    value={dbConfig.password}
                    onChange={(e) => handleConfigChange('password', e.target.value)}
                    className={`${inputClass} text-red-600 dark:text-red-400`}
                  />
              </div>
          </div>
      </div>

      {/* 2. Control & Editor */}
      <div className="bg-white dark:bg-[#151923] rounded-3xl border border-gray-200 dark:border-white/10 shadow-sm p-6 space-y-4">
        
        {/* Templates */}
        <div className="flex flex-wrap gap-2">
            <button onClick={() => applyTemplate('check')} className="px-3 py-1.5 bg-gray-100 dark:bg-white/5 hover:bg-indigo-50 dark:hover:bg-indigo-500/20 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg text-xs font-bold transition-colors flex items-center gap-2">
                <Clock size={14}/> Check Time
            </button>
            <button onClick={() => applyTemplate('create')} className="px-3 py-1.5 bg-gray-100 dark:bg-white/5 hover:bg-emerald-50 dark:hover:bg-emerald-500/20 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-lg text-xs font-bold transition-colors flex items-center gap-2">
                <Database size={14}/> Init Table "test"
            </button>
            <button onClick={() => applyTemplate('insert')} className="px-3 py-1.5 bg-gray-100 dark:bg-white/5 hover:bg-emerald-50 dark:hover:bg-emerald-500/20 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-lg text-xs font-bold transition-colors flex items-center gap-2">
                <Play size={14}/> Insert Row
            </button>
            <button onClick={() => applyTemplate('select')} className="px-3 py-1.5 bg-gray-100 dark:bg-white/5 hover:bg-amber-50 dark:hover:bg-amber-500/20 hover:text-amber-600 dark:hover:text-amber-400 rounded-lg text-xs font-bold transition-colors flex items-center gap-2">
                <List size={14}/> Select *
            </button>
        </div>

        {/* Editor */}
        <div className="relative">
            <div className="absolute top-0 left-0 px-3 py-1 bg-gray-800 text-gray-400 text-[10px] font-bold rounded-br-lg rounded-tl-xl border-r border-b border-gray-700 pointer-events-none">
                SQL EDITOR
            </div>
            <textarea
                value={sqlQuery}
                onChange={(e) => setSqlQuery(e.target.value)}
                className="w-full h-40 bg-[#0f111a] text-emerald-400 font-mono text-sm p-4 pt-8 rounded-xl border border-gray-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none resize-none shadow-inner"
                spellCheck={false}
            />
        </div>

        {/* Link Generator */}
        <div className="p-4 bg-gray-50 dark:bg-[#0b0f19] rounded-xl border border-gray-200 dark:border-white/10 flex flex-col gap-2">
            <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                    <LinkIcon size={12} /> GAS Endpoint (POST Only)
                </span>
                <div className="flex gap-2">
                    <a 
                        href={generatedLink} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-[10px] bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 px-2 py-1 rounded hover:text-indigo-500 flex items-center gap-1 transition-colors"
                    >
                        <ExternalLink size={10} /> Открыть
                    </a>
                    <button 
                        onClick={copyLink}
                        className="text-[10px] bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 px-2 py-1 rounded hover:text-indigo-500 flex items-center gap-1 transition-colors"
                    >
                        <Copy size={10} /> Копировать
                    </button>
                </div>
            </div>
            <code className="text-[10px] text-gray-500 dark:text-gray-400 font-mono break-all bg-white dark:bg-black/20 p-2 rounded border border-dashed border-gray-200 dark:border-white/10 select-all">
                {generatedLink}
            </code>
        </div>

        {/* Action Bar */}
        <div className="flex justify-end">
            <button
                onClick={runQuery}
                disabled={loading}
                className={`px-6 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 ${isInternal ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/30' : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/30'}`}
            >
                {loading ? <Activity className="animate-spin" size={20} /> : <Play size={20} fill="currentColor" />}
                {isInternal ? 'Выполнить на сайте' : 'Выполнить через Apps Script'}
            </button>
        </div>
      </div>

      {/* 3. Output Console */}
      <div className="bg-gray-50 dark:bg-[#0b0f19] rounded-2xl border border-gray-200 dark:border-white/5 min-h-[200px] relative overflow-hidden flex flex-col">
            <div className="px-4 py-3 bg-gray-100 dark:bg-white/5 border-b border-gray-200 dark:border-white/5 flex items-center justify-between shrink-0">
                <span className="text-xs font-mono text-gray-500 uppercase tracking-wider font-bold flex items-center gap-2">
                    <Terminal size={14} /> Output Console
                </span>
                {result && (
                    <div className="flex items-center gap-4">
                        <span className="text-xs font-bold text-emerald-500 flex items-center gap-1 bg-emerald-100 dark:bg-emerald-500/20 px-2 py-1 rounded">
                            <CheckCircle2 size={12}/> Success
                        </span>
                    </div>
                )}
                {error && <span className="text-xs font-bold text-red-500 flex items-center gap-1 bg-red-100 dark:bg-red-500/20 px-2 py-1 rounded"><AlertTriangle size={12}/> Error</span>}
            </div>

            <div className="p-6 font-mono text-sm overflow-auto custom-scrollbar flex-1 bg-white dark:bg-[#0f111a]">
               {!result && !error && !loading && (
                   <div className="flex flex-col items-center justify-center h-full text-gray-400 opacity-30 gap-2">
                      <Database size={48} />
                      <span className="text-sm">Ожидание выполнения запроса...</span>
                   </div>
               )}
               
               {loading && (
                   <div className="text-indigo-500 animate-pulse space-y-1">
                      {isInternal ? (
                          <>
                            <div>&gt; Connecting to Local Backend (/api/db-test)...</div>
                            <div>&gt; Direct Database Connection...</div>
                          </>
                      ) : (
                          <>
                            <div>&gt; Connecting to Google Apps Script...</div>
                            <div>&gt; Proxying to {dbConfig.host}...</div>
                          </>
                      )}
                      <div>&gt; Executing...</div>
                   </div>
               )}

               {error && (
                   <div className="text-red-500">
                      <div className="font-bold border-b border-red-500/20 pb-2 mb-2">Query Failed</div>
                      <pre className="whitespace-pre-wrap">{error}</pre>
                   </div>
               )}

               {result && (
                   <div className="text-gray-700 dark:text-gray-300 space-y-4">
                      <div className="overflow-x-auto">
                        <pre className="text-xs md:text-sm whitespace-pre-wrap text-emerald-600 dark:text-emerald-400">
                          {JSON.stringify(result, null, 2)}
                        </pre>
                      </div>
                   </div>
               )}
            </div>
      </div>

    </div>
  );
};

export default ConnectionTestPage;
