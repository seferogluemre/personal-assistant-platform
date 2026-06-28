import { Elysia } from "elysia";
import { jwtSetup, findUserById, formatSafeUser } from "..";

export const authPlugin = new Elysia({ name: "authPlugin" })
  .use(jwtSetup)
  .derive(async ({ jwt, cookie: { auth_token }, error }) => {
    // 1. Cookie yoksa user null
    if (!auth_token.value) {
      return { user: null };
    }

    // 2. JWT'yi doğrula
    const payload = await jwt.verify(auth_token.value);
    if (!payload || !payload.userId) {
      return { user: null };
    }

    // 3. Kullanıcıyı DB'den bul
    const user = await findUserById(payload.userId as string);
    if (!user) {
      return { user: null };
    }

    // 4. Güvenli kullanıcı objesini context'e ekle
    return { user: formatSafeUser(user) };
  })
  .macro(({ onBeforeHandle }) => ({
    /** Sadece giriş yapmış kullanıcılar girebilir */
    requireAuth(value: boolean) {
      if (!value) return;
      onBeforeHandle(({ user, error }) => {
        if (!user) return error(401, { message: "Oturum açmanız gerekiyor." });
      });
    },
    /** Sadece bu yetkilere sahip olan roller girebilir */
    requirePermission(permission: string) {
      onBeforeHandle(({ user, error }) => {
        if (!user) return error(401, { message: "Oturum açmanız gerekiyor." });
        if (!user.role.permissions.includes(permission)) {
          return error(403, { message: "Bu işlem için yetkiniz yok." });
        }
      });
    }
  }));
