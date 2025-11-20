import React, { useState, useEffect } from 'react';
import { LayoutDashboard, FileText, Settings, BarChart3 } from 'lucide-react';
import MainLayout from './layouts/MainLayout';
import HomePage from './pages/HomePage';
import StatsPage from './pages/StatsPage';
import FormPage from './pages/FormPage';
import SettingsPage from './pages/SettingsPage';
import { TabId, MenuItem } from './types';
import { DataProvider } from './contexts/DataContext';

const App: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('home');
  
  // Состояние темы (по умолчанию светлая)
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Эффект для применения класса dark к html тегу
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  const menuItems: MenuItem[] = [
    { id: 'home', label: 'Главная', icon: LayoutDashboard },
    { id: 'stats', label: 'Статистика', icon: BarChart3 },
    { id: 'form', label: 'Заявка', icon: FileText },
    { id: 'settings', label: 'Настройки', icon: Settings },
  ];

  return (
    <DataProvider>
      <MainLayout
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        menuItems={menuItems}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
      >
        {activeTab === 'home' && <HomePage />}
        {activeTab === 'stats' && <StatsPage isDarkMode={isDarkMode} />}
        {activeTab === 'form' && <FormPage />}
        {activeTab === 'settings' && <SettingsPage />}
      </MainLayout>
    </DataProvider>
  );
};

export default App;