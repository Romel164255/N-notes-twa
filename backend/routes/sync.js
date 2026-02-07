// backend/routes/sync.js
import express from "express";
import { pool } from "../db.js";

const router = express.Router();

/* -----------------------------------------
   ✅ Allow CORS preflight (MUST exist)
------------------------------------------ */
router.options("*", (req, res) => {
  res.sendStatus(204);
});

/* -----------------------------------------
   🔒 Require logged-in session
------------------------------------------ */
function requireSession(req, res, next) {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  next();
}

/* -----------------------------------------
   📥 PULL notes
------------------------------------------ */
router.get("/pull", requireSession, async (req, res) => {
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

/* -----------------------------------------
   📤 PUSH notes
------------------------------------------ */
router.post("/push", requireSession, async (req, res) => {
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
