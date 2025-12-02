// backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'change-me';

function authRequired(req, res, next) {
  const authHeader = req.headers.authorization || '';

  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization token missing.' });
  }

  const token = authHeader.substring(7); // remove 'Bearer '

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    // store user id on request for later use
    req.userId = payload.sub;
    next();
  } catch (err) {
    console.error('JWT verify error:', err.message);
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
}

module.exports = authRequired;

