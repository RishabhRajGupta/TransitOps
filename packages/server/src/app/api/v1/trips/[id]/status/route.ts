import { NextRequest, NextResponse } from "next/server";
import { withApiHandler } from "../../../../../../middleware/api-handler";
import { requireRole } from "../../../../../../middleware/rbac";
import { updateTripStatus } from "../../../../../../services/trip.service";
import { z } from "zod";

const updateStatusSchema = z.object({
  status: z.enum(["dispatched", "completed", "cancelled"]),
});

export const PATCH = withApiHandler(async (req: NextRequest, { user, params }: any) => {
  requireRole(user!, ["fleet_manager", "driver"]);
  
  const { id } = await params;
  const body = await req.json();
  const { status } = updateStatusSchema.parse(body);

  const trip = await updateTripStatus(id, status);
  return NextResponse.json({ trip });
}, { authenticate: true });
