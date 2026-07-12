import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { drivers } from "@transitops/db/schema";

export const driverSelectSchema = createSelectSchema(drivers);

export const createDriverSchema = createInsertSchema(drivers, {
  licenseExpiryDate: z.string().date(),
  safetyScore: z.number().min(0).max(100).optional(),
}).omit({
  id: true,
  status: true,
  createdAt: true,
  updatedAt: true,
});

export const updateDriverSchema = createInsertSchema(drivers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).partial();

export type Driver = z.infer<typeof driverSelectSchema>;
export type CreateDriverInput = z.infer<typeof createDriverSchema>;
