import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';

// --- Icons Components (Inline SVG for stability) ---
const MenuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
);

const HomeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
);

const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
);

const SettingsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
);

// --- Main Application Component ---

const App = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('home');

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const menuItems = [
    { id: 'home', label: 'Главная', icon: <HomeIcon /> },
    { id: 'about', label: 'О проекте', icon: <InfoIcon /> },
    { id: 'settings', label: 'Настройки', icon: <SettingsIcon /> },
  ];

  return (
    <div className="app-container">
      {/* Styles Injection */}
      <style>{`
        :root {
          --primary-color: #2563eb;
          --sidebar-bg: #1e293b;
          --sidebar-text: #e2e8f0;
          --sidebar-hover: #334155;
          --content-bg: #f8fafc;
          --text-color: #334155;
        }
        
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background: var(--content-bg);
          color: var(--text-color);
          height: 100vh;
          overflow: hidden;
        }

        .app-container {
          display: flex;
          height: 100vh;
          width: 100vw;
        }

        /* Sidebar Styles */
        .sidebar {
          background-color: var(--sidebar-bg);
          color: var(--sidebar-text);
          height: 100%;
          transition: width 0.3s ease;
          display: flex;
          flex-direction: column;
          box-shadow: 4px 0 10px rgba(0,0,0,0.1);
          z-index: 10;
        }

        .sidebar.open {
          width: 250px;
        }

        .sidebar.closed {
          width: 70px;
        }

        .sidebar-header {
          padding: 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 70px;
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }

        .brand-title {
          font-weight: 700;
          font-size: 1.2rem;
          white-space: nowrap;
          overflow: hidden;
          opacity: 1;
          transition: opacity 0.2s;
        }
        
        .sidebar.closed .brand-title {
          display: none;
          opacity: 0;
        }

        .toggle-btn {
          background: none;
          border: none;
          color: var(--sidebar-text);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 5px;
          border-radius: 4px;
          transition: background 0.2s;
        }

        .toggle-btn:hover {
          background: rgba(255,255,255,0.1);
        }

        .menu-items {
          list-style: none;
          margin-top: 20px;
          padding: 0 10px;
        }

        .menu-item {
          display: flex;
          align-items: center;
          padding: 12px;
          margin-bottom: 8px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
          overflow: hidden;
        }

        .menu-item:hover {
          background-color: var(--sidebar-hover);
        }

        .menu-item.active {
          background-color: var(--primary-color);
          color: white;
        }

        .menu-icon {
          min-width: 24px;
          display: flex;
          justify-content: center;
        }

        .menu-label {
          margin-left: 12px;
          opacity: 1;
          transition: opacity 0.2s;
        }

        .sidebar.closed .menu-label {
          opacity: 0;
          width: 0;
        }

        /* Main Content Styles */
        .main-content {
          flex: 1;
          padding: 40px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          transition: margin-left 0.3s ease;
        }

        .content-card {
          background: white;
          padding: 40px;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.05);
          text-align: center;
          max-width: 600px;
          width: 100%;
          animation: fadeIn 0.5s ease-out;
        }

        h1 {
          margin-bottom: 16px;
          font-size: 2.5rem;
          color: #1e293b;
        }

        p {
          font-size: 1.1rem;
          color: #64748b;
          line-height: 1.6;
        }

        .status-badge {
          display: inline-block;
          margin-top: 24px;
          padding: 8px 16px;
          background: #dcfce7;
          color: #166534;
          border-radius: 20px;
          font-weight: 600;
          font-size: 0.9rem;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Sidebar Component */}
      <nav className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          {isSidebarOpen && <span className="brand-title">Timeweb App</span>}
          <button className="toggle-btn" onClick={toggleSidebar}>
            <MenuIcon />
          </button>
        </div>
        <ul className="menu-items">
          {menuItems.map((item) => (
            <li 
              key={item.id} 
              className={`menu-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <span className="menu-icon">{item.icon}</span>
              <span className="menu-label">{item.label}</span>
            </li>
          ))}
        </ul>
      </nav>

      {/* Main Content Area */}
      <main className="main-content">
        {activeTab === 'home' && (
          <div className="content-card">
            <h1>Добро пожаловать!</h1>
            <p>
              Это стартовая страница вашего приложения на <strong>Timeweb Cloud</strong>.
              Боковое меню слева поможет вам перемещаться по разделам.
            </p>
            <div className="status-badge">
              Статус: Система работает нормально
            </div>
          </div>
        )}
        
        {activeTab === 'about' && (
          <div className="content-card">
            <h1>О проекте</h1>
            <p>
              Данное приложение построено с использованием <strong>Express</strong> на бэкенде и 
              <strong> React</strong> на фронтенде.
            </p>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="content-card">
            <h1>Настройки</h1>
            <p>
              Здесь будут располагаться настройки вашего профиля и приложения.
              <br /><br />
              (Функционал в разработке)
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

const container = document.getElementById('root');
if (container) {
    const root = createRoot(container);
    root.render(<App />);
} else {
    // Fallback if root is missing (though unlikely in this environment)
    const newRoot = document.createElement('div');
    newRoot.id = 'root';
    document.body.appendChild(newRoot);
    createRoot(newRoot).render(<App />);
}
