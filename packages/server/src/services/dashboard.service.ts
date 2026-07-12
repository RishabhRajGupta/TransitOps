import { db } from "../lib/db";
import { vehicles, drivers, trips } from "@transitops/db/schema";
import { eq, ne, desc, sql, or } from "drizzle-orm";

export async function getDashboardStats() {
  // 1. Vehicles
  const [totalActiveVehiclesObj] = await db
    .select({ count: sql<number>`count(*)` })
    .from(vehicles)
    .where(ne(vehicles.status, 'retired' as any));

  const [availableVehiclesObj] = await db
    .select({ count: sql<number>`count(*)` })
    .from(vehicles)
    .where(eq(vehicles.status, 'available' as any));

  const [vehiclesInShopObj] = await db
    .select({ count: sql<number>`count(*)` })
    .from(vehicles)
    .where(eq(vehicles.status, 'in_shop' as any));

  // 2. Trips
  const [activeTripsObj] = await db
    .select({ count: sql<number>`count(*)` })
    .from(trips)
    .where(eq(trips.status, 'dispatched' as any));

  const [pendingTripsObj] = await db
    .select({ count: sql<number>`count(*)` })
    .from(trips)
    .where(eq(trips.status, 'draft' as any));

  // 3. Drivers
  const [driversOnDutyObj] = await db
    .select({ count: sql<number>`count(*)` })
    .from(drivers)
    .where(eq(drivers.status, 'on_trip' as any));

  const totalActiveVehicles = Number(totalActiveVehiclesObj.count);
  const availableVehicles = Number(availableVehiclesObj.count);
  const vehiclesInShop = Number(vehiclesInShopObj.count);
  const activeTrips = Number(activeTripsObj.count);
  const pendingTrips = Number(pendingTripsObj.count);
  const driversOnDuty = Number(driversOnDutyObj.count);

  const utilizationRatio = totalActiveVehicles > 0 
    ? Math.round(((totalActiveVehicles - availableVehicles - vehiclesInShop) / totalActiveVehicles) * 100) 
    : 0;

  // 4. Recent Activities (Trips)
  const recentActivities = await db
    .select({
      id: trips.id,
      tripCode: trips.tripCode,
      source: trips.source,
      destination: trips.destination,
      status: trips.status,
      createdAt: trips.createdAt,
      vehicleName: vehicles.name,
      vehicleRegistration: vehicles.registrationNumber,
      driverName: drivers.name,
    })
    .from(trips)
    .innerJoin(vehicles, eq(trips.vehicleId, vehicles.id))
    .innerJoin(drivers, eq(trips.driverId, drivers.id))
    .orderBy(desc(trips.createdAt))
    .limit(5);

  return {
    metrics: {
      totalActiveVehicles,
      availableVehicles,
      vehiclesInShop,
      activeTrips,
      pendingTrips,
      driversOnDuty,
      utilizationRatio,
    },
    recentActivities: recentActivities.map(activity => ({
      id: activity.id,
      tripCode: activity.tripCode,
      time: new Date(activity.createdAt).toLocaleTimeString(),
      type: activity.status === 'draft' ? 'Trip Draft' 
          : activity.status === 'dispatched' ? 'Trip Dispatched' 
          : activity.status === 'completed' ? 'Trip Completed'
          : 'Trip Cancelled',
      vehicle: `${activity.vehicleName} (${activity.vehicleRegistration})`,
      driver: activity.driverName,
      status: activity.status.charAt(0).toUpperCase() + activity.status.slice(1),
    }))
  };
}
