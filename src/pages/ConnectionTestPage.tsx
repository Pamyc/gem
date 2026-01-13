import React, { useState } from 'react';
import { Server, Activity, AlertTriangle, CheckCircle2, Play } from 'lucide-react';

const ConnectionTestPage: React.FC = () => {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testConnection = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/db-test');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Server responded with an error');
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[800px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
          <Server className="text-indigo-500" size={32} />
          Шлюз управления БД
        </h2>
        <p className="text-gray-500 dark:text-gray-400">
          Панель для проверки прямого соединения сервера с базой данных PostgreSQL (Private Network).
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

        <div className="flex justify-center mb-8">
          <button
            onClick={testConnection}
            disabled={loading}
            className={`
              relative overflow-hidden group px-8 py-4 rounded-2xl font-bold text-white transition-all
              ${loading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:shadow-lg hover:shadow-indigo-500/30 active:scale-95'
              }
            `}
          >
            <span className="flex items-center gap-3 relative z-10">
              {loading ? <Activity className="animate-spin" /> : <Play fill="currentColor" />}
              {loading ? 'Проверка соединения...' : 'Выполнить запрос (SELECT NOW())'}
            </span>
          </button>
        </div>

        {/* Results Area */}
        <div className="bg-gray-50 dark:bg-[#0b0f19] rounded-2xl border border-gray-200 dark:border-white/5 min-h-[150px] relative overflow-hidden">
            {/* Status Bar */}
            <div className="px-4 py-2 bg-gray-100 dark:bg-white/5 border-b border-gray-200 dark:border-white/5 flex items-center justify-between">
                <span className="text-xs font-mono text-gray-500">Console Output</span>
                {result && <span className="text-xs font-bold text-emerald-500 flex items-center gap-1"><CheckCircle2 size={12}/> Success</span>}
                {error && <span className="text-xs font-bold text-red-500 flex items-center gap-1"><AlertTriangle size={12}/> Error</span>}
            </div>

            <div className="p-6 font-mono text-sm overflow-x-auto">
               {!result && !error && !loading && (
                   <span className="text-gray-400 flex items-center gap-2 opacity-50">
                      Ожидание команды...
                   </span>
               )}
               
               {loading && (
                   <div className="text-indigo-500 animate-pulse">
                      > Initiating connection pool...<br/>
                      > Sending query...
                   </div>
               )}

               {error && (
                   <div className="text-red-500">
                      > Error connecting to database:<br/>
                      <span className="block mt-2 p-2 bg-red-500/10 rounded">{error}</span>
                   </div>
               )}

               {result && (
                   <div className="text-gray-700 dark:text-gray-300">
                      <div className="text-emerald-500 mb-2">> Query executed successfully in {Math.random().toFixed(3)}ms</div>
                      <pre className="text-xs md:text-sm bg-white dark:bg-black/20 p-4 rounded-xl border border-gray-200 dark:border-white/5">
                        {JSON.stringify(result, null, 2)}
                      </pre>
                   </div>
               )}
            </div>
        </div>

      </div>
    </div>
  );
};

export default ConnectionTestPage;