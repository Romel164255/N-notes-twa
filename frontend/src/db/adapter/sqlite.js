import { CapacitorSQLite } from "@capacitor-community/sqlite";

const sqlite = CapacitorSQLite;
let db;

async function open() {
  if (db) return db;

  const conn = await sqlite.createConnection({
    database: "n_notes",
    version: 2, // ⬅️ bump version safely
    encrypted: false,
  });

  await conn.open();

  /* NOTES TABLE */
  await conn.execute(`
    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY,
      title TEXT,
      content TEXT,
      updatedAt INTEGER,
      version INTEGER,
      deleted INTEGER,
      pinned INTEGER,
      imageId TEXT
    );
  `);

  /* 🆕 IMAGES TABLE */
  await conn.execute(`
    CREATE TABLE IF NOT EXISTS images (
      id TEXT PRIMARY KEY,
      noteId TEXT,
      blob BLOB,
      type TEXT,
      createdAt INTEGER
    );
  `);

  db = conn;
  return db;
}

/* ---------- NOTES ---------- */

export async function getAllNotes() {
  const conn = await open();
  const res = await conn.query(
    "SELECT * FROM notes WHERE deleted = 0 ORDER BY updatedAt DESC"
  );
  return res.values || [];
}

export async function saveNote(note) {
  const conn = await open();
  await conn.run(
    `INSERT OR REPLACE INTO notes
     (id, title, content, updatedAt, version, deleted, pinned, imageId)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      note.id,
      note.title,
      note.content,
      note.updatedAt,
      note.version,
      note.deleted ? 1 : 0,
      note.pinned ? 1 : 0,
      note.imageId || null,
    ]
  );
}

export async function getNote(id) {
  const conn = await open();
  const res = await conn.query(
    "SELECT * FROM notes WHERE id = ?",
    [id]
  );
  return res.values?.[0] || null;
}

/* ---------- IMAGES ---------- */

export async function saveImage(image) {
  const conn = await open();
  await conn.run(
    `INSERT OR REPLACE INTO images
     (id, noteId, blob, type, createdAt)
     VALUES (?, ?, ?, ?, ?)`,
    [
      image.id,
      image.noteId,
      image.blob,
      image.type,
      image.createdAt,
    ]
  );
}

export async function getImage(id) {
  const conn = await open();
  const res = await conn.query(
    "SELECT * FROM images WHERE id = ?",
    [id]
  );
  return res.values?.[0] || null;
}

export async function deleteImage(id) {
  const conn = await open();
  await conn.run(
    "DELETE FROM images WHERE id = ?",
    [id]
  );
}

export async function getDirtyNotes() {
  const conn = await open();
  const res = await conn.query(
    "SELECT * FROM notes WHERE dirty = 1 AND deleted = 0"
  );
  return res.values || [];
}

export async function markClean(id) {
  const conn = await open();
  await conn.run(
    "UPDATE notes SET dirty = 0 WHERE id = ?",
    [id]
  );
}
