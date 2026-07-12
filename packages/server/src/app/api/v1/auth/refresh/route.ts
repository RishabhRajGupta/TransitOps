import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "../../../../../lib/db";
import { users } from "@transitops/db/schema";
import { withApiHandler } from "../../../../../middleware/api-handler";
import { verifyRefreshToken, createAccessToken } from "../../../../../middleware/auth";
import { AppError } from "../../../../../lib/errors";

export const POST = withApiHandler(async (req: NextRequest) => {
  const cookieToken = req.cookies.get("refreshToken")?.value;
  if (!cookieToken) {
    throw new AppError("UNAUTHORIZED", "Missing refresh token cookie", 401);
  }

  const payload = await verifyRefreshToken(cookieToken);

  const user = await db.query.users.findFirst({
    where: eq(users.id, payload.id),
  });

  if (!user) {
    throw new AppError("UNAUTHORIZED", "User not found", 401);
  }

  const accessToken = await createAccessToken({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  return NextResponse.json({
    data: {
      accessToken,
    },
  });
});
