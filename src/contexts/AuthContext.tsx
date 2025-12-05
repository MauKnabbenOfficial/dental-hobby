import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const MOCK_USER = {
  email: 'admin@dentaltrack.com',
  password: 'admin',
  name: 'Dr. Carlos Silva',
  role: 'admin'
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('dentaltrack_user');
    return stored ? JSON.parse(stored) : null;
  });

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    // Mock authentication
    if (email === MOCK_USER.email && password === MOCK_USER.password) {
      const userData = { email: MOCK_USER.email, name: MOCK_USER.name, role: MOCK_USER.role };
      setUser(userData);
      localStorage.setItem('dentaltrack_user', JSON.stringify(userData));
      return { success: true };
    }
    return { success: false, error: 'E-mail ou senha inválidos' };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('dentaltrack_user');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
