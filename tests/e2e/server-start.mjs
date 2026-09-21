import path from "node:path";

process.env.E2E_DATABASE_FILE_PATH = path.join(process.cwd(), ".dbs", "e2e.db");
process.env.PLAYWRIGHT_PORT = process.env.PLAYWRIGHT_PORT ?? process.env.PORT ?? "4444";
process.env.PORT = process.env.PORT ?? process.env.PLAYWRIGHT_PORT;

await import("../../build/server/start.js");
