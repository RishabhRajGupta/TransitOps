# TransitOps — AI Assistant Instructions

> Derived from `TransitOps_SDD.md` (source of truth). Fleet management system replacing spreadsheets with enforced business rules.
>
> **How to use this file:** Each section below covers a work area with a concise summary + exact line references into the SDD and `claude-reference.md`. When working on a specific area, read the referenced lines for full implementation details and code patterns.

## Core Principles

1. **One source of truth.** DB schema → Zod → types → API docs. Never hand-duplicate.
2. **Server owns logic.** Every rule validated server-side even if UI checked it.
3. **Fail loud, fail typed.** Errors always return `{ error: { code, message, details? } }`.

> 📖 [SDD §1 — Purpose & Principles](./TransitOps_SDD.md#L29-L42)

## Tech Stack

| Layer | Choice |
|---|---|
| Monorepo | pnpm v11 workspaces, `catalog:` for shared versions |
| Frontend | Next.js 16.2.10 (App Router), Tailwind v4, shadcn/ui, TanStack Query v5, zustand, react-hook-form + zodResolver |
| Backend | Next.js 16.2.10 Route Handlers only (separate `packages/server`) |
| DB | PostgreSQL 17 + Drizzle ORM, schema in `packages/db` |
| Validation | Zod v4 + drizzle-zod (schemas derived from DB, never hand-written) |
| Auth | Dual JWT via `jose` — access 5min (body) + refresh 7d (httpOnly cookie) |
| API Docs | swagger-jsdoc + Scalar |
| Testing | Vitest + NTARH (not supertest — Route Handlers don't expose `http.Server`) |
| Deploy | Docker multi-stage (standalone) → AWS App Runner + RDS |

> 📖 [SDD §4 — Tech Stack Decisions](./TransitOps_SDD.md#L90-L104) · [SDD §2 — Template Audit](./TransitOps_SDD.md#L45-L72)

## Monorepo & Dependency Direction

```
transitops/
├── packages/server/    # API only — route handlers, services/, middleware/
├── packages/web/       # UI only — pages, hooks, components
├── packages/db/        # Drizzle schema + constants ONLY (no env, no connection)
├── packages/shared/    # Derived Zod schemas, types (z.infer), API client
└── docker-compose.yml  # Local Postgres 17
```

**Never violate:** `packages/db` → `packages/shared` → `packages/web`. Only `packages/server` opens DB connections. `packages/web` never imports `packages/db`.

> 📖 [SDD §5 — Full structure + dependency graph](./TransitOps_SDD.md#L107-L205) · [pnpm workspace config](./claude-reference.md#L422-L437) · [Docker Compose](./claude-reference.md#L374-L395) · [Dockerfile](./claude-reference.md#L397-L419)

## Domain Model & Schema

Enums defined once in `packages/db/src/constants.ts`:
- **Users:** 4 roles — `fleet_manager`, `driver`, `safety_officer`, `financial_analyst`
- **Vehicles:** `available` | `on_trip` | `in_shop` | `retired` — types: truck/van/pickup/trailer
- **Drivers:** `available` | `on_trip` | `off_duty` | `suspended` — linked to users via optional FK
- **Trips:** `draft` → `dispatched` → `completed`/`cancelled` — has revenue (nullable for ROI)
- **Maintenance Logs:** `active` | `closed` — cost tracked here (not in expenses)
- **Fuel Logs:** liters + cost per vehicle/trip
- **Expenses:** toll/fine/parking/other only — maintenance & fuel have own tables (no double-count)

**Key:** Driver ≠ User. `users` = login/RBAC. `drivers` = roster/compliance. Total Op Cost = Fuel + Maintenance + Expenses.

> 📖 [Full Drizzle schema code](./claude-reference.md#L8-L143) · [SDD §6 — ER diagram + schema](./TransitOps_SDD.md#L208-L360) · [SDD §3 — Assumptions & gap-fills](./TransitOps_SDD.md#L75-L88) · [Drizzle config](./claude-reference.md#L358-L371)

## Business Rules (NEVER cut these)

### State Machines
```
Trip:    [*] → Draft → Dispatched → Completed/Cancelled
Vehicle: [*] → Available ⇄ OnTrip ⇄ Available ⇄ InShop → Available/Retired
```

### Critical Rules

| Rule | Enforcement |
|---|---|
| Unique registration/license | DB constraint + catch Postgres `23505` → 409 |
| Retired/InShop can't dispatch | Filter + atomic re-check at dispatch |
| Expired license blocks dispatch | Computed from `licenseExpiryDate` — **never a stored boolean** |
| Cargo ≤ max capacity | Service-layer check after loading vehicle |
| Dispatch claims vehicle+driver atomically | Conditional `UPDATE...WHERE status='available'` in transaction |
| Maintenance close restores vehicle | `UPDATE SET status='available' WHERE status='in_shop'` (no-op if retired) |

### Dispatch Concurrency Pattern (replicate for all state transitions)

```typescript
const [claimed] = await tx.update(vehicles)
  .set({ status: "on_trip", updatedAt: new Date() })
  .where(and(eq(vehicles.id, trip.vehicleId), eq(vehicles.status, "available")))
  .returning();
if (!claimed) throw new AppError("CONFLICT", "Vehicle is no longer available", 409);
```

Always use `db.transaction()` — rollback on throw handles cleanup.

> 📖 [Full dispatch service implementation](./claude-reference.md#L210-L273) · [Cargo capacity check](./claude-reference.md#L262-L273) · [SDD §7 — State machines & all business rules](./TransitOps_SDD.md#L363-L447)

## Auth & RBAC

- **Access:** 5min, `{ id, email, role }`, response body only
- **Refresh:** 7d, `{ id, email }` (no role — forces fresh lookup), httpOnly/Secure/SameSite=strict cookie
- **498** = expired (vs 401 = invalid) — enables `axios-auth-refresh` silent refresh

| Action | FM | DR | SO | FA |
|---|:---:|:---:|:---:|:---:|
| Vehicles: CRUD/retire | ✅ | R | R | R |
| Drivers: create | ✅ | – | – | – |
| Drivers: edit/suspend | – | – | ✅ | – |
| Trips: create/dispatch/complete/cancel | ✅ | ✅ | – | – |
| Maintenance: open/close | ✅ | – | – | – |
| Fuel logs: create | ✅ | ✅ | – | – |
| Expenses: create | – | – | – | ✅ |
| Dashboard/Reports/CSV | ✅ | – | ✅ | ✅ |

RBAC is **server-only** via `requireRole()`. UI hides buttons for UX, not security.

> 📖 [Auth module code (JWT sign/verify)](./claude-reference.md#L146-L173) · [RBAC requireRole()](./claude-reference.md#L167-L173) · [SDD §8 — Full auth & RBAC](./TransitOps_SDD.md#L450-L496) · [SDD §15 — Security](./TransitOps_SDD.md#L720-L730)

## Validation Pipeline

1. **Zod** → `400 VALIDATION_ERROR` (shape/type, single-payload)
2. **Service layer** → `409`/`422` (cross-row business rules needing DB reads)
3. **DB constraints** → caught and mapped to `409` (never raw Postgres errors)

Schema chain: `packages/db` pgTable → `drizzle-zod` → Zod schemas in `packages/shared` → `z.infer` types → Zod's native schema generation for OpenAPI.

> 📖 [Schema derivation code](./claude-reference.md#L276-L299) · [Error handling (AppError + toErrorResponse)](./claude-reference.md#L176-L207) · [SDD §9 — Full validation pipeline](./TransitOps_SDD.md#L499-L563)

## API Design

REST with **action endpoints for state transitions** (not generic PATCH status):
- Auth: `POST /api/auth/{login,refresh,logout}`, `GET /api/auth/me`
- Vehicles: `GET|POST /api/vehicles`, `GET|PATCH /api/vehicles/:id`, `POST .../retire`
- Drivers: `GET|POST /api/drivers`, `PATCH /api/drivers/:id`, `POST .../suspend`
- Trips: `GET|POST /api/trips`, `POST .../dispatch|complete|cancel`
- Maintenance: `POST /api/maintenance`, `POST .../close`
- Fuel/Expenses: `POST /api/fuel-logs`, `POST /api/expenses`
- Dashboard: `GET /api/dashboard/kpis`
- Reports: `GET /api/reports/{fuel-efficiency,fleet-utilization,operational-cost,vehicle-roi}` (`?format=csv`)

Pagination on all lists: `?page&limit` (default 20, cap 100). Never unbounded `SELECT *`.

> 📖 [SDD §10 — Full API table with roles](./TransitOps_SDD.md#L566-L598) · [OpenAPI/Scalar setup code](./claude-reference.md#L302-L335) · [SDD §11 — API docs setup](./TransitOps_SDD.md#L601-L657)

## Frontend Patterns

- Custom hooks per resource (`useVehicles`, `useTrips`) via TanStack Query — never inline `fetch()`
- Mutations invalidate relevant query keys; dashboard uses `refetchInterval: 30_000`
- Forms: `react-hook-form` + `zodResolver` with `packages/shared` schemas
- No SSE/WebSocket needed — mutation invalidation + focus-refetch is sufficient

> 📖 [SDD §13 — Frontend architecture](./TransitOps_SDD.md#L683-L693)

## Logging

Winston with colorized dev / structured JSON prod. Log every request, business-rule rejections at `warn`, unhandled exceptions at `error`. Never log passwords, tokens, or auth bodies.

> 📖 [Logger code](./claude-reference.md#L338-L355) · [SDD §12 — Logging details](./TransitOps_SDD.md#L660-L680)

## Testing

- **Service tests (highest priority):** Vitest + real Postgres, wrap in rolled-back transactions
- **Route handler tests:** Vitest + NTARH, `// @vitest-environment node`
- **Must-test:** dispatch race guard, license expiry, cargo capacity, suspended driver

> 📖 [Test pattern example](./claude-reference.md#L440-L456) · [SDD §14 — Testing strategy](./TransitOps_SDD.md#L695-L717)

## Deployment

Local: `docker compose up` → `pnpm --filter server dev` / `pnpm --filter web dev`
Migrations: `drizzle-kit generate` then `drizzle-kit migrate` (as CI step, not container CMD)
Production: Docker multi-stage → AWS App Runner + RDS

> 📖 [Docker Compose](./claude-reference.md#L374-L395) · [Dockerfile](./claude-reference.md#L397-L419) · [SDD §17 — Deployment + AWS architecture](./TransitOps_SDD.md#L743-L800) · [SDD §16 — Performance](./TransitOps_SDD.md#L733-L740)

## Gotchas

1. `drizzle-zod` needs `≥0.6.0` for Zod 4
2. Scalar + Tailwind v4: add `@layer` declaration before `@import "tailwindcss"`
3. Draft trips don't lock resources — conflict surfaces at dispatch (correct behavior)
4. Drizzle `numeric` returns strings — use `Number()` for arithmetic
5. No `cookie-parser` needed — use `cookies()` from `next/headers`
6. No supertest — use `next-test-api-route-handler` for Route Handlers

## Build Phases (8h)

| Phase | Time | Scope |
|---|---|---|
| 0 Scaffold | 0:00–1:15 | Monorepo, schema, migration, docker, auth, seed 4 users |
| 1 CRUD | 1:15–2:15 | Vehicles + Drivers |
| 2 Trips | 2:15–4:15 | Create, dispatch (race guard!), complete, cancel |
| 3 Logs | 4:15–5:15 | Maintenance, fuel, expenses + status-flip rules |
| 4 Dashboard | 5:15–6:15 | KPIs, 4 reports, CSV export |
| 5 Polish | 6:15–8:00 | Error pass, /docs, key tests, AWS if solid |

**Never cut:** dispatch concurrency guard, license-expiry checks, cargo-capacity validation.
**Cut first:** PDF export, email reminders, document management, dark mode toggle, search/sort.

> 📖 [SDD §18 — Full execution roadmap](./TransitOps_SDD.md#L803-L817)
