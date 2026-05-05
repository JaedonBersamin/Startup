// This tells the drizzle-kit CLI where your schema is and how to connect to the database when running migrations.

//   1. Where is your schema file?
//   2. Where should generated migration SQL files go?
//   3. What database dialect are you using?
//   4. What's the connection URL?

import { config } from "dotenv"
import type { Config } from "drizzle-kit"

// path to .env.local file in web folder
config({ path: ".env.local" })

export default {
    schema: "./db/schema.ts",
    out: "./db/migrations",
    dialect: "postgresql",
    dbCredentials: {
        url: process.env.DATABASE_URL!,
    },
} satisfies Config
