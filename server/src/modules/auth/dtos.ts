import { z } from "zod";

export const SignUpDto = z.object({
  email: z.string().email("Geçerli bir email giriniz."),
  password: z.string().min(6, "Şifre en az 6 karakter olmalıdır."),
  name: z.string().optional(),
});

export const SignInDto = z.object({
  email: z.string().email("Geçerli bir email giriniz."),
  password: z.string().min(1, "Şifre boş olamaz."),
});
