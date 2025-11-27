import React from 'react';
import { Menu, ChevronLeft, Sun, Moon, LogOut } from 'lucide-react';
import { MenuItem, TabId } from '../types';
import { useAuth } from '../contexts/AuthContext';
import CCMLogo from '../components/CCMLogo';

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
  const { user, logout } = useAuth();

  return (
    <aside 
  className={`
    ${isCollapsed ? 'w-20' : 'w-72'} 
    bg-[#1e293b] dark:bg-[#151923] text-white transition-all duration-300 ease-in-out 
    relative flex flex-col shadow-2xl h-screen border-r border-gray-200 dark:border-white/5 z-20
  `}
>


      {/* Background Watermark Logo */}
<div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none z-0">
  <div className={`
  absolute top-[60%] left-[40%] -translate-x-1/2 -translate-y-1/2 
  ${isCollapsed
    ? 'w-[10rem] h-auto opacity-[0.15] pointer-events-none'
    : 'w-[30rem] h-auto opacity-[0.30] pointer-events-none'
  }
`}>
  <CCMLogo className="w-full h-full opacity-100" />
</div>

</div>



      {/* Toggle Button (Top Layer) */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-20 bg-white dark:bg-[#1e2433] text-gray-500 dark:text-gray-300 p-1.5 rounded-full shadow-lg hover:text-indigo-600 dark:hover:text-violet-400 transition-colors z-30 border border-gray-200 dark:border-gray-700 cursor-pointer"
      >
        {isCollapsed ? <Menu size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Content Wrapper (Above Background) */}
      <div className="flex flex-col h-full relative z-10">
        
        {/* Logo Header Area */}
        <div className="h-16 flex items-center justify-center border-b border-gray-700/30 dark:border-white/5 shrink-0 bg-[#1e293b]/80 dark:bg-[#151923]/80 backdrop-blur-[2px]">
          <div className="flex items-center gap-3 overflow-hidden px-4">
            <span className={`font-bold text-xl whitespace-nowrap transition-opacity duration-200 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>
              CCM <span className="text-indigo-400 dark:text-violet-400">Elevator</span>
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="py-6 px-3 space-y-2 overflow-y-auto scrollbar-none flex-1">
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
        <div className="p-4 border-t border-gray-700/30 dark:border-white/5 shrink-0 bg-[#1e293b]/80 dark:bg-[#151923]/80 backdrop-blur-[2px]">
          <div className={`flex items-center gap-3 ${isCollapsed ? 'flex-col justify-center' : 'justify-between'}`}>
            
            {/* User Info Group */}
            <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''} overflow-hidden`}>
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-fuchsia-400 to-violet-400 shrink-0 border border-white/20 flex items-center justify-center text-xs font-bold text-white">
                 {user?.username.substring(0, 2).toUpperCase()}
              </div>
              {!isCollapsed && (
                <div className="overflow-hidden">
                  <p className="text-sm font-medium text-white truncate max-w-[100px]">{user?.name}</p>
                  <p className="text-xs text-slate-400 truncate capitalize">{user?.role}</p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className={`flex items-center gap-2 ${isCollapsed ? 'flex-col mt-2' : ''}`}>
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-slate-700/50 dark:bg-white/5 text-slate-300 hover:text-yellow-300 hover:bg-slate-700 dark:hover:bg-white/10 transition-all cursor-pointer"
                title={isDarkMode ? "Включить светлую тему" : "Включить темную тему"}
              >
                {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
              </button>

              {/* Logout Button */}
               <button
                onClick={logout}
                className="p-2 rounded-lg bg-slate-700/50 dark:bg-white/5 text-slate-300 hover:text-red-400 hover:bg-slate-700 dark:hover:bg-white/10 transition-all cursor-pointer"
                title="Выйти"
              >
                <LogOut size={16} />
              </button>
            </div>

          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
