import React, { useState, useMemo } from 'react';
import DynamicChart from '../../components/charts/DynamicChart';
import { ChartConfig } from '../../types/chart';
import { LayoutDashboard, ArrowUpFromLine, Banknote, Hammer } from 'lucide-react';

interface DashboardChartsProps {
  isDarkMode: boolean;
}

type TabType = 'general' | 'lifts' | 'finance' | 'montag';

const DashboardCharts: React.FC<DashboardChartsProps> = ({ isDarkMode }) => {
  const [activeTab, setActiveTab] = useState<TabType>('general');
  
  const clientGrowthConfig: ChartConfig = useMemo(() => ({
    title: "Динамика этажей по городам (Live)",
    sheetKey: "clientGrowth",
    chartType: "line",
    xAxisColumn: "Город",
    yAxisColumn: "Кол-во этажей",
    segmentColumn: "",
    aggregation: "sum",
    isCumulative: false,
    showLabels: true,
    showDataZoomSlider: false,
    showLegend: true,
    filters: []
  }), []);

  const testConfig: ChartConfig = useMemo(() => ({
    title: "Мой новый график",
    sheetKey: "clientGrowth",
    chartType: "bar",
    xAxisColumn: "ЖК",
    yAxisColumn: "Кол-во лифтов",
    segmentColumn: "",
    aggregation: "sum",
    isCumulative: false,
    showLabels: true,
    showDataZoomSlider: false,
    showLegend: true,
    filters: []
  }), []);

  // NEW: Pie Chart Config based on user request from analytics-dashboard.tsx logic
  const elevatorsByCityConfig: ChartConfig = useMemo(() => ({
    title: "Кол-во лифтов (Пончик)",
    sheetKey: "montag", // Assuming montag sheet has similar structure or using clientGrowth for demo
    chartType: "pie",
    xAxisColumn: "Город", // Used for grouping in Pie logic
    yAxisColumn: "Кол-во лифтов",
    segmentColumn: "Город", // For Pie, we group by this
    aggregation: "sum",
    isCumulative: false,
    showLabels: true,
    showDataZoomSlider: false,
    showLegend: true,
    filters: [
      { id: 'f1', column: "Итого (Да/Нет)", operator: 'equals', value: "Нет" },
      // Note: 'Без разбивки на литеры (Да/Нет)' might not exist in current demo data, 
      // but adding it to match the logic requested. 
      // If column doesn't exist, filter is safely ignored in utils.
      { id: 'f2', column: "Без разбивки на литеры (Да/Нет)", operator: 'equals', value: "Да" }, 
    ]
  }), []);

  const tabs = [
    { 
      id: 'general', 
      label: 'Общие данные', 
      icon: LayoutDashboard,
      gradient: 'from-violet-600 to-indigo-600 shadow-indigo-500/30',
      inactiveStyle: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20'
    },
    { 
      id: 'lifts', 
      label: 'Лифты', 
      icon: ArrowUpFromLine,
      gradient: 'from-emerald-500 to-teal-600 shadow-emerald-500/30',
      inactiveStyle: 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-500/10 hover:bg-teal-100 dark:hover:bg-teal-500/20'
    },
    { 
      id: 'finance', 
      label: 'Финансы', 
      icon: Banknote,
      gradient: 'from-amber-500 to-orange-600 shadow-orange-500/30',
      inactiveStyle: 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-500/10 hover:bg-orange-100 dark:hover:bg-orange-500/20'
    },
    { 
      id: 'montag', 
      label: 'Монтаж', 
      icon: Hammer,
      gradient: 'from-cyan-500 to-blue-600 shadow-blue-500/30',
      inactiveStyle: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20'
    },
  ];

  return (
    <div className="w-full space-y-8">
      
      {/* Tab Navigation Menu */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:w-auto bg-white dark:bg-[#151923] p-1.5 rounded-2xl border border-gray-200 dark:border-white/5 flex overflow-x-auto scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`
                  flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 whitespace-nowrap
                  ${isActive 
                    ? `bg-gradient-to-r ${tab.gradient} text-white shadow-lg transform scale-[1.02]` 
                    : tab.inactiveStyle
                  }
                `}
              >
                <Icon size={16} className={isActive ? 'text-white' : 'text-current'} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Optional: Date Range Picker or Actions can go here */}
        <div className="hidden sm:block text-xs font-mono text-gray-400">
           Last updated: Today, 12:00
        </div>
      </div>

      {/* Tab Content Area */}
      <div className="min-h-[400px] animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* 1. ОБЩИЕ ДАННЫЕ */}
        {activeTab === 'general' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 min-[2000px]:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-[#151923] p-6 rounded-3xl shadow-sm border border-gray-200 dark:border-white/5 transition-colors hover:border-indigo-500/20 dark:hover:border-indigo-500/20">
              <DynamicChart config={clientGrowthConfig} isDarkMode={isDarkMode} height="350px" />
            </div>
            <div className="bg-white dark:bg-[#151923] p-6 rounded-3xl shadow-sm border border-gray-200 dark:border-white/5 transition-colors hover:border-indigo-500/20 dark:hover:border-indigo-500/20">
              <DynamicChart config={testConfig} isDarkMode={isDarkMode} height="350px" />
            </div>
             <div className="bg-white dark:bg-[#151923] p-6 rounded-3xl shadow-sm border border-gray-200 dark:border-white/5 transition-colors hover:border-indigo-500/20 dark:hover:border-indigo-500/20">
              <DynamicChart config={elevatorsByCityConfig} isDarkMode={isDarkMode} height="350px" />
            </div>
          </div>
        )}

        {/* 2. ЛИФТЫ (Placeholder) */}
        {activeTab === 'lifts' && (
          <div className="flex flex-col items-center justify-center h-64 bg-white dark:bg-[#151923] rounded-3xl border border-dashed border-gray-300 dark:border-gray-700">
             <ArrowUpFromLine size={48} className="text-gray-300 dark:text-gray-600 mb-4" />
             <p className="text-gray-500 dark:text-gray-400 font-medium">Статистика по лифтам будет здесь</p>
             <p className="text-sm text-gray-400 mt-1">Настройте графики в конструкторе</p>
          </div>
        )}

        {/* 3. ФИНАНСЫ (Placeholder) */}
        {activeTab === 'finance' && (
          <div className="flex flex-col items-center justify-center h-64 bg-white dark:bg-[#151923] rounded-3xl border border-dashed border-gray-300 dark:border-gray-700">
             <Banknote size={48} className="text-gray-300 dark:text-gray-600 mb-4" />
             <p className="text-gray-500 dark:text-gray-400 font-medium">Финансовые показатели</p>
          </div>
        )}

        {/* 4. МОНТАЖ (Placeholder) */}
        {activeTab === 'montag' && (
          <div className="flex flex-col items-center justify-center h-64 bg-white dark:bg-[#151923] rounded-3xl border border-dashed border-gray-300 dark:border-gray-700">
             <Hammer size={48} className="text-gray-300 dark:text-gray-600 mb-4" />
             <p className="text-gray-500 dark:text-gray-400 font-medium">Данные по монтажу</p>
          </div>
        )}

      </div>
    </div>
  );
};

export default DashboardCharts;