import React from 'react';
import { Database, Server, Cpu, Globe, ArrowUpRight } from 'lucide-react';

const TechCard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
         <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Technical Grid</h2>
         <p className="text-gray-500 dark:text-gray-400">Инженерный стиль, данные на первом месте, моноширинные шрифты.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
          
          {/* Tech Card 1 */}
          <div className="bg-gray-50 dark:bg-[#0b0f19] rounded-xl border border-gray-200 dark:border-gray-800 p-6 relative overflow-hidden font-mono group">
             <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" 
                  style={{ backgroundImage: 'linear-gradient(#6366f1 1px, transparent 1px), linear-gradient(90deg, #6366f1 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
             </div>
             
             <div className="relative z-10 flex justify-between items-start mb-8">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                   <Database size={14} />
                   <span>SERVER_01</span>
                </div>
                <div className="flex gap-1">
                   <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                   <span className="text-xs text-emerald-500">ONLINE</span>
                </div>
             </div>
             
             <div className="relative z-10">
                <h3 className="text-4xl font-bold text-gray-900 dark:text-white mb-1">24ms</h3>
                <p className="text-xs text-gray-500">СРЕДНЕЕ ВРЕМЯ ОТКЛИКА</p>
             </div>

             <div className="absolute bottom-0 right-0 w-32 h-32 opacity-10">
                <Server size={128} />
             </div>
          </div>

          {/* Tech Card 2 */}
          <div className="bg-gray-900 text-white rounded-xl p-1 relative overflow-hidden group">
             <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-md"></div>
             <div className="relative h-full bg-[#0f111a] rounded-[10px] p-5 flex flex-col justify-between">
                <div className="flex justify-between items-center border-b border-white/10 pb-3 mb-3">
                   <span className="text-xs text-cyan-400 uppercase tracking-widest">CPU Load</span>
                   <Cpu size={16} className="text-gray-500 group-hover:text-cyan-400 transition-colors" />
                </div>
                
                <div className="flex items-end gap-4">
                   <span className="text-5xl font-mono font-light">74%</span>
                   <div className="h-10 flex-1 flex items-end gap-[2px]">
                      {[20, 40, 60, 30, 80, 50, 70, 90, 60, 74].map((h, i) => (
                         <div key={i} style={{height: `${h}%`}} className={`flex-1 ${i === 9 ? 'bg-cyan-400' : 'bg-gray-700'} rounded-sm`}></div>
                      ))}
                   </div>
                </div>
             </div>
          </div>

          {/* Tech Card 3 */}
          <div className="bg-white dark:bg-[#151923] rounded-xl border-l-4 border-indigo-600 shadow-sm p-6 flex items-center gap-6 group hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
             <div className="w-12 h-12 rounded-lg bg-indigo-50 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0 group-hover:scale-110 transition-transform">
                <Globe size={24} />
             </div>
             <div>
                <p className="text-xs font-bold text-gray-400 uppercase mb-1">Трафик сети</p>
                <div className="flex items-baseline gap-2">
                   <h3 className="text-2xl font-bold text-gray-900 dark:text-white">1.2 TB</h3>
                   <span className="text-xs font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-500/20 px-1.5 py-0.5 rounded flex items-center">
                      <ArrowUpRight size={10} /> 5%
                   </span>
                </div>
             </div>
          </div>

      </div>
    </div>
  );
};

export default TechCard;