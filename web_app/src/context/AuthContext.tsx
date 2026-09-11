"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import {
  AuthUser,
  getAuthToken,
  clearAuthToken,
  getStoredUser,
  setStoredUser,
  clearStoredUser,
  parseJwtPayload,
  isTokenExpired,
  loginUser,
  registerUser,
  fetchMe,
  upgradeUserRole,
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
  upgradeRole: (newRole: "seller" | "dealer" | "technician") => Promise<void>;
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

  // Revalidate authenticated session on mount without logging out on refresh
  useEffect(() => {
    let isMounted = true;

    const initSession = async () => {
      const storedToken = getAuthToken();
      if (!storedToken || isTokenExpired(storedToken)) {
        if (storedToken) {
          clearAuthToken();
          clearStoredUser();
        }
        if (isMounted) setIsLoading(false);
        return;
      }

      if (isMounted) {
        setTokenState(storedToken);
      }

      // Restore user immediately so client is authenticated without waiting for remote network
      const storedUser = getStoredUser();
      if (storedUser) {
        if (isMounted) {
          setUser(storedUser);
          setIsLoading(false);
        }
      } else {
        const claims = parseJwtPayload(storedToken);
        if (claims && claims.userId) {
          const fallbackUser: AuthUser = {
            id: claims.userId,
            name: claims.name || claims.email?.split("@")[0] || "User",
            email: claims.email || "",
            role: (claims.role as AuthUser["role"]) || "buyer",
            isVerified: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          if (isMounted) {
            setUser(fallbackUser);
            setIsLoading(false);
          }
          setStoredUser(fallbackUser);
        }
      }

      // Verify and sync latest profile with backend in background
      try {
        const { user: freshUser, isUnauthorized } = await fetchMe();
        if (!isMounted) return;

        if (freshUser) {
          setUser(freshUser);
          setStoredUser(freshUser);
        } else if (isUnauthorized) {
          // Only clear session if token was explicitly rejected with HTTP 401
          clearAuthToken();
          clearStoredUser();
          setTokenState(null);
          setUser(null);
        }
        // If server error or network issue (isUnauthorized === false), preserve current user session!
      } catch {
        // preserve active session on network failure
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initSession();

    return () => {
      isMounted = false;
    };
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

  const upgradeRole = useCallback(
    async (newRole: "seller" | "dealer" | "technician") => {
      setIsLoading(true);
      try {
        const res = await upgradeUserRole(newRole);
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
      upgradeRole,
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
      upgradeRole,
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
