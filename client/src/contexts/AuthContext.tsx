import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from '../services/api';

interface User {
  _id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  memberSince?: string;
  phone?: string;
  dateOfBirth?: string;
  role?: 'user' | 'admin';
  isAdmin?: boolean;
  isActive: boolean;
  address?: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  accounts?: any[];
  transactions?: any[];
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (token: string, userData: User) => void;
  loginWithCredentials: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🚀 AuthContext: Component mounted, running checkAuth...');
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      console.log('🔍 AuthContext: checkAuth running...');
      console.log('🔍 Token exists:', !!token);
      console.log('🔍 Stored user exists:', !!storedUser);
      
      if (token && storedUser) {
        // Use stored user data instead of making API call
        const userData = JSON.parse(storedUser);
        console.log('✅ AuthContext: Restoring user from localStorage:', userData);
        setUser(userData);
      } else if (token) {
        // Only make API call if we have token but no stored user
        console.log('📡 AuthContext: Making API call to get profile...');
        const response = await authAPI.getProfile();
        setUser(response.data.user);
      } else {
        console.log('❌ AuthContext: No token found, user not authenticated');
      }
    } catch (error) {
      console.error('❌ Auth check failed:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } finally {
      console.log('🏁 AuthContext: checkAuth completed, setting loading to false');
      setLoading(false);
    }
  };

  const login = async (token: string, userData: User) => {
    console.log('🔐 AuthContext login called with:', { token: !!token, userData: !!userData });
    console.log('👤 User data details:', {
      _id: userData._id,
      username: userData.username,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: userData.role
    });
    
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    
    console.log('💾 Data saved to localStorage');
    setUser(userData);
    console.log('✅ User state set to:', userData);
    console.log('🔍 isAuthenticated will be:', !!userData);
    
    // Return a promise that resolves immediately
    return Promise.resolve();
  };

  const loginWithCredentials = async (username: string, password: string) => {
    try {
      const response = await authAPI.login(username, password);
      const { token, user: userData } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
    }
  };

  // Debug user state changes
  useEffect(() => {
    console.log('👤 AuthContext: User state changed:', user);
    console.log('🔐 AuthContext: isAuthenticated is now:', !!user);
  }, [user]);

  const value = {
    user,
    loading,
    login,
    loginWithCredentials,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 