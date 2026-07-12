# TransitOps — Implementation Reference

> Detailed code patterns and implementation specifics. Referenced from `claude.md`.
> Source of truth: `TransitOps_SDD.md`

---

## Database Schema (`packages/db/src/schema.ts`)

### Constants (`packages/db/src/constants.ts`)

```ts
export const USER_ROLES = ["fleet_manager", "driver", "safety_officer", "financial_analyst"] as const;
export const VEHICLE_STATUS = ["available", "on_trip", "in_shop", "retired"] as const;
export const VEHICLE_TYPES = ["truck", "van", "pickup", "trailer"] as const;
export const DRIVER_STATUS = ["available", "on_trip", "off_duty", "suspended"] as const;
export const TRIP_STATUS = ["draft", "dispatched", "completed", "cancelled"] as const;
export const MAINTENANCE_STATUS = ["active", "closed"] as const;
export const EXPENSE_CATEGORY = ["toll", "fine", "parking", "other"] as const;
```

### Full Schema

```ts
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
```

---

## Auth Module (`packages/server/src/middleware/auth.ts`)

```ts
import { SignJWT, jwtVerify } from "jose";

const ACCESS_SECRET = new TextEncoder().encode(process.env.ACCESS_TOKEN_SECRET!);
const REFRESH_SECRET = new TextEncoder().encode(process.env.REFRESH_TOKEN_SECRET!);

export async function createAccessToken(payload: { id: string; email: string; role: UserRole }) {
  return new SignJWT(payload).setProtectedHeader({ alg: "HS256" }).setExpirationTime("5m").sign(ACCESS_SECRET);
}
export async function createRefreshToken(payload: { id: string; email: string }) {
  return new SignJWT(payload).setProtectedHeader({ alg: "HS256" }).setExpirationTime("7d").sign(REFRESH_SECRET);
}
// Refresh token deliberately carries no `role` — forces fresh role lookup on every refresh.
// Distinguish expired (498) from invalid (401) for axios-auth-refresh interceptor.
```

### RBAC (`packages/server/src/middleware/rbac.ts`)

```ts
export function requireRole(user: AuthUser, allowed: UserRole[]) {
  if (!allowed.includes(user.role)) {
    throw new AppError("FORBIDDEN", `Requires one of: ${allowed.join(", ")}`, 403);
  }
}
```

---

## Error Handling (`packages/server/src/lib/errors.ts`)

```ts
export class AppError extends Error {
  constructor(public code: string, message: string, public status: number, public details?: unknown) {
    super(message);
  }
}

export function toErrorResponse(err: unknown) {
  if (err instanceof AppError) {
    return NextResponse.json(
      { error: { code: err.code, message: err.message, details: err.details } },
      { status: err.status }
    );
  }
  if (err instanceof ZodError) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Invalid request", details: err.flatten() } },
      { status: 400 }
    );
  }
  logger.error("Unhandled error", { err });
  return NextResponse.json(
    { error: { code: "INTERNAL_ERROR", message: "Something went wrong" } },
    { status: 500 }
  );
}
```

Every route handler is wrapped by `withApiHandler()` — auth extraction + try/catch → `toErrorResponse()`.

---

## Dispatch Service (`packages/server/src/services/trip.service.ts`)

The concurrency-correct dispatch — the most critical function in the system:

```ts
export async function dispatchTrip(tripId: string) {
  return db.transaction(async (tx) => {
    // 1. Atomically claim the TRIP — guards against double-dispatch
    const [trip] = await tx.update(trips)
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

    // 3. Atomically CLAIM the vehicle — the real race guard
    const [claimedVehicle] = await tx.update(vehicles)
      .set({ status: "on_trip", updatedAt: new Date() })
      .where(and(eq(vehicles.id, trip.vehicleId), eq(vehicles.status, "available")))
      .returning();
    if (!claimedVehicle)
      throw new AppError("CONFLICT", "Vehicle is no longer available", 409);

    // 4. Same atomic claim for the driver
    const [claimedDriver] = await tx.update(drivers)
      .set({ status: "on_trip", updatedAt: new Date() })
      .where(and(eq(drivers.id, trip.driverId), eq(drivers.status, "available")))
      .returning();
    if (!claimedDriver)
      throw new AppError("CONFLICT", "Driver is no longer available", 409);

    return trip;
  });
}
```

Replicate this pattern for `completeTrip`, `cancelTrip`, `closeMaintenance`.

### Cargo Capacity Check (in `createTrip`)

```ts
const vehicle = await tx.query.vehicles.findFirst({ where: eq(vehicles.id, input.vehicleId) });
if (!vehicle) throw new AppError("NOT_FOUND", "Vehicle not found", 404);
if (Number(input.cargoWeightKg) > Number(vehicle.maxLoadCapacityKg)) {
  throw new AppError(
    "BUSINESS_RULE_VIOLATION",
    `Cargo weight ${input.cargoWeightKg}kg exceeds vehicle capacity ${vehicle.maxLoadCapacityKg}kg`,
    422
  );
}
```

---

## Validation Schema Derivation (`packages/shared/src/schemas/`)

