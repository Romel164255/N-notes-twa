import { db } from "../db/adapter";
import { Token } from "../auth/token";
import { saveConflict } from "./conflicts";

export async function pullNotes() {
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
