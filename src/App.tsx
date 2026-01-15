
import React, { useState, useEffect, useMemo } from 'react';
import { FileText, Settings, BarChart3, Database, PenTool, Target, Layout, Filter, Copy, Box, Share2, Server, TableProperties, Trophy } from 'lucide-react';
import MainLayout from './layouts/MainLayout';
import HomePage from './pages/HomePage';
import StatsPage from './pages/StatsPage';
import ExamplePage from './pages/ExamplePage';
import SettingsPage from './pages/SettingsPage';
import LoginPage from './pages/LoginPage';
import ConstructorPage from './pages/ConstructorPage';
import CardConstructorPage from './pages/CardConstructorPage';
import KPIPage from './pages/KPIPage';
import FilterTestPage from './pages/FilterTestPage';
import Example2Page from './pages/Example2Page';
import Diagram3dPage from './pages/Diagram3dPage';
import TestEmbedChart from './pages/TestEmbedChart';
import ConnectionTestPage from './pages/ConnectionTestPage';
import CrudPage from './pages/CrudPage';
import TopTenPage from './pages/TopTenPage'; 
import { TabId, MenuItem } from './types';
import { DataProvider } from './contexts/DataContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Компонент-обертка для содержимого приложения
const AppContent: React.FC = () => {
  const { user } = useAuth();
  
  // Проверяем режим embed сразу при рендере
  const urlParams = new URLSearchParams(window.location.search);
  const isEmbed = urlParams.get('mode') === 'embed';
  // Тема может быть передана в URL для embed режима
  const urlTheme = urlParams.get('theme');

  // Sidebar закрыт по умолчанию
  const [isCollapsed, setIsCollapsed] = useState(true);
  // Статистика теперь первая вкладка и дефолтная
  const [activeTab, setActiveTab] = useState<TabId>('stats');
  
  // Состояние темы (по умолчанию темная, если не сказано иное)
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Эффект для применения класса dark к html тегу
  useEffect(() => {
    // В режиме embed уважаем параметр URL, иначе стейт
    const effectiveDarkMode = isEmbed ? (urlTheme === 'light' ? false : true) : isDarkMode;
    
    if (effectiveDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode, isEmbed, urlTheme]);

  // --- EMBED MODE ---
  // Если мы в режиме встраивания, рендерим ТОЛЬКО график, минуя авторизацию и лейаут
  if (isEmbed) {
    return (
      <DataProvider>
          <TestEmbedChart 
            isEmbed={true} 
            isDarkMode={urlTheme === 'light' ? false : true} 
          />
      </DataProvider>
    );
  }

  const mainColor = 'yellow';
  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  // Формируем меню в зависимости от прав пользователя
  const menuItems: MenuItem[] = useMemo(() => {
    const items: MenuItem[] = [
      { id: 'stats', label: 'Статистика', icon: BarChart3 },
      { id: 'top-ten', label: 'Топ-10 ЖК', icon: Trophy }, 
      { id: 'home', label: 'Источник данных', icon: Database },
      { id: 'diagram3d', label: '3D Диаграмма', icon: Box },
      { id: 'test-embed', label: 'Тест Embed', icon: Share2 },
      { id: 'db-gateway', label: 'Шлюз управления БД', icon: Server },
      { id: 'crud', label: 'CRUD Менеджер', icon: TableProperties },
      { id: 'constructor', label: 'Конструктор графиков', icon: PenTool },
      { id: 'card-constructor', label: 'Конструктор карточек', icon: Layout },
      { id: 'filter-test', label: 'Тест фильтров', icon: Filter },
      { id: 'kpi', label: 'KPI Примеры', icon: Target },
      { id: 'example2', label: 'Пример 2', icon: Copy }, 
      { id: 'example', label: 'Пример 1', icon: FileText },
      { id: 'settings', label: 'Настройки', icon: Settings },
    ];

    // Скрываем спец-страницы для всех, кроме '1' (Super Admin)
    if (user?.username !== '1') {
      return items.filter(item => 
        item.id !== 'constructor' && 
        item.id !== 'card-constructor' &&
        item.id !== 'filter-test' &&
        item.id !== 'example2' &&
        item.id !== 'diagram3d' &&
        item.id !== 'test-embed' &&
        item.id !== 'db-gateway' &&
        item.id !== 'crud' &&
        item.id !== 'top-ten' // Скрываем Топ-10 для обычных юзеров
      );
    }

    return items;
  }, [user]);

  // Защита роута: если пользователь на запрещенной вкладке -> редирект
  useEffect(() => {
    const restrictedTabs = ['constructor', 'card-constructor', 'filter-test', 'example2', 'diagram3d', 'test-embed', 'db-gateway', 'crud', 'top-ten'];
    if (restrictedTabs.includes(activeTab) && user?.username !== '1') {
      setActiveTab('stats');
    }
  }, [activeTab, user]);

  // Если пользователь не авторизован (и не embed), показываем страницу входа
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
          
          {/* Рендерим админские страницы только если пользователь имеет доступ */}
          {activeTab === 'top-ten' && user.username === '1' && <TopTenPage isDarkMode={isDarkMode} />}
          {activeTab === 'constructor' && user.username === '1' && <ConstructorPage isDarkMode={isDarkMode}  />}
          {activeTab === 'card-constructor' && user.username === '1' && <CardConstructorPage isDarkMode={isDarkMode} />}
          {activeTab === 'filter-test' && user.username === '1' && <FilterTestPage isDarkMode={isDarkMode} />}
          {activeTab === 'example2' && user.username === '1' && <Example2Page isDarkMode={isDarkMode} mainColor={mainColor} />}
          {activeTab === 'diagram3d' && user.username === '1' && <Diagram3dPage isDarkMode={isDarkMode} />}
          {activeTab === 'test-embed' && user.username === '1' && <TestEmbedChart isDarkMode={isDarkMode} />}
          {activeTab === 'db-gateway' && user.username === '1' && <ConnectionTestPage />}
          {activeTab === 'crud' && user.username === '1' && <CrudPage />}
          
          {activeTab === 'kpi' && <KPIPage isDarkMode={isDarkMode} />}
          
          {activeTab === 'example' && <ExamplePage isDarkMode={isDarkMode} />}
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
