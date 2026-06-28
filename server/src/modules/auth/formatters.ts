import type { SafeUser } from "./types";

export function formatSafeUser(user: any): SafeUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: {
      id: user.role.id,
      name: user.role.name,
      permissions: user.role.permissions as string[],
    },
  };
}
