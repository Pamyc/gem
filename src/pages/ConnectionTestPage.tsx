import React, { useState } from 'react';
import { Server, Activity, AlertTriangle, CheckCircle2, Play, Database, List, Clock } from 'lucide-react';

const ConnectionTestPage: React.FC = () => {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState<string | null>(null); // храним тип активного действия
  const [error, setError] = useState<string | null>(null);

  const testConnection = async (action: 'check' | 'insert' | 'select') => {
    setLoading(action);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/db-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      });
      
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Server responded with an error');
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="w-full max-w-[800px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
          <Server className="text-indigo-500" size={32} />
          Шлюз управления БД
        </h2>
        <p className="text-gray-500 dark:text-gray-400">
          Панель для проверки прямого соединения сервера с базой данных PostgreSQL (Private Network) и тестирования операций.
        </p>
      </div>

      <div className="bg-white dark:bg-[#151923] rounded-3xl border border-gray-200 dark:border-white/10 shadow-sm p-8">
        
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-100 dark:border-white/5">
          <div className="flex flex-col">
            <span className="text-xs font-bold uppercase text-gray-400 tracking-wider">Target Host</span>
            <span className="font-mono text-lg font-bold text-gray-800 dark:text-white">192.168.0.4</span>
          </div>
          <div className="flex flex-col text-right">
             <span className="text-xs font-bold uppercase text-gray-400 tracking-wider">Database</span>
             <span className="font-mono text-lg font-bold text-gray-800 dark:text-white">PostgreSQL</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {/* Кнопка 1: Проверка времени */}
          <button
            onClick={() => testConnection('check')}
            disabled={!!loading}
            className={`
              relative overflow-hidden group p-4 rounded-2xl font-bold text-left transition-all border
              ${loading === 'check' ? 'bg-indigo-50 border-indigo-200 dark:bg-indigo-500/20 dark:border-indigo-500/30' : 'bg-gray-50 dark:bg-[#0b0f19] border-gray-200 dark:border-white/10 hover:border-indigo-500 dark:hover:border-indigo-500'}
            `}
          >
            <div className="flex items-center gap-3 mb-2">
               <div className="p-2 bg-blue-100 dark:bg-blue-500/20 rounded-lg text-blue-600 dark:text-blue-400">
                  <Clock size={20} />
               </div>
               <span className="text-sm text-gray-500 dark:text-gray-400 font-mono">SELECT NOW()</span>
            </div>
            <div className="text-gray-900 dark:text-white text-sm font-bold flex items-center gap-2">
               {loading === 'check' ? <Activity className="animate-spin w-4 h-4" /> : 'Проверка связи'}
            </div>
          </button>

          {/* Кнопка 2: Вставка */}
          <button
            onClick={() => testConnection('insert')}
            disabled={!!loading}
            className={`
              relative overflow-hidden group p-4 rounded-2xl font-bold text-left transition-all border
              ${loading === 'insert' ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-500/20 dark:border-emerald-500/30' : 'bg-gray-50 dark:bg-[#0b0f19] border-gray-200 dark:border-white/10 hover:border-emerald-500 dark:hover:border-emerald-500'}
            `}
          >
            <div className="flex items-center gap-3 mb-2">
               <div className="p-2 bg-emerald-100 dark:bg-emerald-500/20 rounded-lg text-emerald-600 dark:text-emerald-400">
                  <Database size={20} />
               </div>
               <span className="text-sm text-gray-500 dark:text-gray-400 font-mono">INSERT INTO...</span>
            </div>
            <div className="text-gray-900 dark:text-white text-sm font-bold flex items-center gap-2">
               {loading === 'insert' ? <Activity className="animate-spin w-4 h-4" /> : 'Вставить тест'}
            </div>
          </button>

          {/* Кнопка 3: Выборка */}
          <button
            onClick={() => testConnection('select')}
            disabled={!!loading}
            className={`
              relative overflow-hidden group p-4 rounded-2xl font-bold text-left transition-all border
              ${loading === 'select' ? 'bg-amber-50 border-amber-200 dark:bg-amber-500/20 dark:border-amber-500/30' : 'bg-gray-50 dark:bg-[#0b0f19] border-gray-200 dark:border-white/10 hover:border-amber-500 dark:hover:border-amber-500'}
            `}
          >
            <div className="flex items-center gap-3 mb-2">
               <div className="p-2 bg-amber-100 dark:bg-amber-500/20 rounded-lg text-amber-600 dark:text-amber-400">
                  <List size={20} />
               </div>
               <span className="text-sm text-gray-500 dark:text-gray-400 font-mono">SELECT * LIMIT 5</span>
            </div>
            <div className="text-gray-900 dark:text-white text-sm font-bold flex items-center gap-2">
               {loading === 'select' ? <Activity className="animate-spin w-4 h-4" /> : 'Получить данные'}
            </div>
          </button>
        </div>

        {/* Results Area */}
        <div className="bg-gray-50 dark:bg-[#0b0f19] rounded-2xl border border-gray-200 dark:border-white/5 min-h-[200px] relative overflow-hidden flex flex-col">
            {/* Status Bar */}
            <div className="px-4 py-3 bg-gray-100 dark:bg-white/5 border-b border-gray-200 dark:border-white/5 flex items-center justify-between shrink-0">
                <span className="text-xs font-mono text-gray-500 uppercase tracking-wider font-bold">SQL Output Console</span>
                {result && <span className="text-xs font-bold text-emerald-500 flex items-center gap-1 bg-emerald-100 dark:bg-emerald-500/20 px-2 py-1 rounded"><CheckCircle2 size={12}/> Success</span>}
                {error && <span className="text-xs font-bold text-red-500 flex items-center gap-1 bg-red-100 dark:bg-red-500/20 px-2 py-1 rounded"><AlertTriangle size={12}/> Error</span>}
            </div>

            <div className="p-6 font-mono text-sm overflow-auto custom-scrollbar flex-1">
               {!result && !error && !loading && (
                   <div className="flex flex-col items-center justify-center h-full text-gray-400 opacity-50 gap-2">
                      <Play size={32} />
                      <span>Выберите операцию для выполнения</span>
                   </div>
               )}
               
               {loading && (
                   <div className="text-indigo-500 animate-pulse">
                      &gt; Initiating connection pool...<br/>
                      &gt; Authenticating user 'gen_user'...<br/>
                      &gt; Sending SQL query...
                   </div>
               )}

               {error && (
                   <div className="text-red-500">
                      &gt; Error connecting to database:<br/>
                      <span className="block mt-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">{error}</span>
                   </div>
               )}

               {result && (
                   <div className="text-gray-700 dark:text-gray-300 space-y-4">
                      <div className="text-emerald-500">
                        &gt; {result.message}<br/>
                        <span className="text-gray-400 dark:text-gray-500 text-xs mt-1 block">SQL: {result.executedSql}</span>
                      </div>
                      
                      <div className="bg-white dark:bg-black/20 p-4 rounded-xl border border-gray-200 dark:border-white/5 overflow-hidden">
                        <pre className="text-xs md:text-sm whitespace-pre-wrap">
                          {JSON.stringify(result.result, null, 2)}
                        </pre>
                      </div>
                   </div>
               )}
            </div>
        </div>

      </div>
    </div>
  );
};

export default ConnectionTestPage;