import { prepareE2EDatabase } from "./database.js";

await prepareE2EDatabase();
console.log("Prepared deterministic E2E database at .dbs/e2e.db.");
