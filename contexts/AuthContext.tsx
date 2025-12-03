import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginAsGuest: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Check for persisted user on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('lunar_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const loginWithGoogle = async () => {
    setIsLoading(true);
    // SIMULATION: In a real app, this would be the Google Auth popup
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        const mockUser: User = {
          id: 'google_123',
          name: 'Cosmic Traveler',
          email: 'traveler@lunar.app',
          // Random avatar generator for visual flair
          avatar: `https://api.dicebear.com/9.x/micah/svg?seed=${Math.floor(Math.random() * 1000)}&backgroundColor=b6e3f4`
        };
        setUser(mockUser);
        localStorage.setItem('lunar_user', JSON.stringify(mockUser));
        setIsLoading(false);
        resolve();
      }, 1500); // Fake network delay
    });
  };

  const loginAsGuest = () => {
    // Guest doesn't have a user profile, but bypasses login screen
    setIsLoading(true);
    setTimeout(() => {
        setIsLoading(false);
    }, 500);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('lunar_user');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, loginWithGoogle, loginAsGuest, logout }}>
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