import { NextRequest, NextResponse } from "next/server";
import { withApiHandler } from "../../../../../../middleware/api-handler";
import { requireRole } from "../../../../../../middleware/rbac";
import { retireVehicle } from "../../../../../../services/vehicle.service";

export const POST = withApiHandler(async (req: NextRequest, { params, user }: any) => {
  requireRole(user!, ["fleet_manager"]);

  const { id } = params;
  const vehicle = await retireVehicle(id);

  return NextResponse.json({ vehicle });
}, { authenticate: true });
