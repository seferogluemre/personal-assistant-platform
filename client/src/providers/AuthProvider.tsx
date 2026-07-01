"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { authService, type SafeUser } from "@/services/auth";

interface AuthContextType {
  user: SafeUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const PUBLIC_PATHS = ["/login", "/register"];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SafeUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // İlk yüklemede session kontrolü
  useEffect(() => {
    authService
      .me()
      .then((u) => setUser(u))
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, []);

  // Route koruma
  useEffect(() => {
    if (isLoading) return;

    const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

    if (!user && !isPublic) {
      router.replace("/login");
    }
    if (user && isPublic) {
      router.replace("/dashboard");
    }
  }, [user, isLoading, pathname, router]);

  const login = useCallback(async (email: string, password: string) => {
    const result = await authService.signIn(email, password);
    setUser(result.user);
    router.replace("/dashboard");
  }, [router]);

  const register = useCallback(async (email: string, password: string, name?: string) => {
    const result = await authService.signUp(email, password, name);
    setUser(result.user);
    router.replace("/dashboard");
  }, [router]);

  const logout = useCallback(async () => {
    await authService.signOut();
    setUser(null);
    router.replace("/login");
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
