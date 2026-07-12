import { NextRequest, NextResponse } from "next/server";
import { withApiHandler } from "../../../../../middleware/api-handler";
import { requireRole } from "../../../../../middleware/rbac";
import { deleteDriver } from "../../../../../services/driver.service";

export const DELETE = withApiHandler(async (req: NextRequest, { user, params }: any) => {
  requireRole(user!, ["fleet_manager"]);
  
  const { id } = await params;
  await deleteDriver(id);
  
  return NextResponse.json({ success: true });
}, { authenticate: true });
