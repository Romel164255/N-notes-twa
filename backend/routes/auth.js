import express from "express";
import passport from "passport";

const router = express.Router();

/**
 * START GOOGLE LOGIN
 * OAuth always starts on OUR domain
 */
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

/**
 * GOOGLE CALLBACK
 * OAuth always ends on OUR domain
 */
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/",
  }),
  (req, res) => {
    // ✅ Stay inside the trusted origin
    res.redirect("/");
    // or "/app" or "/dashboard"
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
