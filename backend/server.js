console.log("🔥 RUNNING server.js ENTRY FILE");

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

/* ---------------- CORS (MUST BE FIRST) ---------------- */

const allowedOrigins = process.env.CLIENT_URLS
  ? process.env.CLIENT_URLS.split(",").map(o => o.trim())
  : [];

function isAllowedOrigin(origin) {
  if (!origin) return true; // mobile apps, curl
  if (allowedOrigins.includes(origin)) return true;
  if (origin.includes(".vercel.app")) return true;
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
app.use("/api/device", deviceRoutes);
app.use("/api/sync", syncRoutes);

app.get("/", (req, res) => {
  res.send("✅ Backend running fine");
});

app.get("/__version", (req, res) => {
  res.json({ version: "cors-fix-2026-02-07" });
});


/* ---------------- START SERVER ---------------- */

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});

export { pool };
