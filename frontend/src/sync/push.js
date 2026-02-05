import { dbPromise } from "../db/indexedDb";
import { Token } from "../auth/token";
// import { uploadImage } from "./drive"; // enabled later

export async function pushNotes() {
  const db = await dbPromise;
  const dirtyNotes = await db.getAllFromIndex("notes", "dirty", true);
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

      note.dirty = false;
      await db.put("notes", note);
    } catch (err) {
  const msg =
    err instanceof Error ? err.message : String(err);
  console.warn("Push failed:", msg);
}

  }
}
