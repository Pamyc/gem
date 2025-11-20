import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface User {
  id: string;
  username: string;
  password?: string; // В реальном приложении пароли не хранятся в открытом виде на фронте
  name: string;
  role: 'admin' | 'user';
}

// Хардкод список пользователей
export const HARDCODED_USERS: User[] = [
  { id: '1', username: 'admin', password: 'admin', name: 'Администратор', role: 'admin' },
];

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  usersList: User[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = (username: string, password: string) => {
    const foundUser = HARDCODED_USERS.find(
      (u) => u.username === username && u.password === password
    );

    if (foundUser) {
      // Не сохраняем пароль в стейте
      const { password, ...safeUser } = foundUser;
      setUser(safeUser as User);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, usersList: HARDCODED_USERS }}>
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