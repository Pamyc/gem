import React, { useMemo } from 'react';
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Activity, 
  CreditCard, 
  Wallet, 
  ArrowDownRight, 
  ArrowUpRight,
  MousePointerClick,
  Eye,
  Clock,
  AlertTriangle
} from 'lucide-react';
import EChartComponent from '../../components/charts/EChartComponent';
import * as echarts from 'echarts';

interface ClassicKPISectionProps {
  isDarkMode: boolean;
}

const ClassicKPISection: React.FC<ClassicKPISectionProps> = ({ isDarkMode }) => {

  // Configs for Sparklines Section
  const miniLineChartOption = useMemo(() => ({
    backgroundColor: 'transparent',
    grid: { left: 0, right: 0, top: 5, bottom: 0 },
    tooltip: { 
      trigger: 'axis', 
      confine: true, 
      appendToBody: true,
      backgroundColor: 'rgba(0,0,0,0.8)',
      textStyle: { color: '#fff' }
    },
    xAxis: { type: 'category', show: false, data: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'] },
    yAxis: { type: 'value', show: false },
    series: [{
      type: 'line',
      data: [820, 932, 901, 934, 1290, 1330, 1320],
      smooth: true,
      showSymbol: false,
      lineStyle: { width: 3, color: '#3b82f6' },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(59, 130, 246, 0.3)' },
          { offset: 1, color: 'rgba(59, 130, 246, 0)' }
        ])
      }
    }]
  }), []);

  const miniBarChartOption = useMemo(() => ({
    backgroundColor: 'transparent',
    grid: { left: 0, right: 0, top: 5, bottom: 0 },
    tooltip: { 
      trigger: 'axis', 
      confine: true, 
      appendToBody: true,
      backgroundColor: 'rgba(0,0,0,0.8)',
      textStyle: { color: '#fff' }
    },
    xAxis: { type: 'category', show: false, data: ['A', 'B', 'C', 'D', 'E', 'F', 'G'] },
    yAxis: { type: 'value', show: false },
    series: [{
      type: 'bar',
      data: [120, 200, 150, 80, 70, 110, 130],
      itemStyle: { borderRadius: 2, color: '#f59e0b' },
      barWidth: '60%'
    }]
  }), []);

  return (
    <div className="space-y-16">
      
      {/* 1. Classic Style */}
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Classic Clean</h2>
          <p className="text-gray-500 dark:text-gray-400">Традиционный, чистый дизайн. Подходит для большинства корпоративных приложений.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {/* Card 1 */}
          <div className="bg-white dark:bg-[#151923] p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-white/5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
              <Users size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Пользователи</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">1,234</h3>
            </div>
          </div>
          
          {/* Card 2 */}
          <div className="bg-white dark:bg-[#151923] p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-white/5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
              <DollarSign size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Доход</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">₽ 450k</h3>
            </div>
          </div>

          {/* Card 3 with Trend */}
          <div className="bg-white dark:bg-[#151923] p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-white/5 flex flex-col gap-2">
            <div className="flex justify-between items-center">
               <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Заказы</p>
               <span className="text-xs font-bold text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full flex items-center gap-1">
                 <TrendingUp size={12} /> +15%
               </span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white">854</h3>
          </div>
        </div>
      </div>

      {/* 2. Gradient Style */}
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Vibrant Gradient</h2>
          <p className="text-gray-500 dark:text-gray-400">Яркие карточки для акцентирования внимания на важных метриках.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl p-6 text-white shadow-lg shadow-blue-500/20 relative overflow-hidden">
             <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-20 rounded-full blur-2xl"></div>
             <Activity className="mb-4 opacity-80" size={28} />
             <h3 className="text-4xl font-bold mb-1">98%</h3>
             <p className="text-blue-100 text-sm font-medium">Uptime сервера</p>
          </div>

          <div className="bg-gradient-to-br from-pink-500 to-orange-400 rounded-2xl p-6 text-white shadow-lg shadow-orange-500/20 relative overflow-hidden">
             <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-24 h-24 bg-white opacity-20 rounded-full blur-2xl"></div>
             <CreditCard className="mb-4 opacity-80" size={28} />
             <h3 className="text-4xl font-bold mb-1">₽ 1.2M</h3>
             <p className="text-pink-100 text-sm font-medium">Оборот за месяц</p>
          </div>
        </div>
      </div>

      {/* 3. Neon / Dark Mode Style */}
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Neon Dark</h2>
          <p className="text-gray-500 dark:text-gray-400">Стиль киберпанка с неоновым свечением. Лучше всего смотрится в темной теме.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="bg-black rounded-xl border border-gray-800 p-6 relative group hover:border-cyan-500/50 transition-colors">
              <div className="absolute inset-0 bg-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <p className="text-cyan-400 text-xs font-bold uppercase tracking-widest mb-2">Active Sessions</p>
              <div className="flex items-end gap-2">
                 <h3 className="text-4xl font-mono text-white shadow-[0_0_10px_rgba(34,211,238,0.5)]">4,291</h3>
                 <span className="text-cyan-500 mb-1 animate-pulse">●</span>
              </div>
           </div>

           <div className="bg-black rounded-xl border border-gray-800 p-6 relative group hover:border-fuchsia-500/50 transition-colors">
              <div className="absolute inset-0 bg-fuchsia-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <p className="text-fuchsia-400 text-xs font-bold uppercase tracking-widest mb-2">Errors Detected</p>
              <div className="flex items-end gap-2">
                 <h3 className="text-4xl font-mono text-white shadow-[0_0_10px_rgba(232,121,249,0.5)]">0</h3>
                 <span className="text-fuchsia-500 mb-1">All Clear</span>
              </div>
           </div>
        </div>
      </div>

      {/* 4. Minimal Style */}
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Minimal Typography</h2>
          <p className="text-gray-500 dark:text-gray-400">Акцент на типографике и отступах. Ничего лишнего.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 bg-gray-50 dark:bg-[#0f111a] p-8 rounded-3xl">
           <div className="flex flex-col">
              <span className="text-gray-400 text-sm font-medium">Views</span>
              <span className="text-5xl font-light text-gray-800 dark:text-white">24k</span>
           </div>
           <div className="flex flex-col">
              <span className="text-gray-400 text-sm font-medium">Clicks</span>
              <span className="text-5xl font-light text-gray-800 dark:text-white">8.1k</span>
           </div>
           <div className="flex flex-col">
              <span className="text-gray-400 text-sm font-medium">CTR</span>
              <span className="text-5xl font-light text-gray-800 dark:text-white">32%</span>
           </div>
        </div>
      </div>

      {/* 5. Sparklines Section */}
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Mini Charts (Sparklines)</h2>
          <p className="text-gray-500 dark:text-gray-400">Компактные графики для отображения трендов внутри карточек.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {/* Sparkline Card 1 */}
          <div className="bg-white dark:bg-[#151923] p-6 rounded-3xl shadow-sm border border-gray-200 dark:border-white/5 flex flex-col justify-between h-48">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Посетители</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white">12,543</h3>
                <span className="text-emerald-500 text-sm font-bold flex items-center"><ArrowUpRight size={14} /> 12%</span>
              </div>
            </div>
            <div className="h-16 -mx-2">
               <EChartComponent options={miniLineChartOption} height="100%" theme={isDarkMode ? 'dark' : 'light'} />
            </div>
          </div>

          {/* Sparkline Card 2 */}
          <div className="bg-white dark:bg-[#151923] p-6 rounded-3xl shadow-sm border border-gray-200 dark:border-white/5 flex flex-col justify-between h-48">
             <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Новые лиды</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white">843</h3>
                <span className="text-gray-400 text-sm">за 7 дней</span>
              </div>
            </div>
            <div className="h-16 -mx-2">
               <EChartComponent options={miniBarChartOption} height="100%" theme={isDarkMode ? 'dark' : 'light'} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassicKPISection;