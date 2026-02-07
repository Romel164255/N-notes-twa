import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import crypto from "crypto";
import { pool } from "../db.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID_WEB,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const googleSub = profile.id;
        const email = profile.emails?.[0]?.value || null;
        const name = profile.displayName || null;
        const picture = profile.photos?.[0]?.value || null;

        const subHash = crypto
          .createHash("sha256")
          .update(googleSub)
          .digest("hex");

        const result = await pool.query(
          "SELECT * FROM users WHERE google_sub_hash = $1",
          [subHash]
        );

        let user;

        if (result.rows.length === 0) {
          const insert = await pool.query(
            `
            INSERT INTO users
            (google_sub_hash, google_sub, email, name, picture, last_login)
            VALUES ($1, $2, $3, $4, $5, NOW())
            RETURNING *
            `,
            [subHash, googleSub, email, name, picture]
          );
          user = insert.rows[0];
        } else {
          user = result.rows[0];
          await pool.query(
            `
            UPDATE users
            SET last_login = NOW(), picture = $1
            WHERE id = $2
            `,
            [picture, user.id]
          );
        }

        return done(null, user);
      } catch (err) {
        console.error("Passport error:", err);
        return done(err);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const res = await pool.query(
      "SELECT * FROM users WHERE id = $1",
      [id]
    );
    done(null, res.rows[0]);
  } catch (err) {
    done(err);
  }
});
