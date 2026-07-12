import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@transitops/db/schema";

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://transitops:transitops@localhost:5432/transitops";

const client = postgres(connectionString);
export const db = drizzle(client, { schema });
export type DbClient = typeof db;
