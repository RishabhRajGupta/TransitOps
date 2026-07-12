import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { trips } from "@transitops/db/schema";

export const tripSelectSchema = createSelectSchema(trips);

export const createTripSchema = createInsertSchema(trips, {
  cargoWeightKg: z.coerce.number().positive(),
  plannedDistanceKm: z.coerce.number().positive(),
}).omit({
  id: true,
  tripCode: true,
  status: true,
  startOdometerKm: true,
  endOdometerKm: true,
  fuelConsumedLiters: true,
  revenue: true,
  createdBy: true,
  dispatchedAt: true,
  completedAt: true,
  cancelledAt: true,
  createdAt: true,
  updatedAt: true,
});

export const updateTripSchema = createInsertSchema(trips).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).partial();

export type Trip = z.infer<typeof tripSelectSchema>;
export type CreateTripInput = z.infer<typeof createTripSchema>;
