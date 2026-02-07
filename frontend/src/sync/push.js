// frontend/sync/push.js
import { db } from "../db/adapter";

export async function pushNotes() {
  const dirtyNotes = await db.getDirtyNotes();
  if (!dirtyNotes.length) return;

  for (const note of dirtyNotes) {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/sync/push`,
        {
          method: "POST",
          credentials: "include", // 🔑 session cookie
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: note.id,
            updatedAt: note.updatedAt,
            payload: note.payload,
          }),
        }
      );

      if (!res.ok) continue;

      await db.markClean(note.id);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : String(err);
      console.warn("Push failed:", note.id, msg);
    }
  }
}
