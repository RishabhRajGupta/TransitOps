import { eq, and, desc, ilike, sql } from "drizzle-orm";
import { db } from "../lib/db";
import { vehicles, trips } from "@transitops/db/schema";
import { CreateVehicleInput } from "@transitops/shared/schemas/vehicle.schema";
import { AppError } from "../lib/errors";
import { logger } from "../lib/logger";

export async function listVehicles(filters?: { search?: string; type?: string; status?: string }) {
  const conditions = [];

  if (filters?.search) {
    conditions.push(
      sql`(${vehicles.name} ILIKE ${'%' + filters.search + '%'} OR ${vehicles.registrationNumber} ILIKE ${'%' + filters.search + '%'})`
    );
  }

  if (filters?.type && filters.type !== "All") {
    conditions.push(eq(vehicles.type, filters.type.toLowerCase() as any));
  }

  if (filters?.status && filters.status !== "All") {
    const statusMap: Record<string, string> = {
      "Available": "available",
      "On Trip": "on_trip",
      "In Shop": "in_shop",
      "Retired": "retired"
    };
    const mappedStatus = statusMap[filters.status];
    if (mappedStatus) {
      conditions.push(eq(vehicles.status, mappedStatus as any));
    }
  }

  const result = await db.query.vehicles.findMany({
    where: conditions.length > 0 ? and(...conditions) : undefined,
    orderBy: [desc(vehicles.createdAt)],
  });

  return result;
}

export async function createVehicle(input: CreateVehicleInput) {
  try {
    const [newVehicle] = await db.insert(vehicles)
      .values({
        registrationNumber: input.registrationNumber,
        name: input.name,
        type: input.type as any,
        maxLoadCapacityKg: String(input.maxLoadCapacityKg),
        acquisitionCost: String(input.acquisitionCost),
        odometerKm: input.odometerKm !== undefined ? String(input.odometerKm) : "0",
        status: (input.status as any) || "available",
      })
      .returning();
    
    return newVehicle;
  } catch (err: any) {
    // Postgres Unique Violation for registrationNumber
    if (err.code === "23505") {
      throw new AppError(
        "CONFLICT",
        `Registry Block: Registration number "${input.registrationNumber}" is already assigned to another vehicle.`,
        409
      );
    }
    throw err;
  }
}

export async function retireVehicle(id: string) {
  return db.transaction(async (tx: any) => {
    // Cannot retire a vehicle that is currently "on_trip"
    const vehicle = await tx.query.vehicles.findFirst({
      where: eq(vehicles.id, id)
    });

    if (!vehicle) {
      throw new AppError("NOT_FOUND", "Vehicle not found", 404);
    }

    if (vehicle.status === "on_trip") {
      throw new AppError(
        "BUSINESS_RULE_VIOLATION",
        "Cannot retire a vehicle that is currently dispatched on a trip.",
        409
      );
    }

    if (vehicle.status === "retired") {
      return vehicle; // Idempotent
    }

    const [retired] = await tx.update(vehicles)
      .set({ status: "retired", updatedAt: new Date() })
      .where(and(
        eq(vehicles.id, id),
        sql`${vehicles.status} IN ('available', 'in_shop')`
      ))
      .returning();

    if (!retired) {
      throw new AppError("CONFLICT", "Vehicle state changed before retirement.", 409);
    }

    return retired;
  });
}
