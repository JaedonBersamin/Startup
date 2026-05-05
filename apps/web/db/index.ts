// This creates the Drizzle client and exports db, which is what all your tRPC routers will use to query the database.

// 1. Import drizzle from the postgres adapter
// 2. Create a postgres connection using your DATABASE_URL
// 3. Create and export db by passing the connection and your schema to drizzle

import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import * as schema from "./schema"

const client = postgres(process.env.DATABASE_URL!)
export const db = drizzle(client, { schema })
