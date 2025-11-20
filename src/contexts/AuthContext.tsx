import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export interface User {
  id: string;
  username: string;
  password?: string; // В реальном приложении пароли не хранятся в открытом виде на фронте
  name: string;
  role: 'admin' | 'user';
}

// Хардкод список пользователей
export const HARDCODED_USERS: User[] = [
  { id: '0', username: 'integrat', password: 'integrat', name: 'Super Admin', role: 'admin' }, // Скрытый супер-админ
  { id: '1', username: 'admin', password: 'admin', name: 'Администратор', role: 'admin' },
];

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  usersList: User[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'ccm_elevator_user';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Инициализируем стейт, проверяя localStorage
  const [user, setUser] = useState<User | null>(() => {
    try {
      const savedUser = localStorage.getItem(STORAGE_KEY);
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (error) {
      console.error('Error parsing user from storage', error);
      return null;
    }
  });

  const login = (username: string, password: string) => {
    const foundUser = HARDCODED_USERS.find(
      (u) => u.username === username && u.password === password
    );

    if (foundUser) {
      // Не сохраняем пароль в стейте
      const { password, ...safeUser } = foundUser;
      setUser(safeUser as User);
      // Сохраняем сессию
      localStorage.setItem(STORAGE_KEY, JSON.stringify(safeUser));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  // Фильтруем список для отображения в таблице (скрываем integrat)
  const visibleUsers = HARDCODED_USERS.filter(u => u.username !== 'integrat');

  return (
    <AuthContext.Provider value={{ user, login, logout, usersList: visibleUsers }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};