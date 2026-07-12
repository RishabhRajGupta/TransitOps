import { eq, and, desc, sql } from "drizzle-orm";
import { db } from "../lib/db";
import { trips, vehicles, drivers } from "@transitops/db/schema";
import { CreateTripInput } from "@transitops/shared/schemas/trip.schema";
import { AppError } from "../lib/errors";

export async function listTrips(filters?: { status?: string }) {
  const conditions = [];

  if (filters?.status && filters.status !== "All") {
    const statusMap: Record<string, string> = {
      "Draft": "draft",
      "Dispatched": "dispatched",
      "Completed": "completed",
      "Cancelled": "cancelled"
    };
    const mappedStatus = statusMap[filters.status];
    if (mappedStatus) {
      conditions.push(eq(trips.status, mappedStatus as any));
    }
  }

  // We want to fetch the related vehicle and driver info
  const result = await db
    .select({
      id: trips.id,
      tripCode: trips.tripCode,
      source: trips.source,
      destination: trips.destination,
      vehicleId: trips.vehicleId,
      driverId: trips.driverId,
      cargoWeightKg: trips.cargoWeightKg,
      plannedDistanceKm: trips.plannedDistanceKm,
      status: trips.status,
      dispatchedAt: trips.dispatchedAt,
      completedAt: trips.completedAt,
      cancelledAt: trips.cancelledAt,
      createdAt: trips.createdAt,
      vehicleName: vehicles.name,
      vehicleRegistration: vehicles.registrationNumber,
      driverName: drivers.name,
    })
    .from(trips)
    .innerJoin(vehicles, eq(trips.vehicleId, vehicles.id))
    .innerJoin(drivers, eq(trips.driverId, drivers.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(trips.createdAt));

  return result;
}

export async function createTrip(input: CreateTripInput, userId: string) {
  // Verify vehicle and driver are actually available
  const vehicle = await db.query.vehicles.findFirst({
    where: eq(vehicles.id, input.vehicleId)
  });
  if (!vehicle || vehicle.status !== "available") {
    throw new AppError("UNAVAILABLE", "Selected vehicle is not available", 400);
  }

  const driver = await db.query.drivers.findFirst({
    where: eq(drivers.id, input.driverId)
  });
  if (!driver || driver.status !== "available") {
    throw new AppError("UNAVAILABLE", "Selected driver is not available", 400);
  }

  const tripCode = `TRP-${Math.random().toString().slice(2, 8)}`;

  const [trip] = await db
    .insert(trips)
    .values({
      tripCode,
      source: input.source,
      destination: input.destination,
      vehicleId: input.vehicleId,
      driverId: input.driverId,
      cargoWeightKg: input.cargoWeightKg.toString(),
      plannedDistanceKm: input.plannedDistanceKm.toString(),
      status: "draft",
      createdBy: userId,
    })
    .returning();

  return trip;
}

export async function updateTripStatus(id: string, status: "dispatched" | "completed" | "cancelled") {
  return await db.transaction(async (tx) => {
    // 1. Get the trip
    const [existingTrip] = await tx
      .select()
      .from(trips)
      .where(eq(trips.id, id));

    if (!existingTrip) {
      throw new AppError("NOT_FOUND", "Trip not found", 404);
    }

    // 2. Prepare update payload
    const updatePayload: any = {
      status,
      updatedAt: new Date(),
    };

    if (status === "dispatched") {
      updatePayload.dispatchedAt = new Date();
    } else if (status === "completed") {
      updatePayload.completedAt = new Date();
    } else if (status === "cancelled") {
      updatePayload.cancelledAt = new Date();
    }

    // 3. Update the trip
    const [updatedTrip] = await tx
      .update(trips)
      .set(updatePayload)
      .where(eq(trips.id, id))
      .returning();

    // 4. Sync Vehicle and Driver statuses
    let newAssetStatus: "available" | "on_trip" = "available";
    if (status === "dispatched") {
      newAssetStatus = "on_trip";
    } // completed or cancelled -> reverts to available

    // Only sync if changing TO dispatched, OR FROM dispatched to completed/cancelled
    await tx.update(vehicles).set({ status: newAssetStatus }).where(eq(vehicles.id, existingTrip.vehicleId));
    await tx.update(drivers).set({ status: newAssetStatus }).where(eq(drivers.id, existingTrip.driverId));

    return updatedTrip;
  });
}
