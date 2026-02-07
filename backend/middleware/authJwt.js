// backend/middleware/jwt.js
import jwt from "jsonwebtoken";

export default function authJwt(req, res, next) {
  // ✅ Allow CORS preflight requests
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.sendStatus(401);
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.sendStatus(401);
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    return res.sendStatus(403);
  }
}
