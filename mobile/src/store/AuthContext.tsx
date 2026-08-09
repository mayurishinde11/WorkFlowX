import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginPayload, RegisterPayload } from '../types/auth.types';
import { loginRequest, registerRequest, getMeRequest } from '../api/authApi';
import { saveTokens, clearTokens, getAccessToken } from '../services/tokenStorage';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkExistingSession();
  }, []);

  async function checkExistingSession() {
    try {
      const token = await getAccessToken();
      if (!token) {
        setIsLoading(false);
        return;
      }

      const response = await getMeRequest();
      setUser(response.data.user);
    } catch (error) {
      await clearTokens();
    } finally {
      setIsLoading(false);
    }
  }

  async function login(payload: LoginPayload) {
    const response = await loginRequest(payload);
    const { user: loggedInUser, accessToken, refreshToken } = response.data;
    await saveTokens(accessToken, refreshToken);
    setUser(loggedInUser);
  }

  async function register(payload: RegisterPayload) {
    const response = await registerRequest(payload);
    const { user: newUser, accessToken, refreshToken } = response.data;
    await saveTokens(accessToken, refreshToken);
    setUser(newUser);
  }

  async function logout() {
    await clearTokens();
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}