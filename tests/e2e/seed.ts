import { Result } from "better-result";

import { getDatabase } from "../../apps/api/src/db/index.js";
import { notes, todos } from "../../apps/api/src/db/schemas.js";

/**
 * TEMPLATE EXAMPLE ONLY. This deterministic Notes and Todos seed exists for
 * the shipped verification example. Replace it with real product fixtures.
 */
export async function seedE2EData(): Promise<void> {
  const db = Result.unwrap(getDatabase(), "Failed to open the E2E database");
  const note = db
    .insert(notes)
    .values({ title: "E2E note", body: "Canonical isolated test data" })
    .returning({ id: notes.id })
    .get();

  db.insert(todos).values({ note_id: note.id, title: "E2E todo" }).run();
}
