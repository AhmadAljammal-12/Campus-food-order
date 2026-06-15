import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';
import { httpError } from '../utils/httpError.js';

export async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) throw httpError(401, 'Authentication required');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const [user] = await query('SELECT id, full_name, email, role, enabled, created_at FROM users WHERE id = :id', { id: decoded.id });
    if (!user) throw httpError(401, 'User no longer exists');
    if (!user.enabled) throw httpError(403, 'Account is disabled');
    req.user = user;
    next();
  } catch (error) {
    next(error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError' ? httpError(401, 'Invalid or expired token') : error);
  }
}

export function authorize(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) return next(httpError(403, 'Insufficient permissions'));
    return next();
  };
}
