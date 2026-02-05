import express from "express";
import session from "express-session";
import passport from "passport";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import connectPgSimple from "connect-pg-simple";

dotenv.config();

import { pool } from "./db.js";
import "./config/passport.js";

import authRoutes from "./routes/auth.js";
import notesRoutes from "./routes/notes.js";
import deviceRoutes from "./routes/device.js";

const app = express();
app.set("trust proxy", 1);

/* ---------------- BASIC MIDDLEWARE ---------------- */

app.use(cookieParser());
app.use(express.json());

/* ---------------- CORS (FINAL + CORRECT) ---------------- */

const allowedOrigins = process.env.CLIENT_URLS
  ? process.env.CLIENT_URLS.split(",").map(o => o.trim())
  : [];

/**
 * Allow:
 * - Explicit CLIENT_URLS
 * - Any *.vercel.app (preview + prod)
 * - No-origin requests (mobile, curl)
 */
function isAllowedOrigin(origin) {
  if (!origin) return true;
  if (allowedOrigins.includes(origin)) return true;
  if (origin.endsWith(".vercel.app")) return true;
  return false;
}

const corsOptions = {
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Blocked by CORS"));
    }
  },
  credentials: true,
};

/* 🔥 IMPORTANT: handle preflight BEFORE routes */
app.options("*", cors(corsOptions));
app.use(cors(corsOptions));

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
    cookie: {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 1000 * 60 * 60 * 24 * 30,
    },
  })
);

/* ---------------- PASSPORT ---------------- */

app.use(passport.initialize());
app.use(passport.session());

/* ---------------- ROUTES ---------------- */

app.use("/auth", authRoutes);
app.use("/api/notes", notesRoutes);
app.use("/api/device", deviceRoutes);
app.use("/api/sync", notesRoutes); // if sync routes are here

app.get("/", (req, res) => {
  res.send("✅ Backend running fine");
});

/* ---------------- START SERVER ---------------- */

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`✅ Server running on port ${PORT}`)
);

export { pool };
