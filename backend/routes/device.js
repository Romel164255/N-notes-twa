import express from "express";
import auth from "../middleware/authSession.js";
import { pool } from "../db.js";

const router = express.Router();

router.post("/", auth, async (req, res) => {
  const { platform, model, os, appVersion } = req.body;

  await pool.query(
    `
    UPDATE users
    SET device_info = $1
    WHERE id = $2
    `,
    [
      {
        platform,
        model,
        os,
        appVersion,
        lastSeen: Date.now(),
      },
      req.user.id,
    ]
  );

  res.json({ ok: true });
});

export default router;
