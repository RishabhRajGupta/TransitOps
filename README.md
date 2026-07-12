<div align="center">
  <h1>🚛 TransitOps</h1>
  <p><strong>A Next-Generation Fleet & Logistics Management Platform</strong></p>
  <p>
    TransitOps is a comprehensive, real-time command center built for modern logistics operations. 
    It provides intelligent telemetry, trip dispatching, driver lifecycle management, and advanced analytics, all securely scoped through role-based access control (RBAC).
  </p>
</div>

<br />

## ✨ Key Features

TransitOps is built to handle the complexities of fleet management through specialized modules tailored to specific operational roles:

* **Real-time Telemetry Dashboard**: Live syncing of active vehicles, pending trips, drivers on duty, and fleet utilization ratios.
* **Intelligent Trip Dispatcher**: Create, assign, and track trips from draft to completion with automatic state propagation (auto-locking vehicles/drivers on active trips).
* **Vehicle & Asset Registry**: Comprehensive CRUD for fleet assets, including tracking capacities, acquisition costs, and maintenance lifecycles (retiring vehicles).
* **Driver Lifecycle Management**: Track compliance metrics, safety scores, and licensing to ensure 100% operational safety.
* **Role-Based Access Control (RBAC)**: Secure operator sessions that restrict access:
  * 🧑‍💼 **Fleet Manager**: Unrestricted access to Vehicle Assets and Maintenance.
  * 📡 **Dispatcher**: Complete control over Trips, Dispatching, and routing.
  * 🛡️ **Safety Officer**: Focused on Driver Profiles, License Validity, and Compliance.
  * 📈 **Financial Analyst**: Dedicated views for Fuel Expenses and ROI Analytics.
* **Modern Interface**: A sleek, dark-mode-first aesthetic with high-density data tables and interactive charts designed to reduce cognitive load.

---

## 🏗️ Architecture & Tech Stack

TransitOps is structured as a highly scalable **pnpm Monorepo** separating concerns across dedicated packages.

```mermaid
graph TD
    Client[Web Client\nNext.js + Tailwind] -->|REST API| Server[API Layer\nNext.js Route Handlers]
    Server -->|Queries| Services[Business Services]
    Services -->|Drizzle ORM| DB[(PostgreSQL Database)]
    Services --> Shared[Shared Schemas\nZod]
    Client --> Shared
```

### 💻 Technologies Used
* **Monorepo Manager**: `pnpm` (Workspaces)
* **Frontend (`packages/web`)**: Next.js 14, React 18, TailwindCSS, TanStack Query (React Query), React Hook Form, Zod.
* **Backend (`packages/server`)**: Next.js Route Handlers (Edge/Serverless ready API), JWT custom Auth.
* **Database & ORM (`packages/db`)**: PostgreSQL (Neon/Local), Drizzle ORM.
* **Validation (`packages/shared`)**: Isomorphic Zod schemas shared across Client and Server for end-to-end type safety.

---

## 📂 Repository Structure

The monorepo is divided into four primary packages:

| Package | Path | Description |
| :--- | :--- | :--- |
| **Web** | `packages/web/` | The frontend UI application. Contains pages, layouts, global CSS, Zustand auth stores, and custom data-fetching hooks. |
| **Server** | `packages/server/` | The backend API application. Contains all REST routes (`/api/v1/*`), API middleware, and complex business logic services. |
| **Database** | `packages/db/` | Contains the Drizzle database schema definitions (`schema.ts`) and migration configurations. |
| **Shared** | `packages/shared/` | Shared TypeScript interfaces and Zod validation schemas to ensure consistency between Web and Server. |

---

## 🚀 Getting Started

Follow these instructions to set up the TransitOps development environment locally.

### 1. Prerequisites
* **Node.js**: `v18.x` or higher
* **pnpm**: `v8.x` or higher (`npm install -g pnpm`)
* **PostgreSQL**: A local Postgres instance or a cloud database like Neon.tech or Supabase.

### 2. Installation
Clone the repository and install all workspace dependencies:
```bash
git clone https://github.com/RishabhRajGupta/TransitOps.git
cd TransitOps
pnpm install
```

### 3. Environment Configuration
TransitOps requires environment variables to connect to the database and sign authentication tokens. 

Create a `.env` file inside `packages/server/.env`:
```env
# Database connection string (Change username, password, and port if necessary)
DATABASE_URL="postgres://postgres:password@localhost:5432/transitops"

# Secure JWT secret for signing authentication tokens
JWT_SECRET="generate_a_secure_random_string_here"
```

### 4. Database Initialization
Once your Postgres database is running and the `.env` is configured, apply the schema directly to the database:

```bash
# Push the schema changes directly to the DB
pnpm db:push

# (Optional) Seed the database with mock drivers, vehicles, and trips for testing
pnpm seed
```

### 5. Start Development Servers
Start both the Frontend and Backend servers simultaneously using the workspace command:

```bash
pnpm dev
```

* **Web UI (Frontend)**: Available at [http://localhost:3000](http://localhost:3000)
* **API (Backend)**: Available at [http://localhost:4000](http://localhost:4000) (as configured)

---

## 🛠️ Development Workflow

Here are the most useful commands to run from the root of the project:

| Command | Action |
| :--- | :--- |
| `pnpm dev` | Starts all development servers in parallel. |
| `pnpm build` | Builds the shared packages, database package, and then compiles the Server and Web apps for production. |
| `pnpm typecheck` | Runs the TypeScript compiler (`tsc --noEmit`) across all packages to catch type errors. |
| `pnpm db:studio` | Launches Drizzle Studio on port `4983`, providing a local GUI to inspect and modify your database rows. |
| `pnpm db:push` | Syncs your Drizzle schema changes with the remote Postgres database without generating migration files. |

---

## 🔒 Security & Authentication

Authentication is handled via a robust dual-layer system:
1. **Initial Verification**: Users supply their registered email, password, and designated role payload.
2. **2FA / MFA Step**: A dynamic 6-digit verification code is required to complete the session generation.
3. **JWT Handshake**: Secure JWTs are stored client-side in an HTTP-only manner or via the Zustand Auth Store (`useAuthStore`). All protected API routes utilize the `withApiHandler` middleware to parse and validate these tokens before execution.

---

> Built with 🖤 for Logistics Excellence.
