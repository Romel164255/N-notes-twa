import { db } from "../db/adapter";
import { saveConflict } from "./conflicts";

export async function pullNotes() {
  const res = await fetch(
    "https://n-notes.onrender.com/api/sync/pull",
    {
      credentials: "include", // 🔑 REQUIRED for session auth
    }
  );

  if (!res.ok) {
    throw new Error("Not authenticated");
  }

  // ✅ Parse JSON ONCE
  const { notes: remoteNotes } = await res.json();

  for (const remote of remoteNotes) {
    const local = await db.getNote(remote.id);

    // 🆕 New note from server
    if (!local) {
      await db.saveNote({ ...remote, dirty: false });
      continue;
    }

    // ⏭ Same version
    if (local.updatedAt === remote.updatedAt) {
      continue;
    }

    // ⚠️ Conflict: local is newer
    if (local.updatedAt > remote.updatedAt) {
      await saveConflict({
        noteId: remote.id,
        local,
        remote,
      });
      continue;
    }

    // ⬇️ Remote is newer
    await db.saveNote({ ...remote, dirty: false });
  }

  // Optional: return something for UI
  return { ok: true, count: remoteNotes.length };
}
