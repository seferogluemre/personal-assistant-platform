import { prisma } from "../../config/prisma";
import type { z } from "zod";
import type { SignUpDto, SignInDto } from "./dtos";

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
    include: { role: true },
  });
}

export async function findUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    include: { role: true },
  });
}

export async function createUser(data: z.infer<typeof SignUpDto>) {
  // Varsayılan olarak "user" rolünü bul, yoksa hata at
  const userRole = await prisma.role.findUnique({ where: { name: "user" } });
  if (!userRole) throw new Error("Varsayılan 'user' rolü bulunamadı.");

  const hashedPassword = await Bun.password.hash(data.password, {
    algorithm: "bcrypt",
    cost: 10,
  });

  return prisma.user.create({
    data: {
      email: data.email,
      password: hashedPassword,
      name: data.name,
      roleId: userRole.id,
    },
    include: { role: true },
  });
}

export async function verifyPassword(password: string, hash: string) {
  return Bun.password.verify(password, hash);
}
