import express from "express";
import passport from "passport";

const router = express.Router();

/**
 * START GOOGLE LOGIN
 * Always starts on BACKEND domain
 */
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

/**
 * GOOGLE CALLBACK
 * Must END on FRONTEND domain
 */
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/auth/failure",
  }),
  (req, res) => {
    // 🔑 CRITICAL: redirect to FRONTEND, not backend
    res.redirect(process.env.FRONTEND_URL);
  }
);

/**
 * AUTH FAILURE (debug safe)
 */
router.get("/failure", (req, res) => {
  res.status(401).json({ error: "Authentication failed" });
});

/**
 * CURRENT USER
 */
router.get("/me", (req, res) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return res.json({ loggedIn: true, user: req.user });
  }
  return res.json({ loggedIn: false });
});

/**
 * LOGOUT
 */
router.post("/logout", (req, res, next) => {
  req.logout(err => {
    if (err) return next(err);

    // 🔑 MUST match cookie settings exactly
    res.clearCookie("connect.sid", {
      path: "/",
      secure: true,
      sameSite: "none",
    });

    res.json({ ok: true });
  });
});

export default router;
