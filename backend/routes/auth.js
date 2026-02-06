import express from "express";
import passport from "passport";

const router = express.Router();

/**
 * START GOOGLE LOGIN
 * We pass `client` via OAuth state (survives Google redirects)
 */
router.get("/google", (req, res, next) => {
  const client = req.query.client || "web";

  passport.authenticate("google", {
    scope: ["profile", "email"],
    state: client, // 🔑 survives redirect
  })(req, res, next);
});

/**
 * GOOGLE CALLBACK
 */
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    const client = req.query.state; // 🔑 returned by Google

    // 📱 APK → return control to Capacitor WebView
    if (client === "apk") {
      return res.redirect("capacitor://localhost");
    }

    // 🌐 Web users
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
    res.status(200).json({ ok: true });
  });
});

export default router;
