import { z } from "zod";
import { USER_ROLES } from "@transitops/db/constants";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const userRoleSchema = z.enum(USER_ROLES);

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  role: userRoleSchema,
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type UserRole = z.infer<typeof userRoleSchema>;
