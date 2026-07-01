const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export interface SafeUser {
  id: string;
  email: string;
  name: string | null;
  role: {
    id: string;
    name: string;
    permissions: string[];
  };
}

interface AuthResponse {
  user: SafeUser;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include", // Cookie'leri otomatik gönder
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Bir hata oluştu.");
  }

  return data as T;
}

export const authService = {
  async signIn(email: string, password: string): Promise<AuthResponse> {
    return request<AuthResponse>("/auth/sign-in", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  async signUp(email: string, password: string, name?: string): Promise<AuthResponse> {
    return request<AuthResponse>("/auth/sign-up", {
      method: "POST",
      body: JSON.stringify({ email, password, name }),
    });
  },

  async signOut(): Promise<void> {
    await request("/auth/sign-out", { method: "POST" });
  },

  async me(): Promise<SafeUser> {
    return request<SafeUser>("/auth/me");
  },
};
