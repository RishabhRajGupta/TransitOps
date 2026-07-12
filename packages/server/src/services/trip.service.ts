import { eq, and } from "drizzle-orm";
import { db } from "../lib/db";
import { trips, vehicles, drivers } from "@transitops/db/schema";
import { AppError } from "../lib/errors";

function todayISODate(): string {
  return new Date().toISOString().split("T")[0];
}

export async function dispatchTrip(tripId: string) {
  return db.transaction(async (tx) => {
    // 1. Atomically claim the TRIP نفسه — guards against double-dispatch of the same trip
    const [trip] = await tx
      .update(trips)
      .set({ status: "dispatched", dispatchedAt: new Date(), updatedAt: new Date() })
      .where(and(eq(trips.id, tripId), eq(trips.status, "draft")))
      .returning();

    if (!trip) {
      const existing = await tx.query.trips.findFirst({ where: eq(trips.id, tripId) });
      if (!existing) throw new AppError("NOT_FOUND", "Trip not found", 404);
      throw new AppError("BUSINESS_RULE_VIOLATION", `Trip is already ${existing.status}`, 409);
    }

    // 2. Compliance checks
    const driver = await tx.query.drivers.findFirst({ where: eq(drivers.id, trip.driverId) });
    if (!driver) throw new AppError("NOT_FOUND", "Driver not found", 404);
    if (driver.status === "suspended")
      throw new AppError("BUSINESS_RULE_VIOLATION", "Driver is suspended", 409);
    if (driver.licenseExpiryDate < todayISODate())
      throw new AppError("BUSINESS_RULE_VIOLATION", "Driver license has expired", 409);

    // 3. Atomically CLAIM the vehicle — this is the real race guard. If another
    //    request dispatched it a millisecond ago, status is no longer 'available'
    //    and this UPDATE matches zero rows.
    const [claimedVehicle] = await tx
      .update(vehicles)
      .set({ status: "on_trip", updatedAt: new Date() })
      .where(and(eq(vehicles.id, trip.vehicleId), eq(vehicles.status, "available")))
      .returning();
    if (!claimedVehicle)
      throw new AppError("CONFLICT", "Vehicle is no longer available", 409); // tx rolls back

    // 4. Same atomic claim for the driver
    const [claimedDriver] = await tx
      .update(drivers)
      .set({ status: "on_trip", updatedAt: new Date() })
      .where(and(eq(drivers.id, trip.driverId), eq(drivers.status, "available")))
      .returning();
    if (!claimedDriver)
      throw new AppError("CONFLICT", "Driver is no longer available", 409);

    return trip;
  });
}

export async function createTrip(input: any, createdById: string) {
  return db.transaction(async (tx) => {
    // Cargo weight checks
    const vehicle = await tx.query.vehicles.findFirst({ where: eq(vehicles.id, input.vehicleId) });
    if (!vehicle) throw new AppError("NOT_FOUND", "Vehicle not found", 404);
    if (Number(input.cargoWeightKg) > Number(vehicle.maxLoadCapacityKg)) {
      throw new AppError(
        "BUSINESS_RULE_VIOLATION",
        `Cargo weight ${input.cargoWeightKg}kg exceeds vehicle capacity ${vehicle.maxLoadCapacityKg}kg`,
        422
      );
    }

    // Check unique tripCode
    const existingCode = await tx.query.trips.findFirst({ where: eq(trips.tripCode, input.tripCode) });
    if (existingCode) {
      throw new AppError("CONFLICT", "Trip code already exists", 409);
    }

    const [newTrip] = await tx
      .insert(trips)
      .values({
        ...input,
        status: "draft",
        createdBy: createdById,
      })
      .returning();

    return newTrip;
  });
}
