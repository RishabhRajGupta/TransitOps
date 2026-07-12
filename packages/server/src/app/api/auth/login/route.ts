import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "../../../../lib/db";
import { users } from "@transitops/db/schema";
import { loginSchema } from "@transitops/shared/schemas/auth.schema";
import { withApiHandler } from "../../../../middleware/api-handler";
import { validateBody } from "../../../../middleware/validation";
import { createAccessToken, createRefreshToken } from "../../../../middleware/auth";
import { AppError } from "../../../../lib/errors";

export const POST = withApiHandler(async (req: NextRequest) => {
  const body = await validateBody(req, loginSchema);

  const user = await db.query.users.findFirst({
    where: eq(users.email, body.email),
  });

  if (!user || !(await bcrypt.compare(body.password, user.passwordHash))) {
    throw new AppError("INVALID_CREDENTIALS", "Invalid email or password", 401);
  }

  const accessToken = await createAccessToken({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  const refreshToken = await createRefreshToken({
    id: user.id,
    email: user.email,
  });

  const response = NextResponse.json({
    data: {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    },
  });

  // Set httpOnly refresh cookie
  response.cookies.set({
    name: "refreshToken",
    value: refreshToken,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: "/",
  });

  return response;
});
