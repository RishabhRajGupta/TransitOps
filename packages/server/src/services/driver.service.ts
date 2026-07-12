import { eq, and, desc, ilike, sql } from "drizzle-orm";
import { db } from "../lib/db";
import { drivers, users } from "@transitops/db/schema";
import { CreateDriverInput } from "@transitops/shared/schemas/driver.schema";
import { AppError } from "../lib/errors";

export async function listDrivers(filters?: { search?: string; status?: string }) {
  const conditions = [];

  if (filters?.search) {
    conditions.push(
      sql`(${drivers.name} ILIKE ${'%' + filters.search + '%'} OR ${drivers.licenseNumber} ILIKE ${'%' + filters.search + '%'})`
    );
  }

  if (filters?.status && filters.status !== "All") {
    const statusMap: Record<string, string> = {
      "Available": "available",
      "On Trip": "on_trip",
      "Off Duty": "off_duty",
      "Suspended": "suspended"
    };
    const mappedStatus = statusMap[filters.status];
    if (mappedStatus) {
      conditions.push(eq(drivers.status, mappedStatus as any));
    }
  }

  const result = await db.query.drivers.findMany({
    where: conditions.length > 0 ? and(...conditions) : undefined,
    orderBy: [desc(drivers.createdAt)],
  });

  return result;
}

export async function createDriver(input: CreateDriverInput) {
  // Check for duplicate license number
  const existing = await db.query.drivers.findFirst({
    where: eq(drivers.licenseNumber, input.licenseNumber),
  });

  if (existing) {
    throw new AppError("DUPLICATE_DRIVER", "A driver with this license number already exists", 400);
  }

  const [driver] = await db
    .insert(drivers)
    .values({
      name: input.name,
      licenseNumber: input.licenseNumber,
      licenseCategory: input.licenseCategory,
      licenseExpiryDate: input.licenseExpiryDate,
      contactNumber: input.contactNumber,
      safetyScore: input.safetyScore ?? 100,
      status: input.status ?? "available",
    })
    .returning();

  return driver;
}

export async function updateDriverStatus(id: string, status: string) {
  const [driver] = await db
    .update(drivers)
    .set({
      status: status as any,
      updatedAt: new Date(),
    })
    .where(eq(drivers.id, id))
    .returning();

  if (!driver) {
    throw new AppError("NOT_FOUND", "Driver not found", 404);
  }

  return driver;
}

export async function deleteDriver(id: string) {
  // Check if driver exists
  const existing = await db.query.drivers.findFirst({
    where: eq(drivers.id, id),
  });

  if (!existing) {
    throw new AppError("NOT_FOUND", "Driver not found", 404);
  }

  // A hard delete for offboarding. (If trips exist, this will fail due to FK constraints)
  // In a real app we might soft-delete or check trips first. We will use hard delete.
  await db.delete(drivers).where(eq(drivers.id, id));

  return { success: true };
}
