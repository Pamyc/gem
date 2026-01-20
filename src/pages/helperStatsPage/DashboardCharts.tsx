
import React, { useState, useEffect, useRef } from 'react';
import { LayoutDashboard, ArrowUpFromLine, Banknote, Hammer, FlaskConical, ArrowRightLeft } from 'lucide-react';
import GeneralTab from './GeneralTab';
import TestTab from './TestTab';
import LiftsTab from './LiftsTab';
import FinanceTab from './FinanceTab';
import MontagTab from './MontagTab';
import ElevatorTab from './ElevatorTab';
import ComparisonTab from './ComparisonTab';

interface DashboardChartsProps {
  isDarkMode: boolean;
}

type TabType = 'general' | 'elevator_tab' | 'test' | 'lifts' | 'finance' | 'montag' | 'comparison';
type PanelState = 'active' | 'hidden';

const DashboardCharts: React.FC<DashboardChartsProps> = ({ isDarkMode }) => {
  const [activeTab, setActiveTab] = useState<TabType>('general');
  
  // Sticky & Animation State
  const [isSticky, setIsSticky] = useState(false);
  const [panelState, setPanelState] = useState<PanelState>('active');

  // Timers refs
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = () => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = null;
  };

  useEffect(() => {
    const container = document.getElementById('main-scroll-container');
    if (!container) return;

    const handleScroll = () => {
      const shouldBeSticky = container.scrollTop > 20;
      setIsSticky(shouldBeSticky);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-hide Effect based on Sticky State
  useEffect(() => {
    if (isSticky) {
      // Как только панель прилипла, запускаем таймер скрытия
      clearTimer();
      hideTimer.current = setTimeout(() => {
        setPanelState('hidden');
      }, 1500); // 1.5 сек задержка перед скрытием
    } else {
      // Если вернулись наверх - показываем панель
      setPanelState('active');
      clearTimer();
    }

    return () => clearTimer();
  }, [isSticky]);

  const handleMouseEnter = () => {
    // Пробуждение: мгновенный возврат
    clearTimer();
    setPanelState('active');
  };

  const handleMouseLeave = () => {
    // Запускаем скрытие только если панель "липкая"
    if (!isSticky) return;

    clearTimer();
    hideTimer.current = setTimeout(() => {
      setPanelState('hidden');
    }, 1000);
  };

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
      label: 'Лифты', 
      icon: ArrowUpFromLine,
      gradient: 'from-purple-600 to-pink-600 shadow-purple-500/30',
      inactiveStyle: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10 hover:bg-purple-100 dark:hover:bg-purple-500/20'
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
    { 
      id: 'comparison', 
      label: 'Сравнение', 
      icon: ArrowRightLeft,
      gradient: 'from-fuchsia-500 to-rose-600 shadow-rose-500/30',
      inactiveStyle: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20'
    },
  ];

  // Dynamic classes for sticky container
  const getStickyClasses = () => {
    const base = "sticky top-0 z-50 transition-all duration-700 ease-in-out origin-top";
    
    if (!isSticky) {
      return `${base} py-0`;
    }

    if (panelState === 'active') {
      return `${base} py-2 bg-slate-50/90 dark:bg-[#0b0f19]/10 backdrop-blur-md shadow-sm border-b border-gray-200/50 dark:border-white/5 -mx-8 px-8 scale-100 opacity-100 translate-y-0`;
    }

    // Hidden State
    return `${base} py-2 bg-transparent -mx-8 px-8 scale-90 opacity-0 -translate-y-4 pointer-events-auto`;
  };

  return (
    <div className="w-full space-y-8">
      
      {/* Tab Navigation Menu (Sticky) */}
      <div 
        className={getStickyClasses()}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div 
          className={`
            flex flex-col sm:flex-row items-center justify-between gap-4 transition-transform duration-300 origin-top
            ${isSticky && panelState === 'active' ? 'scale-95' : 'scale-100'}
          `}
        >
          <div className="w-full sm:w-auto bg-white dark:bg-[#151923] p-1.5 rounded-2xl border border-gray-200 dark:border-white/5 flex overflow-x-auto scrollbar-none shadow-sm">
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
      </div>

      {/* Tab Content Area */}
      <div className="min-h-[400px] animate-in fade-in slide-in-from-bottom-4 duration-500">
        {activeTab === 'general' && <GeneralTab isDarkMode={isDarkMode} />}
        {activeTab === 'elevator_tab' && <ElevatorTab isDarkMode={isDarkMode} />}
        {activeTab === 'test' && <TestTab isDarkMode={isDarkMode} />}
        {activeTab === 'lifts' && <LiftsTab isDarkMode={isDarkMode} />}
        {activeTab === 'finance' && <FinanceTab isDarkMode={isDarkMode} />}
        {activeTab === 'montag' && <MontagTab isDarkMode={isDarkMode} />}
        {activeTab === 'comparison' && <ComparisonTab isDarkMode={isDarkMode} />}
      </div>
    </div>
  );
};

export default DashboardCharts;
