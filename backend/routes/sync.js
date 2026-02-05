import express from 'express';
import { pool } from '../db.js';
import auth from '../middleware/jwt.js';

const router = express.Router();

router.post('/', auth, async (req, res) => {
  const { id, updatedAt, payload } = req.body;

  await pool.query(`
    INSERT INTO notes_metadata (id, user_id, updated_at)
    VALUES ($1, $2, $3)
    ON CONFLICT (id)
    DO UPDATE SET updated_at = $3
  `, [id, req.user.id, updatedAt]);

  res.json({ ok: true });
});

export default router;
