import React, { ReactNode } from 'react';
import { Bell } from 'lucide-react';
import Sidebar from './Sidebar';
import { MenuItem, TabId } from '../types';

interface MainLayoutProps {
  children: ReactNode;
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  isCollapsed: boolean;
  setIsCollapsed: (val: boolean) => void;
  menuItems: MenuItem[];
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  activeTab,
  setActiveTab,
  isCollapsed,
  setIsCollapsed,
  menuItems,
  isDarkMode,
  toggleTheme
}) => {
  const currentTitle = menuItems.find(i => i.id === activeTab)?.label;

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-[#0b0f19] text-gray-800 dark:text-gray-100 font-sans overflow-hidden transition-colors duration-300">
      <Sidebar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        menuItems={menuItems}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
      />

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Background Blur Accents for Dark Mode */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
            <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-violet-600/10 rounded-full blur-3xl dark:block hidden"></div>
            <div className="absolute bottom-[-10%] left-[10%] w-80 h-80 bg-fuchsia-600/10 rounded-full blur-3xl dark:block hidden"></div>
        </div>

        {/* Header */}
        <header className="h-16 bg-white/80 dark:bg-[#151923]/80 backdrop-blur-md border-b border-gray-200 dark:border-white/5 flex items-center justify-between px-8 shadow-sm shrink-0 z-10 transition-colors duration-300">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white tracking-tight">
            {currentTitle}
          </h2>
          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-400 hover:text-indigo-600 dark:text-gray-500 dark:hover:text-violet-400 transition-colors relative cursor-pointer">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-fuchsia-500 rounded-full border border-white dark:border-[#151923] animate-pulse"></span>
            </button>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-8 z-10 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
          {children}
        </div>
      </main>
    </div>
  );
};

export default MainLayout;