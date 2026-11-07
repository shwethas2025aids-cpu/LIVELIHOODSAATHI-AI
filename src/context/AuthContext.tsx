'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, LanguageCode } from '@/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<boolean>;
  loginAsGuest: () => void;
  register: (name: string, email: string, password?: string, phone?: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (updatedFields: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USER: User = {
  id: 'usr-default-01',
  name: 'Shwetha S',
  email: 'shwetha.s@livelihoodsaathi.org',
  phone: '+91 98765 43210',
  role: 'Aspiring Tech Professional',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  languagePreference: 'ta-IN',
  educationLevel: 'Bachelor of Technology (B.Tech - AI & DS)',
  targetCareer: 'Full-Stack Developer & AI Solutions Specialist',
  currentSkills: ['Python', 'HTML/CSS', 'Basic JavaScript', 'SQL'],
  interests: ['Artificial Intelligence', 'Web Development', 'Clean Tech', 'Rural Entrepreneurship'],
  location: 'Tamil Nadu, India',
  completedAssessment: true,
  createdAt: new Date().toISOString(),
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('livelihoodsaathi_user');
      if (stored) {
        setUser(JSON.parse(stored));
      } else {
        // Provide demo user as initial state so the user experiences full app features immediately
        setUser(DEMO_USER);
        localStorage.setItem('livelihoodsaathi_user', JSON.stringify(DEMO_USER));
      }
    } catch {
      setUser(DEMO_USER);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, _password?: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Simulate/call API
      const loggedUser: User = {
        ...DEMO_USER,
        email,
        name: email.split('@')[0] || 'User',
      };
      setUser(loggedUser);
      localStorage.setItem('livelihoodsaathi_user', JSON.stringify(loggedUser));
      return true;
    } catch {
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const loginAsGuest = () => {
    const guestUser: User = {
      id: `guest-${Date.now()}`,
      name: 'Guest Learner',
      email: 'guest@livelihoodsaathi.ai',
      role: 'Explorer',
      languagePreference: 'ta-IN',
      currentSkills: ['Mobile Basics', 'Communication'],
      interests: ['Career Discovery', 'New Skills'],
      completedAssessment: false,
      createdAt: new Date().toISOString(),
    };
    setUser(guestUser);
    localStorage.setItem('livelihoodsaathi_user', JSON.stringify(guestUser));
  };

  const register = async (name: string, email: string, _password?: string, phone?: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const newUser: User = {
        id: `usr-${Date.now()}`,
        name,
        email,
        phone,
        role: 'Job Seeker & Skill Learner',
        languagePreference: 'ta-IN',
        currentSkills: [],
        interests: [],
        completedAssessment: false,
        createdAt: new Date().toISOString(),
      };
      setUser(newUser);
      localStorage.setItem('livelihoodsaathi_user', JSON.stringify(newUser));
      return true;
    } catch {
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('livelihoodsaathi_user');
  };

  const updateUser = (updatedFields: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...updatedFields };
    setUser(updated);
    localStorage.setItem('livelihoodsaathi_user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        loginAsGuest,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
