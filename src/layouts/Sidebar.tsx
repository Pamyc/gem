import React from 'react';
import { Sparkles, Menu, ChevronLeft } from 'lucide-react';
import { MenuItem, TabId } from '../types';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  menuItems: MenuItem[];
}

const Sidebar: React.FC<SidebarProps> = ({ 
  isCollapsed, 
  setIsCollapsed, 
  activeTab, 
  setActiveTab, 
  menuItems 
}) => {
  return (
    <aside 
      className={`
        ${isCollapsed ? 'w-20' : 'w-72'} 
        bg-slate-900 text-white transition-all duration-300 ease-in-out relative flex flex-col shadow-xl h-full
      `}
    >
      {/* Logo Area */}
      <div className="h-16 flex items-center justify-center border-b border-slate-700/50">
        <div className="flex items-center gap-3 overflow-hidden px-4">
          <div className="bg-indigo-500 p-2 rounded-lg shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className={`font-bold text-xl whitespace-nowrap transition-opacity duration-200 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>
            CCM Dashboard
          </span>
        </div>
      </div>

      {/* Toggle Button */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-20 bg-indigo-500 text-white p-1 rounded-full shadow-lg hover:bg-indigo-600 transition-colors z-10 border-2 border-slate-900 cursor-pointer"
      >
        {isCollapsed ? <Menu size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`
                w-full flex items-center gap-4 px-3 py-3 rounded-xl transition-all duration-200 group cursor-pointer
                ${isActive 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }
              `}
              title={isCollapsed ? item.label : ''}
            >
              <Icon className={`w-6 h-6 shrink-0 ${isActive ? 'text-white' : 'group-hover:text-indigo-400'}`} />
              <span className={`whitespace-nowrap transition-all duration-300 ${isCollapsed ? 'opacity-0 translate-x-4 w-0 overflow-hidden' : 'opacity-100 translate-x-0'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Footer Sidebar */}
      <div className="p-4 border-t border-slate-800 shrink-0">
        <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-400 to-purple-400 shrink-0 border-2 border-slate-700"></div>
          {!isCollapsed && (
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-white">Пользователь</p>
              <p className="text-xs text-slate-400 truncate">user@example.com</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;