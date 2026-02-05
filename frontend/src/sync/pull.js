import { dbPromise } from "../db/indexedDb";
import { Token } from "../auth/token";
import { saveConflict } from "./conflict";

export async function pullNotes() {
  const db = await dbPromise;
  const token = await Token.get();

  const res = await fetch(
    `${import.meta.env.VITE_API_URL}/api/sync/pull`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) return;

  const remoteNotes = await res.json();

  for (const remote of remoteNotes) {
    const local = await db.get("notes", remote.id);

    if (!local) {
      await db.put("notes", { ...remote, dirty: false });
      continue;
    }

    if (local.updatedAt === remote.updatedAt) continue;

    if (local.updatedAt > remote.updatedAt) {
      await saveConflict({
        noteId: remote.id,
        local,
        remote,
      });
      continue;
    }

    await db.put("notes", { ...remote, dirty: false });
  }
}
