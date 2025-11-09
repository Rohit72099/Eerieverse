import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  username: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: { username: string; email: string; password: string; name: string }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // useEffect(() => {
  //   // Check if user is stored in localStorage
  //   const storedUser = localStorage.getItem('user');
  //   if (storedUser) {
  //     setUser(JSON.parse(storedUser));
  //   }
  //   setLoading(false);
  // }, []);

  useEffect(() => {
  const storedUser = localStorage.getItem('user');

  if (storedUser) {
    try {
      const parsedUser = JSON.parse(storedUser);
      // Only set if it's actually an object with expected fields
      if (parsedUser && typeof parsedUser === 'object' && parsedUser.email) {
        setUser(parsedUser);
      } else {
        console.warn('Invalid user object in localStorage:', parsedUser);
        localStorage.removeItem('user');
      }
    } catch (err) {
      console.error('Error parsing stored user JSON:', err);
      localStorage.removeItem('user'); // remove corrupted entry
    }
  }

  setLoading(false);
}, []);


  const login = async (email: string, password: string) => {
    try {
      const data = await authAPI.login({ email, password });
      setUser(data.user);
      localStorage.setItem('user', JSON.stringify(data.user));
      toast({
        title: "Welcome back!",
        description: "You've successfully logged in.",
      });
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.response?.data?.message || "Invalid credentials",
        variant: "destructive",
      });
      throw error;
    }
  };

  const register = async (userData: { username: string; email: string; password: string; name: string }) => {
    try {
      const data = await authAPI.register(userData);
      setUser(data.user);
      localStorage.setItem('user', JSON.stringify(data.user));
      toast({
        title: "Account created!",
        description: "Welcome to EerieVerse.",
      });
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.response?.data?.message || "Unable to create account",
        variant: "destructive",
      });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
      setUser(null);
      localStorage.removeItem('user');
      toast({
        title: "Logged out",
        description: "See you next time!",
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
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
