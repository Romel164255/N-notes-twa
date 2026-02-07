import { openDB } from "idb";

const dbPromise = openDB("n-notes-db", 3, {
  upgrade(db) {
    /* NOTES */
    if (!db.objectStoreNames.contains("notes")) {
      const store = db.createObjectStore("notes", { keyPath: "id" });
      store.createIndex("updatedAt", "updatedAt");
      store.createIndex("deleted", "deleted");
    }

    /* IMAGES */
    if (!db.objectStoreNames.contains("images")) {
      db.createObjectStore("images", { keyPath: "id" });
    }

    /* CONFLICTS */
    if (!db.objectStoreNames.contains("conflicts")) {
      db.createObjectStore("conflicts", { keyPath: "id" });
    }
  },
});

/* ---------- NOTES ---------- */
export async function getAllNotes() {
  const db = await dbPromise;
  return (await db.getAll("notes"))
    .filter(n => !n.deleted)
    .sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function saveNote(note) {
  const db = await dbPromise;
  await db.put("notes", note);
}

export async function getNote(id) {
  const db = await dbPromise;
  return db.get("notes", id);
}

export async function getDirtyNotes() {
  const db = await dbPromise;
  return (await db.getAll("notes")).filter(
    n => n.dirty && !n.deleted
  );
}

export async function markClean(id) {
  const db = await dbPromise;
  const note = await db.get("notes", id);
  if (!note) return;
  note.dirty = false;
  await db.put("notes", note);
}

/* ---------- IMAGES ---------- */
export async function saveImage(image) {
  const db = await dbPromise;
  await db.put("images", image);
}

export async function getImage(id) {
  const db = await dbPromise;
  return db.get("images", id);
}

export async function deleteImage(id) {
  const db = await dbPromise;
  await db.delete("images", id);
}

/* ---------- CONFLICTS ---------- */
export async function saveConflict(conflict) {
  const db = await dbPromise;
  await db.put("conflicts", conflict);
}

export async function getAllConflicts() {
  const db = await dbPromise;
  return db.getAll("conflicts");
}

export async function getConflict(id) {
  const db = await dbPromise;
  return db.get("conflicts", id);
}

export async function deleteConflict(id) {
  const db = await dbPromise;
  await db.delete("conflicts", id);
}
