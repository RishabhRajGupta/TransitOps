import { NextRequest, NextResponse } from "next/server";
import { withApiHandler } from "../../../../../../middleware/api-handler";
import { requireRole } from "../../../../../../middleware/rbac";
import { updateDriverStatus } from "../../../../../../services/driver.service";
import { z } from "zod";

const updateStatusSchema = z.object({
  status: z.enum(["available", "on_trip", "off_duty", "suspended"]),
});

export const PATCH = withApiHandler(async (req: NextRequest, { user, params }: any) => {
  requireRole(user!, ["fleet_manager", "safety_officer"]);
  
  const { id } = await params;
  const body = await req.json();
  const { status } = updateStatusSchema.parse(body);

  const driver = await updateDriverStatus(id, status);
  return NextResponse.json({ driver });
}, { authenticate: true });
