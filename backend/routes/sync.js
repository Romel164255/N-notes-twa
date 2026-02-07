import express from "express";
import { pool } from "../db.js";

const router = express.Router();

// Allow preflight
router.options("*", (req, res) => res.sendStatus(204));

function requireSession(req, res, next) {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.sendStatus(401);
  }
  next();
}

router.get("/pull", requireSession, async (req, res) => {
  const { rows } = await pool.query(
    `
    SELECT *
    FROM notes_metadata
    WHERE user_id = $1
    ORDER BY updated_at DESC
    `,
    [req.user.id]
  );
  res.json(rows);
});

router.post("/push", requireSession, async (req, res) => {
  const { id, updatedAt, payload } = req.body;

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
});

export default router;
