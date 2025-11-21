import React from 'react';
import { Activity, Zap } from 'lucide-react';

const AuroraCard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
         <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Aurora Glass</h2>
         <p className="text-gray-500 dark:text-gray-400">Эффект глубины, живые градиенты и размытие. Идеально для привлечения внимания.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
         
         {/* Aurora Card 1 */}
         <div className="relative h-64 rounded-[2.5rem] overflow-hidden group cursor-default transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-500/20">
            <div className="absolute inset-0 bg-white dark:bg-[#151923]"></div>
            {/* Animated Blobs */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-500/30 rounded-full blur-[80px] group-hover:bg-indigo-500/50 transition-colors duration-500 animate-pulse"></div>
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-fuchsia-500/30 rounded-full blur-[80px] group-hover:bg-fuchsia-500/50 transition-colors duration-500"></div>
            
            <div className="relative h-full p-8 flex flex-col justify-between z-10">
               <div className="flex justify-between items-start">
                  <div className="p-3 bg-white/50 dark:bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-sm">
                     <Activity className="text-indigo-600 dark:text-white" size={24} />
                  </div>
                  <span className="px-3 py-1 bg-emerald-400/20 text-emerald-700 dark:text-emerald-300 text-xs font-bold rounded-full backdrop-blur-md border border-emerald-400/20">
                     +12.5%
                  </span>
               </div>
               
               <div>
                  <p className="text-gray-500 dark:text-gray-300 font-medium mb-1">Активные пользователи</p>
                  <h3 className="text-5xl font-black text-gray-900 dark:text-white tracking-tighter group-hover:translate-x-2 transition-transform duration-300">14.2k</h3>
               </div>
            </div>
         </div>

         {/* Aurora Card 2 */}
         <div className="relative h-64 rounded-[2.5rem] overflow-hidden group cursor-default transition-all duration-500 hover:shadow-2xl hover:shadow-orange-500/20">
            <div className="absolute inset-0 bg-white dark:bg-[#151923]"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-br from-orange-400/10 to-rose-400/10 opacity-50 group-hover:opacity-100 transition-opacity"></div>
            
            {/* Rotating Circle */}
            <div className="absolute -right-10 -bottom-10 w-48 h-48 border-[30px] border-orange-500/5 rounded-full group-hover:rotate-45 transition-transform duration-700"></div>

            <div className="relative h-full p-8 flex flex-col justify-between z-10">
               <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-orange-600/70 dark:text-orange-400">Выручка</p>
                  <h3 className="text-4xl font-black text-gray-900 dark:text-white mt-2">₽ 4.2M</h3>
               </div>

               <div className="w-full bg-gray-100 dark:bg-white/5 rounded-full h-2 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-orange-400 to-rose-500 w-[75%] rounded-full shadow-[0_0_15px_rgba(244,63,94,0.5)]"></div>
               </div>
            </div>
         </div>

         {/* Aurora Card 3 (Dark Focus) */}
         <div className="relative h-64 rounded-[2.5rem] overflow-hidden group bg-[#0f111a] border border-white/5 hover:border-white/10 transition-colors">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-violet-900/40 to-transparent"></div>
            
            <div className="relative h-full p-8 flex flex-col items-center justify-center z-10 text-center">
               <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 p-[2px] mb-4 animate-spin-slow">
                  <div className="w-full h-full rounded-full bg-[#0f111a] flex items-center justify-center">
                     <Zap className="text-white fill-white" size={28} />
                  </div>
               </div>
               <h3 className="text-3xl font-bold text-white">98.5%</h3>
               <p className="text-violet-200/60 text-sm mt-1">Эффективность системы</p>
            </div>
         </div>

      </div>
    </div>
  );
};

export default AuroraCard;