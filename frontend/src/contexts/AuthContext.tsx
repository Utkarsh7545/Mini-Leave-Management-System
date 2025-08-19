import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthUser } from '../types';
import api, { handleApiError } from '../utils/api';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (userData: Partial<AuthUser>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on app start
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const savedUser = localStorage.getItem('user');

        if (token && savedUser) {
          // Verify token with backend
          const response = await api.get('/auth/me');
          
          if (response.data.success) {
            setUser(response.data.employee);
          } else {
            // Token is invalid, clear local storage
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        // Clear invalid token
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await api.post('/auth/login', { email, password });
      
      if (response.data.success) {
        const { token, employee } = response.data;
        
        // Store token and user data
        localStorage.setItem('authToken', token);
        localStorage.setItem('user', JSON.stringify(employee));
        
        setUser(employee);
        toast.success(`Welcome back, ${employee.name}!`);
        return true;
      } else {
        toast.error(response.data.message || 'Login failed');
        return false;
      }
    } catch (error) {
      const errorMessage = handleApiError(error);
      toast.error(errorMessage);
      return false;
    }
  };

  const logout = () => {
    // Clear local storage
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    
    // Clear user state
    setUser(null);
    
    toast.success('Logged out successfully');
  };

  const updateUser = (userData: Partial<AuthUser>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};