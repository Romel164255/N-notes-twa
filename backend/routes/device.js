import express from "express";
import { pool } from "../db.js";

const router = express.Router();

router.post("/", async (req, res) => {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const { platform, model, os, appVersion } = req.body;

  await pool.query(
    `
    INSERT INTO device_info
      (user_id, platform, model, os, app_version, last_seen)
    VALUES ($1, $2, $3, $4, $5, NOW())
    ON CONFLICT (user_id, platform)
    DO UPDATE SET
      model = $3,
      os = $4,
      app_version = $5,
      last_seen = NOW()
    `,
    [req.user.id, platform, model, os, appVersion]
  );

  res.json({ ok: true });
});

export default router;
