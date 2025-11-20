import React, { useState } from 'react';
import { LayoutDashboard, FileText, Settings, BarChart3 } from 'lucide-react';
import MainLayout from './layouts/MainLayout';
import HomePage from './pages/HomePage';
import StatsPage from './pages/StatsPage';
import FormPage from './pages/FormPage';
import SettingsPage from './pages/SettingsPage';
import { TabId, MenuItem } from './types';

const App: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('home');

  const menuItems: MenuItem[] = [
    { id: 'home', label: 'Главная', icon: LayoutDashboard },
    { id: 'stats', label: 'Статистика', icon: BarChart3 },
    { id: 'form', label: 'Заявка', icon: FileText },
    { id: 'settings', label: 'Настройки', icon: Settings },
  ];

  return (
    <MainLayout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      isCollapsed={isCollapsed}
      setIsCollapsed={setIsCollapsed}
      menuItems={menuItems}
    >
      {activeTab === 'home' && <HomePage />}
      {activeTab === 'stats' && <StatsPage />}
      {activeTab === 'form' && <FormPage />}
      {activeTab === 'settings' && <SettingsPage />}
    </MainLayout>
  );
};

export default App;