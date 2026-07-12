import { NextRequest, NextResponse } from "next/server";
import { withApiHandler } from "../../../../middleware/api-handler";
import { requireRole } from "../../../../middleware/rbac";
import { listTrips, createTrip } from "../../../../services/trip.service";
import { createTripSchema } from "@transitops/shared/schemas/trip.schema";

export const GET = withApiHandler(async (req: NextRequest, { user }: any) => {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || undefined;

  const trips = await listTrips({ status });
  return NextResponse.json({ trips });
}, { authenticate: true });

export const POST = withApiHandler(async (req: NextRequest, { user }: any) => {
  requireRole(user!, ["fleet_manager"]);

  const body = await req.json();
  const input = createTripSchema.parse(body);

  const trip = await createTrip(input, user!.id);
  return NextResponse.json({ trip }, { status: 201 });
}, { authenticate: true });
