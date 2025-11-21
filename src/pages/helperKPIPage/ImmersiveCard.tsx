import React, { useMemo } from 'react';
import { Target, ShoppingCart } from 'lucide-react';
import EChartComponent from '../../components/charts/EChartComponent';
import * as echarts from 'echarts';

interface ImmersiveCardProps {
  isDarkMode: boolean;
}

const ImmersiveCard: React.FC<ImmersiveCardProps> = ({ isDarkMode }) => {

  const sparkLineGreen = useMemo(() => ({
    backgroundColor: 'transparent',
    grid: { left: -10, right: -10, top: 0, bottom: 0 },
    tooltip: { trigger: 'axis', show: false },
    xAxis: { type: 'category', show: false, data: [1,2,3,4,5,6,7,8,9,10] },
    yAxis: { type: 'value', show: false, min: 'dataMin' },
    series: [{
      type: 'line',
      data: [10, 15, 13, 18, 20, 18, 24, 22, 28, 30],
      smooth: true,
      showSymbol: false,
      lineStyle: { width: 4, color: '#10b981' },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(16, 185, 129, 0.4)' },
          { offset: 1, color: 'rgba(16, 185, 129, 0)' }
        ])
      }
    }]
  }), []);

  const sparkBarPurple = useMemo(() => ({
    backgroundColor: 'transparent',
    grid: { left: 0, right: 0, top: 0, bottom: 0 },
    tooltip: { show: false },
    xAxis: { type: 'category', show: false, data: [1,2,3,4,5,6,7,8] },
    yAxis: { type: 'value', show: false },
    series: [{
      type: 'bar',
      data: [40, 80, 50, 90, 60, 100, 70, 110],
      itemStyle: { 
         color: '#8b5cf6',
         borderRadius: [2, 2, 2, 2]
      },
      barWidth: '50%'
    }]
  }), []);

  return (
    <div className="space-y-6">
       <div className="flex flex-col gap-2">
         <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Immersive Data</h2>
         <p className="text-gray-500 dark:text-gray-400">Графики интегрированы в саму структуру карточки.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
         
         {/* Immersive Card 1 */}
         <div className="bg-emerald-900 rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between h-64 shadow-xl shadow-emerald-900/20">
            <div className="relative z-10">
               <div className="flex items-center gap-2 text-emerald-200 mb-2">
                  <Target size={18} />
                  <span className="font-medium text-sm">Конверсия</span>
               </div>
               <h3 className="text-5xl font-bold text-white tracking-tight">4.8%</h3>
               <p className="text-emerald-300/70 text-sm mt-1">Выше нормы на 1.2%</p>
            </div>

            {/* Chart Background */}
            <div className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none">
               <EChartComponent options={sparkLineGreen} height="100%" theme="dark" />
            </div>
         </div>

         {/* Immersive Card 2 */}
         <div className="bg-white dark:bg-[#151923] rounded-3xl p-0 border border-gray-200 dark:border-white/5 overflow-hidden flex flex-col h-64">
            <div className="p-6 pb-0">
               <p className="text-gray-500 font-medium text-sm">Продажи за неделю</p>
               <div className="flex items-center justify-between mt-2">
                  <h3 className="text-3xl font-bold text-gray-900 dark:text-white">245 шт.</h3>
                  <div className="p-2 bg-violet-100 dark:bg-violet-500/20 rounded-xl text-violet-600 dark:text-violet-300">
                     <ShoppingCart size={20} />
                  </div>
               </div>
            </div>
            <div className="flex-1 w-full mt-4">
               <EChartComponent options={sparkBarPurple} height="100%" theme={isDarkMode ? 'dark' : 'light'} />
            </div>
         </div>

      </div>
    </div>
  );
};

export default ImmersiveCard;