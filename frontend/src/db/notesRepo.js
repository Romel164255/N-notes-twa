import { db } from "./adapter";

/* =========================
   GET ALL NOTES
========================= */
export async function getAllNotes() {
  return db.getAllNotes();
}

/* =========================
   CREATE NOTE
========================= */
export async function createNote({ title, content, imageFile }) {
  const id = crypto.randomUUID();
  let imageId = null;

  // Save image if provided
  if (imageFile) {
    imageId = crypto.randomUUID();

    await db.saveImage({
      id: imageId,
      noteId: id,
      blob: imageFile,
      type: imageFile.type,
      createdAt: Date.now(),
    });
  }

  const note = {
    id,
    title,
    content,
    imageId,
    pinned: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    version: 1,
    deleted: false,
  };

  await db.saveNote(note);
  return note;
}

/* =========================
   UPDATE NOTE
========================= */
export async function updateNote(id, updates) {
  const note = await db.getNote(id);
  if (!note) return null;

  let imageId = note.imageId;

  /* ---- REMOVE IMAGE ---- */
  if (updates.removeImage && note.imageId) {
    await db.deleteImage(note.imageId);
    imageId = null;
  }

  /* ---- ADD / REPLACE IMAGE ---- */
  if (updates.imageFile) {
    if (note.imageId) {
      await db.deleteImage(note.imageId);
    }

    imageId = crypto.randomUUID();

    await db.saveImage({
      id: imageId,
      noteId: id,
      blob: updates.imageFile,
      type: updates.imageFile.type,
      createdAt: Date.now(),
    });
  }

  const updated = {
    ...note,
    ...updates,
    imageId,
    updatedAt: Date.now(),
    version: note.version + 1,
  };

  // cleanup transient fields
  delete updated.imageFile;
  delete updated.removeImage;

  await db.saveNote(updated);
  return updated;
}

/* =========================
   SOFT DELETE NOTE
========================= */
export async function softDeleteNote(id) {
  const note = await db.getNote(id);
  if (!note) return;

  if (note.imageId) {
    await db.deleteImage(note.imageId);
  }

  await db.saveNote({
    ...note,
    deleted: true,
    updatedAt: Date.now(),
    version: note.version + 1,
  });
}