```ts
// packages/shared/src/schemas/vehicle.schema.ts
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-zod";
import { z } from "zod";
import { vehicles } from "@transitops/db/schema";

export const vehicleSelectSchema = createSelectSchema(vehicles);

export const createVehicleSchema = createInsertSchema(vehicles, {
  registrationNumber: (s) => s.min(2).max(32),
  maxLoadCapacityKg: (s) => s.positive(),
}).omit({ id: true, status: true, odometerKm: true, createdAt: true, updatedAt: true });

export const updateVehicleSchema = createUpdateSchema(vehicles)
  .omit({ id: true, createdAt: true, updatedAt: true });

export type Vehicle = z.infer<typeof vehicleSelectSchema>;
export type CreateVehicleInput = z.infer<typeof createVehicleSchema>;
```

Follow this pattern for all entities. `drizzle-zod ≥0.8.3` required for Zod 4.

---

## OpenAPI Setup (`packages/server/src/docs/openapi.ts`)

```ts
import swaggerJsdoc from "swagger-jsdoc";
import { vehicleSelectSchema, createVehicleSchema } from "@transitops/shared/schemas/vehicle.schema";

// Generate OpenAPI schemas using Zod's native features or standard utilities
const generatedSchemas = {
  Vehicle: vehicleSelectSchema, // natively generated or parsed schema
  CreateVehicleInput: createVehicleSchema,
  // ...one line per schema
};

export const openApiSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.3",
    info: { title: "TransitOps API", version: "0.1.0" },
    components: { schemas: generatedSchemas },
  },
  apis: ["./src/app/api/**/*.ts"],
});
```

Route handler JSDoc describes paths only — schemas are generated, not hand-typed.

```ts
// packages/server/src/app/api/openapi.json/route.ts
export async function GET() { return NextResponse.json(openApiSpec); }

// packages/server/src/app/docs/route.ts
import { ApiReference } from "@scalar/nextjs-api-reference";
export const GET = ApiReference({ url: "/api/openapi.json" });
```

---

## Logging (`packages/server/src/lib/logger.ts`)

```ts
import winston from "winston";
const isProd = process.env.NODE_ENV === "production";

export const logger = winston.createLogger({
  level: isProd ? "info" : "debug",
  format: isProd
    ? winston.format.combine(winston.format.timestamp(), winston.format.json())
    : winston.format.combine(winston.format.colorize(), winston.format.simple()),
  defaultMeta: { service: "transitops-server" },
  transports: [new winston.transports.Console()],
});
```

Log: every request (method, path, status, duration, userId, requestId), business-rule rejections (at `warn`), unhandled exceptions (at `error` with stack). **Never log passwords, tokens, or auth request bodies.**

---

## Drizzle Config (`packages/server/drizzle.config.ts`)

```ts
import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "../db/src/schema.ts",
  out: "./src/db/migrations",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL! },
});
```

---

## Docker Compose (repo root)

```yaml
services:
  postgres:
    image: postgres:17-alpine
    environment:
      POSTGRES_USER: transitops
      POSTGRES_PASSWORD: transitops
      POSTGRES_DB: transitops
    ports: ["5432:5432"]
    volumes: ["pgdata:/var/lib/postgresql/data"]
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U transitops"]
      interval: 5s
      timeout: 5s
      retries: 5
volumes:
  pgdata:
```

---

## Server Dockerfile (`packages/server/Dockerfile`)

```dockerfile
FROM node:22-alpine AS base
RUN corepack enable

FROM base AS build
WORKDIR /repo
COPY . .
RUN pnpm install --frozen-lockfile --filter server...
RUN pnpm --filter server build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /repo/packages/server/.next/standalone ./
COPY --from=build /repo/packages/server/.next/static ./packages/server/.next/static
EXPOSE 4000
CMD ["node", "packages/server/server.js"]
```

Run `drizzle-kit migrate` as a CI release step, not inside container CMD.

---

## pnpm Workspace (`pnpm-workspace.yaml`)

```yaml
packages:
  - "apps/*"
  - "packages/*"
catalog:
  typescript: ^5.9.2
  zod: ^4.1.11
  next: 15.5.4
  react: ^19.1.1
  react-dom: ^19.1.1
```

Every `package.json` uses `"zod": "catalog:"` — one line to bump, no drift.

---

## Test Pattern Example

```ts
// apps/server/src/modules/trips/trip.service.test.ts
describe("dispatchTrip", () => {
  it("rejects a second dispatch attempt on an already-claimed vehicle", async () => {
    const { vehicle, driver } = await seedAvailableVehicleAndDriver();
    const tripA = await createTrip({ vehicleId: vehicle.id, driverId: driver.id, ... });
    const tripB = await createTrip({ vehicleId: vehicle.id, driverId: otherDriver.id, ... });

    await dispatchTrip(tripA.id); // succeeds
    await expect(dispatchTrip(tripB.id)).rejects.toThrow(/no longer available/);
  });
});
```

Service tests use real Postgres (from docker-compose), each wrapped in rolled-back transaction.
Route handler tests use `next-test-api-route-handler` with `// @vitest-environment node`.
