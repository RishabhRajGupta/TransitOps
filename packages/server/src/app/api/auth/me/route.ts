import { NextRequest, NextResponse } from "next/server";
import { withApiHandler } from "../../../../middleware/api-handler";

export const GET = withApiHandler(
  async (req: NextRequest, { user }) => {
    return NextResponse.json({
      data: {
        user,
      },
    });
  },
  { authenticate: true }
);
