import { db } from "../db/adapter";

/*
Conflict shape:
{
  id,
  noteId,
  local,
  remote,
  createdAt
}
*/

export async function saveConflict(conflict) {
  await db.saveConflict({
    ...conflict,
    id: conflict.id || crypto.randomUUID(),
    createdAt: Date.now(),
  });
}

export async function getConflicts() {
  return db.getAllConflicts();
}

export async function resolveConflict(conflictId, resolution) {
  const conflict = await db.getConflict(conflictId);
  if (!conflict) return;

  if (resolution === "local") {
    await db.saveNote({
      ...conflict.local,
      dirty: true,
    });
  }

  if (resolution === "remote") {
    await db.saveNote({
      ...conflict.remote,
      dirty: false,
    });
  }

  await db.deleteConflict(conflictId);
}
