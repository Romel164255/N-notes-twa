import express from "express";
import passport from "passport";

const router = express.Router();

/**
 * START GOOGLE LOGIN
 * - Stores who started login (apk / web_new / web_old)
 */
router.get(
  "/google",
  (req, res, next) => {
    // client can be: apk | web_new | web_old
    req.session.client = req.query.client || "web_old";
    next();
  },
  passport.authenticate("google", { scope: ["profile", "email"] })
);

/**
 * GOOGLE CALLBACK
 * - Redirects based on stored client
 */
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    try {
      const client = req.session.client;

      // 🔥 APK → return INTO app
      if (client === "apk") {
        return res.redirect("capacitor://localhost");
      }

      // 🟢 New web UI
      if (client === "web_new") {
        return res.redirect("https://n-notes-twa.vercel.app");
      }

      // ⚪ Old web fallback
      return res.redirect("https://n-notes-twa.vercel.app/");
    } catch (err) {
      console.error("❌ Auth redirect error:", err);
      return res.redirect("https://n-notes-twa.vercel.app/");
    }
  }
);

/**
 * CURRENT USER
 */
router.get("/me", (req, res) => {
  res.json(
    req.isAuthenticated()
      ? { loggedIn: true, user: req.user }
      : { loggedIn: false }
  );
});

/**
 * LOGOUT
 */
router.get("/logout", (req, res, next) => {
  req.logout(err => {
    if (err) return next(err);
    res.clearCookie("connect.sid");
    res.status(200).json({ ok: true });
  });
});

export default router;
