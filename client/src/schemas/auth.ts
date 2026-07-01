import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email adresi boş olamaz.")
    .email("Geçerli bir email adresi giriniz."),
  password: z
    .string()
    .min(1, "Şifre boş olamaz."),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  name: z
    .string()
    .min(2, "Ad en az 2 karakter olmalıdır.")
    .max(50, "Ad en fazla 50 karakter olabilir."),
  email: z
    .string()
    .min(1, "Email adresi boş olamaz.")
    .email("Geçerli bir email adresi giriniz."),
  password: z
    .string()
    .min(6, "Şifre en az 6 karakter olmalıdır.")
    .max(100, "Şifre en fazla 100 karakter olabilir."),
});

export type RegisterFormData = z.infer<typeof registerSchema>;
