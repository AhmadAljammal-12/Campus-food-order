import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { body } from 'express-validator';
import { pool, query } from '../config/db.js';
import { validate } from '../middleware/error.js';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { httpError } from '../utils/httpError.js';
import { publicUser, signToken } from '../utils/tokens.js';

const router = Router();

router.post(
  '/register',
  [
    body('full_name').trim().isLength({ min: 2, max: 120 }).withMessage('Full name is required'),
    body('email').trim().isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 8 }).withMessage('Password must contain at least 8 characters'),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      const password = await bcrypt.hash(req.body.password, 12);
      const [result] = await conn.execute(
        'INSERT INTO users (full_name, email, password, role) VALUES (?, ?, ?, ?)',
        [req.body.full_name, req.body.email, password, 'student'],
      );
      await conn.execute('INSERT INTO carts (student_id) VALUES (?)', [result.insertId]);
      await conn.commit();
      const user = { id: result.insertId, full_name: req.body.full_name, email: req.body.email, role: 'student', enabled: 1 };
      res.status(201).json({ token: signToken(user), user });
    } catch (error) {
      await conn.rollback();
      if (error.code === 'ER_DUP_ENTRY') throw httpError(409, 'Email is already registered');
      throw error;
    } finally {
      conn.release();
    }
  }),
);

router.post(
  '/login',
  [body('email').trim().isEmail().normalizeEmail(), body('password').notEmpty()],
  validate,
  asyncHandler(async (req, res) => {
    const [user] = await query('SELECT * FROM users WHERE email = :email', { email: req.body.email });
    if (!user || !(await bcrypt.compare(req.body.password, user.password))) throw httpError(401, 'Invalid email or password');
    if (!user.enabled) throw httpError(403, 'Account is disabled');
    res.json({ token: signToken(user), user: publicUser(user) });
  }),
);

router.get('/me', authenticate, (req, res) => res.json({ user: req.user }));

export default router;
