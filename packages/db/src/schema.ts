import { pgTable, pgEnum, uuid, varchar, text, numeric, integer, date, timestamp, index } from "drizzle-orm/pg-core";
import * as C from "./constants";

// Enums
export const userRoleEnum = pgEnum("user_role", C.USER_ROLES);
export const vehicleStatusEnum = pgEnum("vehicle_status", C.VEHICLE_STATUS);
export const vehicleTypeEnum = pgEnum("vehicle_type", C.VEHICLE_TYPES);
export const driverStatusEnum = pgEnum("driver_status", C.DRIVER_STATUS);
export const tripStatusEnum = pgEnum("trip_status", C.TRIP_STATUS);
export const maintenanceStatusEnum = pgEnum("maintenance_status", C.MAINTENANCE_STATUS);
export const expenseCategoryEnum = pgEnum("expense_category", C.EXPENSE_CATEGORY);

// Users
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: varchar("name", { length: 120 }).notNull(),
  role: userRoleEnum("role").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// Vehicles — indexes on status + region for dashboard filters
export const vehicles = pgTable("vehicles", {
  id: uuid("id").primaryKey().defaultRandom(),
  registrationNumber: varchar("registration_number", { length: 32 }).notNull().unique(),
  name: varchar("name", { length: 120 }).notNull(),
  type: vehicleTypeEnum("type").notNull(),
  maxLoadCapacityKg: numeric("max_load_capacity_kg", { precision: 10, scale: 2 }).notNull(),
  odometerKm: numeric("odometer_km", { precision: 12, scale: 2 }).notNull().default("0"),
  acquisitionCost: numeric("acquisition_cost", { precision: 12, scale: 2 }).notNull(),
  region: varchar("region", { length: 80 }),
  status: vehicleStatusEnum("status").notNull().default("available"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index("vehicles_status_idx").on(t.status),
  index("vehicles_region_idx").on(t.region),
]);

// Drivers — optional userId FK (driver profile can exist without a login)
export const drivers = pgTable("drivers", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  name: varchar("name", { length: 120 }).notNull(),
  licenseNumber: varchar("license_number", { length: 64 }).notNull().unique(),
  licenseCategory: varchar("license_category", { length: 32 }).notNull(),
  licenseExpiryDate: date("license_expiry_date").notNull(),
  contactNumber: varchar("contact_number", { length: 20 }).notNull(),
  safetyScore: integer("safety_score").notNull().default(100),
  status: driverStatusEnum("status").notNull().default("available"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index("drivers_status_idx").on(t.status)]);

// Trips
export const trips = pgTable("trips", {
  id: uuid("id").primaryKey().defaultRandom(),
  tripCode: varchar("trip_code", { length: 20 }).notNull().unique(),
  source: varchar("source", { length: 160 }).notNull(),
  destination: varchar("destination", { length: 160 }).notNull(),
  vehicleId: uuid("vehicle_id").notNull().references(() => vehicles.id),
  driverId: uuid("driver_id").notNull().references(() => drivers.id),
  cargoWeightKg: numeric("cargo_weight_kg", { precision: 10, scale: 2 }).notNull(),
  plannedDistanceKm: numeric("planned_distance_km", { precision: 10, scale: 2 }).notNull(),
  startOdometerKm: numeric("start_odometer_km", { precision: 12, scale: 2 }),
  endOdometerKm: numeric("end_odometer_km", { precision: 12, scale: 2 }),
  fuelConsumedLiters: numeric("fuel_consumed_liters", { precision: 10, scale: 2 }),
  revenue: numeric("revenue", { precision: 12, scale: 2 }),
  status: tripStatusEnum("status").notNull().default("draft"),
  createdBy: uuid("created_by").notNull().references(() => users.id),
  dispatchedAt: timestamp("dispatched_at", { withTimezone: true }),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index("trips_status_idx").on(t.status),
  index("trips_vehicle_idx").on(t.vehicleId),
  index("trips_driver_idx").on(t.driverId),
]);

// Maintenance Logs
export const maintenanceLogs = pgTable("maintenance_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  vehicleId: uuid("vehicle_id").notNull().references(() => vehicles.id),
  description: varchar("description", { length: 255 }).notNull(),
  cost: numeric("cost", { precision: 12, scale: 2 }).notNull().default("0"),
  status: maintenanceStatusEnum("status").notNull().default("active"),
  openedAt: timestamp("opened_at", { withTimezone: true }).notNull().defaultNow(),
  closedAt: timestamp("closed_at", { withTimezone: true }),
  createdBy: uuid("created_by").notNull().references(() => users.id),
}, (t) => [index("maintenance_vehicle_idx").on(t.vehicleId)]);

// Fuel Logs
export const fuelLogs = pgTable("fuel_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  vehicleId: uuid("vehicle_id").notNull().references(() => vehicles.id),
  tripId: uuid("trip_id").references(() => trips.id),
  liters: numeric("liters", { precision: 10, scale: 2 }).notNull(),
  cost: numeric("cost", { precision: 12, scale: 2 }).notNull(),
  loggedAt: date("logged_at").notNull(),
  createdBy: uuid("created_by").notNull().references(() => users.id),
}, (t) => [index("fuel_logs_vehicle_idx").on(t.vehicleId)]);

// Expenses
export const expenses = pgTable("expenses", {
  id: uuid("id").primaryKey().defaultRandom(),
  vehicleId: uuid("vehicle_id").references(() => vehicles.id),
  tripId: uuid("trip_id").references(() => trips.id),
  category: expenseCategoryEnum("category").notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  incurredAt: date("incurred_at").notNull(),
  notes: varchar("notes", { length: 255 }),
  createdBy: uuid("created_by").notNull().references(() => users.id),
}, (t) => [index("expenses_vehicle_idx").on(t.vehicleId)]);
