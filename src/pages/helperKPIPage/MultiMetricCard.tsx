import React from 'react';
import { ArrowUp, ArrowDown, Minus, LayoutList, Maximize2, Layers, Target } from 'lucide-react';

const MultiMetricCard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
         <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Multi-Metric & Ranges</h2>
         <p className="text-gray-500 dark:text-gray-400">Карточки для отображения составных данных, диапазонов мин/макс и списков.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
         
         {/* 1. Range Slider Card (Min/Max/Current) */}
         <div className="bg-white dark:bg-[#151923] p-6 rounded-3xl shadow-sm border border-gray-200 dark:border-white/5 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
               <div>
                  <p className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider">Температура CPU</p>
                  <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">65°C</h3>
               </div>
               <div className="p-2 bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 rounded-lg">
                  <Maximize2 size={20} />
               </div>
            </div>

            {/* Range Visual */}
            <div className="space-y-2">
               <div className="flex justify-between text-xs font-mono text-gray-400">
                  <span>Min: 40°</span>
                  <span>Max: 90°</span>
               </div>
               <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded-full relative">
                  {/* Safe Range Zone */}
                  <div className="absolute left-[20%] right-[20%] top-0 bottom-0 bg-gray-200 dark:bg-gray-600 rounded-full"></div>
                  {/* Current Value Marker */}
                  <div 
                     className="absolute top-1/2 -translate-y-1/2 w-3 h-6 bg-orange-500 rounded-full shadow border-2 border-white dark:border-[#151923]" 
                     style={{ left: '50%' }}
                  ></div>
               </div>
               <div className="text-center text-xs text-orange-500 font-medium mt-1">В пределах нормы</div>
            </div>
         </div>

         {/* 2. Multi-Row List Card */}
         <div className="bg-white dark:bg-[#151923] p-6 rounded-3xl shadow-sm border border-gray-200 dark:border-white/5">
            <div className="flex items-center gap-2 mb-6">
               <LayoutList className="text-indigo-500" size={20} />
               <h3 className="font-bold text-gray-900 dark:text-white">Складские остатки</h3>
            </div>
            
            <div className="space-y-4">
               {/* Row 1 */}
               <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-white/5">
                  <div className="flex items-center gap-3">
                     <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                     <span className="text-sm font-medium text-gray-700 dark:text-gray-300">В наличии</span>
                  </div>
                  <span className="font-bold text-gray-900 dark:text-white">1,240</span>
               </div>
               {/* Row 2 */}
               <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-white/5">
                  <div className="flex items-center gap-3">
                     <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                     <span className="text-sm font-medium text-gray-700 dark:text-gray-300">В резерве</span>
                  </div>
                  <span className="font-bold text-gray-900 dark:text-white">350</span>
               </div>
               {/* Row 3 */}
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                     <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Брак</span>
                  </div>
                  <span className="font-bold text-gray-900 dark:text-white">12</span>
               </div>
            </div>
         </div>

         {/* 3. 2x2 Grid Summary Card */}
         <div className="bg-white dark:bg-[#151923] p-1 rounded-3xl shadow-sm border border-gray-200 dark:border-white/5">
            <div className="grid grid-cols-2 divide-x divide-y divide-gray-100 dark:divide-white/5">
               {/* Cell 1 */}
               <div className="p-5 flex flex-col items-center text-center">
                  <span className="text-xs text-gray-400 mb-1">Всего заявок</span>
                  <span className="text-xl font-black text-gray-900 dark:text-white">854</span>
                  <span className="text-[10px] text-emerald-500 flex items-center mt-1"><ArrowUp size={10}/> 12%</span>
               </div>
               {/* Cell 2 */}
               <div className="p-5 flex flex-col items-center text-center">
                  <span className="text-xs text-gray-400 mb-1">В работе</span>
                  <span className="text-xl font-black text-indigo-500">42</span>
                  <span className="text-[10px] text-gray-400 flex items-center mt-1"><Minus size={10}/> 0%</span>
               </div>
               {/* Cell 3 */}
               <div className="p-5 flex flex-col items-center text-center">
                  <span className="text-xs text-gray-400 mb-1">Закрыто</span>
                  <span className="text-xl font-black text-gray-900 dark:text-white">801</span>
                  <span className="text-[10px] text-emerald-500 flex items-center mt-1"><ArrowUp size={10}/> 8%</span>
               </div>
               {/* Cell 4 */}
               <div className="p-5 flex flex-col items-center text-center">
                  <span className="text-xs text-gray-400 mb-1">Отменено</span>
                  <span className="text-xl font-black text-rose-500">11</span>
                  <span className="text-[10px] text-rose-500 flex items-center mt-1"><ArrowUp size={10}/> 2%</span>
               </div>
            </div>
         </div>

         {/* 4. Target vs Actual Meter */}
         <div className="bg-gradient-to-br from-slate-800 to-slate-900 text-white p-6 rounded-3xl shadow-lg flex flex-col justify-between">
            <div className="flex justify-between items-center mb-4">
               <div className="flex items-center gap-2">
                  <Target size={18} className="text-emerald-400" />
                  <span className="font-medium text-sm text-slate-300">Выполнение плана</span>
               </div>
               <span className="text-2xl font-bold">82%</span>
            </div>

            <div className="space-y-6 relative">
               {/* Progress Bar Background */}
               <div className="h-3 bg-slate-700 rounded-full w-full relative">
                  {/* Fill */}
                  <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full w-[82%] shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                  
                  {/* Target Marker */}
                  <div className="absolute top-1/2 -translate-y-1/2 h-6 w-1 bg-white shadow-md z-10" style={{ left: '90%' }}></div>
                  <div className="absolute -top-6 text-[10px] font-mono text-slate-400" style={{ left: '85%' }}>Цель: 90%</div>
               </div>

               <div className="flex justify-between text-xs font-mono text-slate-500">
                  <div className="flex flex-col">
                     <span>Min</span>
                     <span className="text-white">₽ 0</span>
                  </div>
                  <div className="flex flex-col items-end">
                     <span>Max</span>
                     <span className="text-white">₽ 5M</span>
                  </div>
               </div>
            </div>
         </div>

      </div>
    </div>
  );
};

export default MultiMetricCard;