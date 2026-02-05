import jwt from 'jsonwebtoken';

export default function authJwt(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.sendStatus(401); // No token
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.sendStatus(401);
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    return res.sendStatus(403); // Invalid / expired token
  }
}
