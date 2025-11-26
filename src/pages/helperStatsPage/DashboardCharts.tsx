
import React, { useState } from 'react';
import { LayoutDashboard, ArrowUpFromLine, Banknote, Hammer, FlaskConical } from 'lucide-react';
import GeneralTab from './GeneralTab';
import TestTab from './TestTab';
import LiftsTab from './LiftsTab';
import FinanceTab from './FinanceTab';
import MontagTab from './MontagTab';
import ElevatorTab from './ElevatorTab';

interface DashboardChartsProps {
  isDarkMode: boolean;
}

type TabType = 'general' | 'elevator_tab' | 'test' | 'lifts' | 'finance' | 'montag';

const DashboardCharts: React.FC<DashboardChartsProps> = ({ isDarkMode }) => {
  const [activeTab, setActiveTab] = useState<TabType>('general');

  const tabs = [
    { 
      id: 'general', 
      label: 'Общие данные', 
      icon: LayoutDashboard,
      gradient: 'from-violet-600 to-indigo-600 shadow-indigo-500/30',
      inactiveStyle: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20'
    },
    { 
      id: 'elevator_tab', 
      label: 'Elevator Tab', 
      icon: LayoutDashboard,
      gradient: 'from-purple-600 to-pink-600 shadow-purple-500/30',
      inactiveStyle: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10 hover:bg-purple-100 dark:hover:bg-purple-500/20'
    },
    // { 
    //   id: 'test', 
    //   label: 'Тест', 
    //   icon: FlaskConical,
    //   gradient: 'from-pink-500 to-rose-500 shadow-rose-500/30',
    //   inactiveStyle: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20'
    // },
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
      </div>

      {/* Tab Content Area */}
      <div className="min-h-[400px] animate-in fade-in slide-in-from-bottom-4 duration-500">
        {activeTab === 'general' && <GeneralTab isDarkMode={isDarkMode} />}
        {activeTab === 'elevator_tab' && <ElevatorTab isDarkMode={isDarkMode} />}
        {activeTab === 'test' && <TestTab isDarkMode={isDarkMode} />}
        {activeTab === 'lifts' && <LiftsTab isDarkMode={isDarkMode} />}
        {activeTab === 'finance' && <FinanceTab isDarkMode={isDarkMode} />}
        {activeTab === 'montag' && <MontagTab isDarkMode={isDarkMode} />}
      </div>
    </div>
  );
};

export default DashboardCharts;
