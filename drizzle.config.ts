import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./apps/api/src/db/schemas.ts",
  out: "./apps/api/src/db/migrations",
  dialect: "sqlite",
  dbCredentials: {
    url: "./.dbs/database.db",
  },
  verbose: true,
  strict: true,
});
