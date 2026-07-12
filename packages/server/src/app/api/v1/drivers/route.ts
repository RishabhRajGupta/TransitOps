import { NextRequest, NextResponse } from "next/server";
import { withApiHandler } from "../../../../middleware/api-handler";
import { requireRole } from "../../../../middleware/rbac";
import { listDrivers, createDriver } from "../../../../services/driver.service";
import { createDriverSchema } from "@transitops/shared/schemas/driver.schema";

export const GET = withApiHandler(async (req: NextRequest, { user }: any) => {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || undefined;
  const status = searchParams.get("status") || undefined;

  const drivers = await listDrivers({ search, status });
  return NextResponse.json({ drivers });
}, { authenticate: true });

export const POST = withApiHandler(async (req: NextRequest, { user }: any) => {
  requireRole(user!, ["fleet_manager"]);

  const body = await req.json();
  const input = createDriverSchema.parse(body);

  const driver = await createDriver(input);
  return NextResponse.json({ driver }, { status: 201 });
}, { authenticate: true });
