import React, { useState, useEffect } from 'react';
import { FileText, Settings, BarChart3, Database, PenTool } from 'lucide-react';
import MainLayout from './layouts/MainLayout';
import HomePage from './pages/HomePage';
import StatsPage from './pages/StatsPage';
import FormPage from './pages/FormPage';
import SettingsPage from './pages/SettingsPage';
import LoginPage from './pages/LoginPage';
import ConstructorPage from './pages/ConstructorPage';
import { TabId, MenuItem } from './types';
import { DataProvider } from './contexts/DataContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Компонент-обертка для содержимого приложения, чтобы использовать useAuth
const AppContent: React.FC = () => {
  const { user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  // Статистика теперь первая вкладка и дефолтная
  const [activeTab, setActiveTab] = useState<TabId>('stats');
  
  // Состояние темы (по умолчанию темная)
  const [isDarkMode, setIsDarkMode] = useState(true);

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
    { id: 'stats', label: 'Статистика', icon: BarChart3 },
    { id: 'home', label: 'Источник данных', icon: Database },
    { id: 'constructor', label: 'Конструктор', icon: PenTool },
    { id: 'form', label: 'Пример 1', icon: FileText },
    { id: 'settings', label: 'Настройки', icon: Settings },
  ];

  // Если пользователь не авторизован, показываем страницу входа
  if (!user) {
    return <LoginPage />;
  }

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
        {activeTab === 'stats' && <StatsPage isDarkMode={isDarkMode} />}
        {activeTab === 'home' && <HomePage />}
        {activeTab === 'constructor' && <ConstructorPage isDarkMode={isDarkMode} />}
        {activeTab === 'form' && <FormPage />}
        {activeTab === 'settings' && <SettingsPage />}
      </MainLayout>
    </DataProvider>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;