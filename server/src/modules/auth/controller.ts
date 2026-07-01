import { Elysia, t } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { SignUpDto, SignInDto } from "./dtos";
import { createUser, findUserByEmail, verifyPassword } from "./service";
import { formatSafeUser } from "./formatters";
import { authPlugin } from "./plugins/authPlugin";

// JWT Plugin Setup (Bunu ana uygulamada da kullanacağız)
export const jwtSetup = jwt({
  name: "jwt",
  secret: process.env.JWT_SECRET || "super-secret-yavuz-key",
});

export const authController = new Elysia({ prefix: "/auth" })
  .use(jwtSetup)

  // ── KAYIT OL ──────────────────────────────────────────────────
  .post(
    "/sign-up",
    async ({ body, set, jwt, cookie: { auth_token } }) => {
      const existing = await findUserByEmail(body.email);
      if (existing) {
        set.status = 400;
        return { message: "Bu email zaten kullanılıyor." };
      }

      const user = await createUser(body);
      const safeUser = formatSafeUser(user);

      // Token oluştur ve cookie'ye yaz
      const token = await jwt.sign({ userId: user.id });
      auth_token.set({
        value: token,
        httpOnly: true,
        maxAge: 7 * 86400, // 7 gün
        path: "/",
      });

      return { user: safeUser };
    },
    {
      body: t.Object({
        email: t.String(),
        password: t.String(),
        name: t.Optional(t.String()),
      }),
    }
  )

  // ── GİRİŞ YAP ─────────────────────────────────────────────────
  .post(
    "/sign-in",
    async ({ body, set, jwt, cookie: { auth_token } }) => {
      const user = await findUserByEmail(body.email);
      if (!user) {
        set.status = 401;
        return { message: "Hatalı email veya şifre." };
      }

      const isValid = await verifyPassword(body.password, user.password);
      if (!isValid) {
        set.status = 401;
        return { message: "Hatalı email veya şifre." };
      }

      const safeUser = formatSafeUser(user);
      const token = await jwt.sign({ userId: user.id });

      auth_token.set({
        value: token,
        httpOnly: true,
        maxAge: 7 * 86400, // 7 gün
        path: "/",
      });

      return { user: safeUser };
    },
    {
      body: t.Object({
        email: t.String(),
        password: t.String(),
      }),
    }
  )

  // ── ME / SESSION ──────────────────────────────────────────────
  .use(authPlugin)
  .get("/me", ({ user, set }) => {
    if (!user) {
      set.status = 401;
      return { message: "Oturum açılmamış." };
    }
    return user;
  })

  // ── ÇIKIŞ YAP ─────────────────────────────────────────────────
  .post("/sign-out", ({ cookie: { auth_token } }) => {
    auth_token.remove();
    return { success: true };
  });


