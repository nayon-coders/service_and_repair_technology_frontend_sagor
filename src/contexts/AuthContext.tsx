import React, { useState, useEffect, useCallback, ReactNode } from 'react';
import { User, LoginCredentials } from '../types';
import { loginAdmin, getCurrentUser, logoutAdmin } from '../services/authService';
import { AuthContext } from './authContextValue';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('auth_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize and verify authentication on app launch
  const checkAuth = useCallback(async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch {
      setUser(null);
      setToken(null);
      localStorage.removeItem('auth_token');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    const data = await loginAdmin(credentials);
    setUser(data.user);
    if (data.token) {
      setToken(data.token);
      localStorage.setItem('auth_token', data.token);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await logoutAdmin();
    } catch {
      // Continue client cleanup even if logout network call fails
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('auth_token');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
