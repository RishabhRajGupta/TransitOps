import { NextRequest, NextResponse } from "next/server";
import { withApiHandler } from "../../../../../middleware/api-handler";
import { getDashboardStats } from "../../../../../services/dashboard.service";

export const GET = withApiHandler(async (req: NextRequest) => {
  const stats = await getDashboardStats();
  return NextResponse.json({ data: stats });
}, { authenticate: true });
