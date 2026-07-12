import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { vehicles } from "@transitops/db/schema";

export const vehicleSelectSchema = createSelectSchema(vehicles);

export const createVehicleSchema = createInsertSchema(vehicles, {
  registrationNumber: z.string().min(2).max(32),
  maxLoadCapacityKg: z.coerce.number().positive(),
  acquisitionCost: z.coerce.number().positive(),
  odometerKm: z.coerce.number().min(0).optional(),
  status: z.enum(["available", "on_trip", "in_shop", "retired"]).optional(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateVehicleSchema = createInsertSchema(vehicles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).partial();

export type Vehicle = z.infer<typeof vehicleSelectSchema>;
export type CreateVehicleInput = z.infer<typeof createVehicleSchema>;
