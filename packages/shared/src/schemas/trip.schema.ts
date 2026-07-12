import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { trips } from "@transitops/db/schema";

export const tripSelectSchema = createSelectSchema(trips);

export const createTripSchema = createInsertSchema(trips, {
  cargoWeightKg: z.string().transform((v) => Number(v)).pipe(z.number().positive()),
  plannedDistanceKm: z.string().transform((v) => Number(v)).pipe(z.number().positive()),
}).omit({
  id: true,
  status: true,
  startOdometerKm: true,
  endOdometerKm: true,
  fuelConsumedLiters: true,
  revenue: true,
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
