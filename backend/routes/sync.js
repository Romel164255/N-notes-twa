// backend/routes/sync.js
import express from "express";
import { pool } from "../db.js";
import authJwt from "../middleware/jwt.js";

const router = express.Router();

/* -------------------------------------------------
   ✅ ALWAYS allow preflight for sync routes
-------------------------------------------------- */
router.options("*", (req, res) => {
  res.sendStatus(204);
});

/* -------------------------------------------------
   📥 PULL (download notes)
-------------------------------------------------- */
router.get("/pull", authJwt, async (req, res) => {
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

/* -------------------------------------------------
   📤 PUSH (upload/update note metadata)
-------------------------------------------------- */
router.post("/push", authJwt, async (req, res) => {
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
