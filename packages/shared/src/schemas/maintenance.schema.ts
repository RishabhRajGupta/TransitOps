import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { maintenanceLogs } from "@transitops/db/schema";

export const maintenanceSelectSchema = createSelectSchema(maintenanceLogs);

export const createMaintenanceSchema = createInsertSchema(maintenanceLogs, {
  cost: z.string().transform((v) => Number(v)).pipe(z.number().min(0)).optional(),
}).omit({
  id: true,
  status: true,
  openedAt: true,
  closedAt: true,
});

export const updateMaintenanceSchema = createInsertSchema(maintenanceLogs).omit({
  id: true,
}).partial();

export type MaintenanceLog = z.infer<typeof maintenanceSelectSchema>;
export type CreateMaintenanceInput = z.infer<typeof createMaintenanceSchema>;
