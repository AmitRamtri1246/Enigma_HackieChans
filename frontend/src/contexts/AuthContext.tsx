import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService, User, RegisterData, LoginData } from '@/lib/auth-service';

interface AuthState {
  user: User | null;
  isLoading: boolean;  // true while checking /me on mount
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<User>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Restore session on mount
  useEffect(() => {
    authService.getCurrentUser()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, []);
  
  const login = useCallback(async (data: LoginData) => {
    const loggedInUser = await authService.login(data);
    setUser(loggedInUser);
  }, []);
  
  const register = useCallback(async (data: RegisterData) => {
    const newUser = await authService.register(data);
    setUser(newUser);
    return newUser;
  }, []);
  
  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);
  
  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated: user !== null,
      login,
      register,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
