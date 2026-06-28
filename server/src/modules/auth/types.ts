// ─────────────────────────────────────────────
// Auth Modülü - TypeScript Tipleri
// ─────────────────────────────────────────────

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

export interface JwtPayload {
  userId: string;
}
