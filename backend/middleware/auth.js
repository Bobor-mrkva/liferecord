const jwt = require('jsonwebtoken');
const db = require('../db');

const getUserFromToken = (token) => {
  if (!token) return null;
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = db
      .prepare('SELECT id, email, display_name FROM users WHERE id = ?')
      .get(payload.sub);
    return user || null;
  } catch {
    return null;
  }
};

const requireAuth = (req, res, next) => {
  const user = getUserFromToken(req.cookies.lr_token);
  if (!user) return res.status(401).json({ error: 'Not authenticated' });
  req.user = user;
  next();
};

const optionalAuth = (req, res, next) => {
  req.user = getUserFromToken(req.cookies.lr_token);
  next();
};

module.exports = { requireAuth, optionalAuth };
