import { db } from "../db/adapter";
import { Token } from "../auth/token";

export async function pushNotes() {
  // Adapter method — YOU must expose this in indexedDb + sqlite
  const dirtyNotes = await db.getDirtyNotes();
  if (!dirtyNotes.length) return;

  const token = await Token.get();

  for (const note of dirtyNotes) {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/sync/push`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: note.id,
          updatedAt: note.updatedAt,
          version: note.version,
        }),
      });

      await db.markClean(note.id);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : String(err);
      console.warn("Push failed:", note.id, msg);
    }
  }
}
