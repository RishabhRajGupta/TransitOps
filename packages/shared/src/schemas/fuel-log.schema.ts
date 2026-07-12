import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { fuelLogs } from "@transitops/db/schema";

export const fuelLogSelectSchema = createSelectSchema(fuelLogs);

export const createFuelLogSchema = createInsertSchema(fuelLogs, {
  liters: z.string().transform((v) => Number(v)).pipe(z.number().positive()),
  cost: z.string().transform((v) => Number(v)).pipe(z.number().positive()),
  loggedAt: z.string().date(),
}).omit({
  id: true,
  createdBy: true,
});

export type FuelLog = z.infer<typeof fuelLogSelectSchema>;
export type CreateFuelLogInput = z.infer<typeof createFuelLogSchema>;
