import React from 'react';
import { Sparkles, Menu, ChevronLeft, Sun, Moon } from 'lucide-react';
import { MenuItem, TabId } from '../types';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  menuItems: MenuItem[];
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  isCollapsed, 
  setIsCollapsed, 
  activeTab, 
  setActiveTab, 
  menuItems,
  isDarkMode,
  toggleTheme
}) => {
  return (
    <aside 
      className={`
        ${isCollapsed ? 'w-20' : 'w-72'} 
        bg-[#1e293b] dark:bg-[#151923] text-white transition-all duration-300 ease-in-out relative flex flex-col shadow-2xl h-full border-r border-gray-200 dark:border-white/5 z-20
      `}
    >
      {/* Logo Area */}
      <div className="h-16 flex items-center justify-center border-b border-gray-700/30 dark:border-white/5">
        <div className="flex items-center gap-3 overflow-hidden px-4">
          <div className="bg-gradient-to-br from-violet-500 to-fuchsia-500 p-2 rounded-xl shrink-0 shadow-lg shadow-violet-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className={`font-bold text-xl whitespace-nowrap transition-opacity duration-200 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>
            CCM <span className="text-indigo-400 dark:text-violet-400">Dash</span>
          </span>
        </div>
      </div>

      {/* Toggle Button */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-20 bg-white dark:bg-[#1e2433] text-gray-500 dark:text-gray-300 p-1.5 rounded-full shadow-lg hover:text-indigo-600 dark:hover:text-violet-400 transition-colors z-10 border border-gray-200 dark:border-gray-700 cursor-pointer"
      >
        {isCollapsed ? <Menu size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto scrollbar-none">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`
                w-full flex items-center gap-4 px-3 py-3.5 rounded-xl transition-all duration-200 group cursor-pointer relative overflow-hidden
                ${isActive 
                  ? 'text-white shadow-lg shadow-violet-900/20' 
                  : 'text-slate-400 hover:bg-slate-800/50 dark:hover:bg-white/5 hover:text-white'
                }
              `}
              title={isCollapsed ? item.label : ''}
            >
              {/* Gradient Background for Active State */}
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 opacity-100"></div>
              )}

              <Icon className={`w-5 h-5 shrink-0 relative z-10 ${isActive ? 'text-white' : 'group-hover:text-violet-300'}`} />
              <span className={`relative z-10 font-medium whitespace-nowrap transition-all duration-300 ${isCollapsed ? 'opacity-0 translate-x-4 w-0 overflow-hidden' : 'opacity-100 translate-x-0'}`}>
                {item.label}
              </span>
              
              {/* Active indicator dot */}
              {!isCollapsed && isActive && (
                <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-white shadow-sm z-10"></div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Sidebar */}
      <div className="p-4 border-t border-gray-700/30 dark:border-white/5 shrink-0 bg-slate-800/20 dark:bg-black/10">
        <div className={`flex items-center gap-3 ${isCollapsed ? 'flex-col justify-center' : 'justify-between'}`}>
          
          {/* User Info Group */}
          <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-fuchsia-400 to-violet-400 shrink-0 border border-white/20"></div>
            {!isCollapsed && (
              <div className="overflow-hidden">
                <p className="text-sm font-medium text-white">Пользователь</p>
                <p className="text-xs text-slate-400 truncate">user@example.com</p>
              </div>
            )}
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-slate-700/50 dark:bg-white/5 text-slate-300 hover:text-yellow-300 hover:bg-slate-700 dark:hover:bg-white/10 transition-all cursor-pointer"
            title={isDarkMode ? "Включить светлую тему" : "Включить темную тему"}
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

        </div>
      </div>
    </aside>
  );
};

export default Sidebar;