import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService, User, RegisterData, LoginData } from '@/lib/auth-service';
import { setPreviewRole } from '@/lib/use-preview-role';

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
  
  // Restore session on mount, syncing the demo preview role to the DB role.
  useEffect(() => {
    authService.getCurrentUser()
      .then((restored) => {
        setUser(restored);
        setPreviewRole(restored.role);
      })
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, []);
  
  const login = useCallback(async (data: LoginData) => {
    const loggedInUser = await authService.login(data);
    setUser(loggedInUser);
    // Open the workspace matching the account's stored role.
    setPreviewRole(loggedInUser.role);
  }, []);
  
  const register = useCallback(async (data: RegisterData) => {
    const newUser = await authService.register(data);
    setUser(newUser);
    setPreviewRole(newUser.role);
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
