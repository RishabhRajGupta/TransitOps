import { NextRequest } from "next/server";
import { SignJWT, jwtVerify } from "jose";
import { UserRole } from "@transitops/shared/schemas/auth.schema";
import { AppError } from "../lib/errors";

const ACCESS_SECRET = new TextEncoder().encode(
  process.env.ACCESS_TOKEN_SECRET || "dev-access-secret-change-in-prod"
);
const REFRESH_SECRET = new TextEncoder().encode(
  process.env.REFRESH_TOKEN_SECRET || "dev-refresh-secret-change-in-prod"
);

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
}

export async function createAccessToken(payload: AuthUser) {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("5m")
    .sign(ACCESS_SECRET);
}

export async function createRefreshToken(payload: { id: string; email: string }) {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(REFRESH_SECRET);
}

export async function verifyAccessToken(token: string): Promise<AuthUser> {
  try {
    const { payload } = await jwtVerify(token, ACCESS_SECRET);
    return payload as unknown as AuthUser;
  } catch (err: any) {
    if (err.code === "ERR_JWT_EXPIRED") {
      throw new AppError("TOKEN_EXPIRED", "Access token has expired", 498);
    }
    throw new AppError("UNAUTHORIZED", "Invalid access token", 401);
  }
}

export async function verifyRefreshToken(token: string): Promise<{ id: string; email: string }> {
  try {
    const { payload } = await jwtVerify(token, REFRESH_SECRET);
    return payload as unknown as { id: string; email: string };
  } catch {
    throw new AppError("UNAUTHORIZED", "Invalid refresh token", 401);
  }
}

export async function extractUser(req: NextRequest): Promise<AuthUser> {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new AppError("UNAUTHORIZED", "Missing authorization header", 401);
  }
  const token = authHeader.split(" ")[1];
  return verifyAccessToken(token);
}
