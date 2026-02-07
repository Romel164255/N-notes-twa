// frontend/sync/pull.js
import { db } from "../db/adapter";
import { saveConflict } from "./conflicts";

export async function pullNotes() {
  let res;

  try {
    res = await fetch(
      `${import.meta.env.VITE_API_URL}/api/sync/pull`,
      {
        credentials: "include", // 🔑 session cookie
      }
    );
  } catch {
    return; // network error / offline
  }

  if (!res.ok) return;

  const { notes: remoteNotes } = await res.json();

  for (const remote of remoteNotes) {
    const local = await db.getNote(remote.id);

    if (!local) {
      await db.saveNote({ ...remote, dirty: false });
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

    await db.saveNote({ ...remote, dirty: false });
  }
}
