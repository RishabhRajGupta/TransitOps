import "dotenv/config";
import bcrypt from "bcryptjs";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@transitops/db/schema";

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://transitops:transitops@localhost:5432/transitops";

const client = postgres(connectionString);
const db = drizzle(client, { schema });

async function main() {
  console.log("Seeding started...");

  // Reset database tables
  await db.delete(schema.users);
  await db.delete(schema.vehicles);
  await db.delete(schema.drivers);
  await db.delete(schema.trips);
  await db.delete(schema.maintenanceLogs);
  await db.delete(schema.fuelLogs);
  await db.delete(schema.expenses);

  const passwordHash = await bcrypt.hash("password123", 12);

  const seededUsers = await db
    .insert(schema.users)
    .values([
      {
        email: "manager@transitops.com",
        passwordHash,
        name: "Fleet Manager",
        role: "fleet_manager",
      },
      {
        email: "driver@transitops.com",
        passwordHash,
        name: "Driver Demo User",
        role: "driver",
      },
      {
        email: "safety@transitops.com",
        passwordHash,
        name: "Safety Officer",
        role: "safety_officer",
      },
      {
        email: "analyst@transitops.com",
        passwordHash,
        name: "Financial Analyst",
        role: "financial_analyst",
      },
    ])
    .returning();

  console.log("Demo users seeded successfully:", seededUsers.map((u) => u.email));
  await client.end();
  process.exit(0);
}

main().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
