import express from "express";
import { pool } from "../db.js";

const router = express.Router();

router.options("*", (_, res) => res.sendStatus(204));

function requireAuth(req, res) {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    res.status(401).json({ error: "Not authenticated" });
    return false;
  }
  return true;
}

router.get("/pull", async (req, res) => {
  if (!requireAuth(req, res)) return;

  try {
    const { rows } = await pool.query(
      `
      SELECT *
      FROM notes_metadata
      WHERE user_id = $1
      ORDER BY updated_at DESC
      `,
      [req.user.id]
    );

    res.json({ notes: rows });
  } catch (err) {
    console.error("Sync pull error:", err);
    res.status(500).json({ error: "Sync pull failed" });
  }
});

router.post("/push", async (req, res) => {
  if (!requireAuth(req, res)) return;

  const { id, updatedAt, payload } = req.body;

  try {
    await pool.query(
      `
      INSERT INTO notes_metadata (id, user_id, updated_at, payload)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (id)
      DO UPDATE SET
        updated_at = EXCLUDED.updated_at,
        payload = EXCLUDED.payload
      `,
      [id, req.user.id, updatedAt, payload]
    );

    res.json({ ok: true });
  } catch (err) {
    console.error("Sync push error:", err);
    res.status(500).json({ error: "Sync push failed" });
  }
});

export default router;
