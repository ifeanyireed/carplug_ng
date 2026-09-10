"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import {
  AuthUser,
  getAuthToken,
  clearAuthToken,
  getStoredUser,
  setStoredUser,
  clearStoredUser,
  loginUser,
  registerUser,
  fetchMe,
} from "@/services/api";

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
  authModalMode: "login" | "signup";
  login: (payload: { email: string; password: string }) => Promise<void>;
  register: (payload: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    role?: string;
  }) => Promise<void>;
  logout: (redirectUrl?: string) => void;
  openAuthModal: (mode?: "login" | "signup") => void;
  closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<"login" | "signup">("login");

  // Revalidate authenticated session in background on mount
  useEffect(() => {
    const storedToken = getAuthToken();
    const storedUser = getStoredUser();

    if (!storedToken) {
      setIsLoading(false);
      return;
    }

    setTokenState(storedToken);
    if (storedUser) {
      setUser(storedUser);
      setIsLoading(false);
    }

    fetchMe()
      .then((currentUser) => {
        if (currentUser) {
          setUser(currentUser);
          setStoredUser(currentUser);
        } else {
          clearAuthToken();
          clearStoredUser();
          setTokenState(null);
          setUser(null);
        }
      })
      .catch(() => {
        // preserve cached user on network error
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const login = useCallback(async (payload: { email: string; password: string }) => {
    setIsLoading(true);
    try {
      const res = await loginUser(payload);
      setTokenState(res.token);
      setUser(res.user);
      setStoredUser(res.user);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(
    async (payload: {
      name: string;
      email: string;
      password: string;
      phone?: string;
      role?: string;
    }) => {
      setIsLoading(true);
      try {
        const res = await registerUser(payload);
        setTokenState(res.token);
        setUser(res.user);
        setStoredUser(res.user);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const logout = useCallback((redirectUrl?: string) => {
    clearAuthToken();
    clearStoredUser();
    setTokenState(null);
    setUser(null);
    if (typeof window !== "undefined") {
      const target = typeof redirectUrl === "string" ? redirectUrl : "/";
      window.location.href = target;
    }
  }, []);

  const openAuthModal = useCallback((mode: "login" | "signup" = "login") => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
  }, []);

  // Memoize the context value to prevent unnecessary re-renders of consuming components
  const contextValue = useMemo<AuthContextType>(
    () => ({
      user,
      token,
      isLoading,
      isAuthenticated: !!user,
      isAuthModalOpen,
      authModalMode,
      login,
      register,
      logout,
      openAuthModal,
      closeAuthModal,
    }),
    [
      user,
      token,
      isLoading,
      isAuthModalOpen,
      authModalMode,
      login,
      register,
      logout,
      openAuthModal,
      closeAuthModal,
    ]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
