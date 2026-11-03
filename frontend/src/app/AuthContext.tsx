import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, FarmerProfile, LoginPayload, RegisterPayload } from '../types/auth';
import { authService } from '../services/authService';
import { farmerService } from '../services/farmerService';
import { useLanguage } from './LanguageContext';

interface AuthContextType {
  user: User | null;
  profile: FarmerProfile | null;
  token: string | null;
  loading: boolean;
  login: (credentials: LoginPayload) => Promise<void>;
  register: (data: RegisterPayload) => Promise<void>;
  logout: () => void;
  updateLocalProfile: (newProfile: FarmerProfile) => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<FarmerProfile | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('mandimitra_token'));
  const [loading, setLoading] = useState<boolean>(true);
  const { syncWithProfile } = useLanguage();

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('mandimitra_token');
      if (storedToken) {
        try {
          const userData = await authService.getMe();
          setUser(userData);
          let userProfile = userData.profile;
          if (!userProfile) {
            userProfile = await farmerService.getProfile();
          }
          setProfile(userProfile);
          if (userProfile?.preferred_language) {
            syncWithProfile(userProfile.preferred_language);
          }
        } catch {
          // Token is invalid/expired
          localStorage.removeItem('mandimitra_token');
          setToken(null);
          setUser(null);
          setProfile(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginPayload) => {
    const res = await authService.login(credentials);
    localStorage.setItem('mandimitra_token', res.access_token);
    setToken(res.access_token);
    setUser(res.user);
    let prof = res.profile;
    if (!prof) {
      prof = await farmerService.getProfile();
    }
    setProfile(prof);
    if (prof?.preferred_language) {
      syncWithProfile(prof.preferred_language);
    }
  };

  const register = async (data: RegisterPayload) => {
    const res = await authService.register(data);
    localStorage.setItem('mandimitra_token', res.access_token);
    setToken(res.access_token);
    setUser(res.user);
    if (res.profile) {
      setProfile(res.profile);
      if (res.profile.preferred_language) {
        syncWithProfile(res.profile.preferred_language);
      }
    }
  };

  const logout = () => {
    localStorage.removeItem('mandimitra_token');
    setToken(null);
    setUser(null);
    setProfile(null);
  };

  const updateLocalProfile = (newProfile: FarmerProfile) => {
    setProfile(newProfile);
  };

  const refreshProfile = async () => {
    if (token) {
      try {
        const prof = await farmerService.getProfile();
        setProfile(prof);
      } catch (err) {
        console.error('Failed to refresh profile:', err);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        token,
        loading,
        login,
        register,
        logout,
        updateLocalProfile,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
