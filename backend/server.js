console.log("🔥 BOOT SIGNATURE: server.js 2026-02-07 FINAL");

import express from "express";
import session from "express-session";
import passport from "passport";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import connectPgSimple from "connect-pg-simple";

dotenv.config();

/* ---------------- INTERNAL IMPORTS ---------------- */

import { pool } from "./db.js";
import "./config/passport.js";

import authRoutes from "./routes/auth.js";
import syncRoutes from "./routes/sync.js";
import deviceRoutes from "./routes/device.js";

/* ---------------- APP INIT ---------------- */

const app = express();
app.set("trust proxy", 1);

/* ---------------- CORS (ABSOLUTELY FIRST) ---------------- */

const allowedOrigins = process.env.CLIENT_URLS
  ? process.env.CLIENT_URLS.split(",").map(o => o.trim())
  : [];

const corsOptions = {
  origin: (origin, callback) => {
    // allow same-origin, curl, mobile apps
    if (!origin) return callback(null, true);

    const isAllowed =
      allowedOrigins.includes(origin) ||
      origin.endsWith(".vercel.app");

    if (isAllowed) {
      return callback(null, true);
    }

    console.log("❌ CORS blocked origin:", origin);
    return callback(null, false); // ✅ NEVER throw here
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

/* ---------------- BASIC MIDDLEWARE ---------------- */

app.use(cookieParser());
app.use(express.json());

/* ---------------- SESSION ---------------- */

const PgStore = connectPgSimple(session);

app.use(
  session({
    store: new PgStore({
      pool,
      tableName: "session",
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    proxy: true,
    cookie: {
      httpOnly: true,
      secure: true,        // required for Render + HTTPS
      sameSite: "none",    // required for cross-site cookies
      maxAge: 1000 * 60 * 60 * 24 * 30,
    },
  })
);

/* ---------------- PASSPORT ---------------- */

app.use(passport.initialize());
app.use(passport.session());

/* ---------------- ROUTES ---------------- */

app.use("/auth", authRoutes);
app.use("/api/device", deviceRoutes);
app.use("/api/sync", syncRoutes);

/* ---------------- HEALTH ---------------- */

app.get("/", (req, res) => {
  res.send("✅ Backend running fine — FINAL");
});

app.get("/v", (req, res) => {
  console.log("🔥 __version route HIT");
  res.json({ version: "cors-fixed-final" });
});

/* ---------------- ERROR HANDLER ---------------- */

app.use((err, req, res, next) => {
  console.error("🔥 Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

/* ---------------- START SERVER ---------------- */

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});

export { pool };
