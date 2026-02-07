import express from "express";
import authJwt from "../middleware/jwt.js";
import { pool } from "../db.js";

const router = express.Router();

/* ---------- PREVENT CORS FAILURE ---------- */
router.options("*", (req, res) => res.sendStatus(204));

/* ---------- PULL ---------- */
router.get("/pull", authJwt, async (req, res) => {
  const { rows } = await pool.query(
    `SELECT * FROM notes_metadata WHERE user_id = $1`,
    [req.user.id]
  );
  res.json(rows);
});

/* ---------- PUSH ---------- */
router.post("/", authJwt, async (req, res) => {
  const { id, updatedAt, payload } = req.body;

  await pool.query(
    `
    INSERT INTO notes_metadata (id, user_id, updated_at)
    VALUES ($1, $2, $3)
    ON CONFLICT (id)
    DO UPDATE SET updated_at = $3
    `,
    [id, req.user.id, updatedAt]
  );

  res.json({ ok: true });
});

export default router;
