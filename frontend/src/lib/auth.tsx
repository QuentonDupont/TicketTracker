"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserRole } from '@/types';
import { saveUserProfile } from '@/lib/user-profiles';

interface User {
  id: string;
  name: string;
  email: string;
  role?: UserRole;
  avatar?: string;   // base64 data URL or empty
  jobTitle?: string; // freeform job title
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: Partial<Pick<User, 'name' | 'avatar' | 'jobTitle'>>) => void;
  isLoading: boolean;
}

// Mock user database
const MOCK_USERS = [
  {
    email: 'quentondupont@gmail.com',
    password: '1234567',
    name: 'Quenton Dupont',
    id: 'user_quenton'
  },
  {
    email: 'admin@tickettracker.com',
    password: 'admin123',
    name: 'Admin User',
    id: 'user_admin'
  }
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check for existing session on mount
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (token) {
          // In a real app, validate token with backend
          const userData = localStorage.getItem('user_data');
          if (userData) {
            setUser(JSON.parse(userData));
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check against mock user database
      const mockUser = MOCK_USERS.find(u => u.email === email && u.password === password);

      if (mockUser) {
        // Load role from user_roles localStorage
        let userRole: UserRole = 'member';
        try {
          const rolesData = localStorage.getItem('user_roles');
          if (rolesData) {
            const roles = JSON.parse(rolesData);
            userRole = roles[mockUser.id] || 'member';
          }
        } catch { /* default to member */ }
        // Default roles for known users
        if (mockUser.id === 'user_quenton' && userRole === 'member') userRole = 'super_admin';
        if (mockUser.id === 'user_admin' && userRole === 'member') userRole = 'admin';

        const userData: User = {
          id: mockUser.id,
          name: mockUser.name,
          email: mockUser.email,
          role: userRole,
        };

        setUser(userData);
        localStorage.setItem('auth_token', 'demo_token');
        localStorage.setItem('user_data', JSON.stringify(userData));
        saveUserProfile({ userId: userData.id, name: userData.name, role: userRole, email: userData.email });
        return true;
      }

      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const userData: User = {
        id: Date.now().toString(),
        name: name,
        email: email
      };
      
      setUser(userData);
      localStorage.setItem('auth_token', 'demo_token');
      localStorage.setItem('user_data', JSON.stringify(userData));
      return true;
    } catch (error) {
      console.error('Registration failed:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = (updates: Partial<Pick<User, 'name' | 'avatar' | 'jobTitle'>>) => {
    setUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates };
      localStorage.setItem('user_data', JSON.stringify(updated));
      saveUserProfile({ userId: updated.id, name: updated.name, avatar: updated.avatar, jobTitle: updated.jobTitle, role: updated.role, email: updated.email });
      return updated;
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    router.push('/auth/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateProfile, isLoading }}>
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

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}

