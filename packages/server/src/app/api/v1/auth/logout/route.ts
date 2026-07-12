import { NextRequest, NextResponse } from "next/server";
import { withApiHandler } from "../../../../../middleware/api-handler";

export const POST = withApiHandler(async (req: NextRequest) => {
  const response = NextResponse.json({
    data: {
      success: true,
    },
  });

  // Clear httpOnly refresh cookie
  response.cookies.delete("refreshToken");

  return response;
});
