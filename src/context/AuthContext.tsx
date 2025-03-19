import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextData {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadStoredData() {
      try {
        const storedUser = await AsyncStorage.getItem('@CardCreator:user');
        
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Error loading stored authentication data', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadStoredData();
  }, []);

  async function signIn(email: string, password: string) {
    // In a real app, you would validate credentials against your API
    // This is a mock implementation for demo purposes
    try {
      setIsLoading(true);
      
      // Mock successful authentication
      const userData: User = {
        id: '1',
        email,
        name: 'User',
      };
      
      await AsyncStorage.setItem('@CardCreator:user', JSON.stringify(userData));
      
      setUser(userData);
    } finally {
      setIsLoading(false);
    }
  }

  async function signUp(name: string, email: string, password: string) {
    // In a real app, you would send registration data to your API
    // This is a mock implementation for demo purposes
    try {
      setIsLoading(true);
      
      // Mock successful registration
      const userData: User = {
        id: '1', 
        email,
        name,
      };
      
      await AsyncStorage.setItem('@CardCreator:user', JSON.stringify(userData));
      
      setUser(userData);
    } finally {
      setIsLoading(false);
    }
  }

  async function signOut() {
    try {
      setIsLoading(true);
      await AsyncStorage.removeItem('@CardCreator:user');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
} 