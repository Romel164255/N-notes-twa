import express from "express";
import passport from "passport";

const router = express.Router();

// 🧠 Start Google login
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// 🧠 Handle Google callback
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    try {
      //  Read allowed frontend URLs from env variable
      const allowedUrls = process.env.CLIENT_URLS
        ? process.env.CLIENT_URLS.split(",").map(url => url.trim())
        : [];

      //  Detect which domain initiated login
      const origin = req.get("origin") || req.get("referer");
      let redirectTo = allowedUrls[0]; // fallback to first

      if (origin) {
        const match = allowedUrls.find(url => origin.startsWith(url));
        if (match) redirectTo = match;
      }

      console.log(`🔁 Redirecting user to: ${redirectTo}`);
      res.redirect(redirectTo);
    } catch (error) {
      console.error("❌ Redirect error:", error.message);
      res.redirect(allowedUrls[0] || "/");
    }
  }
);

// 🧠 Return current authenticated user
router.get("/me", (req, res) => {
  res.json(req.isAuthenticated()
    ? { loggedIn: true, user: req.user }
    : { loggedIn: false });
});

// 🧠 Logout
router.get("/logout", (req, res, next) => {
  req.logout(err => {
    if (err) return next(err);
    res.clearCookie("connect.sid");
    res.status(200).json({ ok: true });
  });
});

export default router;
