import express from "express";
import passport from "passport";

const router = express.Router();

/**
 * START GOOGLE LOGIN
 * Use OAuth state to remember client
 */
router.get("/google", (req, res, next) => {
  const client = req.query.client || "web";

  passport.authenticate("google", {
    scope: ["profile", "email"],
    state: client, // 🔑 survives OAuth round-trip
  })(req, res, next);
});

/**
 * GOOGLE CALLBACK
 * Redirect explicitly — no env fallbacks
 */
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    const client = req.query.state;

    // 📱 Android app
    if (client === "apk") {
      return res.redirect("capacitor://localhost");
    }

    // 🌐 Web (ONLY ONE)
    return res.redirect("https://n-notes-twa.vercel.app");
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
    res.json({ ok: true });
  });
});

export default router;
