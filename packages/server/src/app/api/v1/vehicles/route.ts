import { NextRequest, NextResponse } from "next/server";
import { withApiHandler } from "../../../../middleware/api-handler";
import { requireRole } from "../../../../middleware/rbac";
import { listVehicles, createVehicle } from "../../../../services/vehicle.service";
import { createVehicleSchema } from "@transitops/shared/schemas/vehicle.schema";

export const GET = withApiHandler(async (req: NextRequest, { user }: any) => {
  // Can be called by any authenticated user for dashboard views
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || undefined;
  const type = searchParams.get("type") || undefined;
  const status = searchParams.get("status") || undefined;

  const vehicles = await listVehicles({ search, type, status });
  return NextResponse.json({ vehicles });
}, { authenticate: true });

export const POST = withApiHandler(async (req: NextRequest, { user }: any) => {
  requireRole(user!, ["fleet_manager"]);

  const body = await req.json();
  const input = createVehicleSchema.parse(body);

  const vehicle = await createVehicle(input);
  return NextResponse.json({ vehicle }, { status: 201 });
}, { authenticate: true });
