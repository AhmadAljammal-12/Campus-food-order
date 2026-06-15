import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { body, param } from 'express-validator';
import { pool, query } from '../config/db.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { validate } from '../middleware/error.js';
import { httpError } from '../utils/httpError.js';

const router = Router();

router.get('/', asyncHandler(async (req, res) => {
  const vendors = await query(
    `SELECT v.*, u.full_name manager_name, u.email, u.enabled,
            COALESCE(AVG(r.rating), 0) average_rating, COUNT(DISTINCT r.id) review_count
     FROM vendors v JOIN users u ON u.id = v.user_id
     LEFT JOIN reviews r ON r.vendor_id = v.id
     GROUP BY v.id, u.id
     ORDER BY v.vendor_name`,
  );
  res.json(vendors);
}));

router.post('/', authenticate, authorize('admin'), [body('full_name').trim().isLength({ min: 2 }), body('email').isEmail().normalizeEmail(), body('password').isLength({ min: 8 }), body('vendor_name').trim().isLength({ min: 2 }), body('description').optional().trim()], validate, asyncHandler(async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const password = await bcrypt.hash(req.body.password, 12);
    const [userResult] = await conn.execute('INSERT INTO users (full_name, email, password, role) VALUES (?, ?, ?, ?)', [req.body.full_name, req.body.email, password, 'vendor']);
    const [vendorResult] = await conn.execute('INSERT INTO vendors (user_id, vendor_name, description) VALUES (?, ?, ?)', [userResult.insertId, req.body.vendor_name, req.body.description || null]);
    await conn.commit();
    res.status(201).json({ id: vendorResult.insertId, user_id: userResult.insertId, vendor_name: req.body.vendor_name, description: req.body.description || null });
  } catch (error) {
    await conn.rollback();
    if (error.code === 'ER_DUP_ENTRY') throw httpError(409, 'Email is already registered');
    throw error;
  } finally {
    conn.release();
  }
}));

router.put('/:id', authenticate, authorize('admin', 'vendor'), [param('id').isInt(), body('vendor_name').trim().isLength({ min: 2 }), body('description').optional().trim()], validate, asyncHandler(async (req, res) => {
  if (req.user.role === 'vendor') {
    const [vendor] = await query('SELECT id FROM vendors WHERE id = :id AND user_id = :userId', { id: req.params.id, userId: req.user.id });
    if (!vendor) throw httpError(403, 'Cannot update another vendor');
  }
  const result = await query('UPDATE vendors SET vendor_name = :vendor_name, description = :description WHERE id = :id', { vendor_name: req.body.vendor_name, description: req.body.description || null, id: req.params.id });
  if (result.affectedRows === 0) throw httpError(404, 'Vendor not found');
  const [vendor] = await query('SELECT * FROM vendors WHERE id = :id', { id: req.params.id });
  res.json(vendor);
}));

router.get('/analytics', authenticate, authorize('vendor', 'admin'), asyncHandler(async (req, res) => {
  const params = {};
  const filters = [];
  if (req.user.role === 'vendor') {
    filters.push('v.user_id = :userId');
    params.userId = req.user.id;
  }
  const rows = await query(
    `SELECT v.id, v.vendor_name, COUNT(DISTINCT o.id) orders, COALESCE(SUM(o.total_amount), 0) revenue,
            COALESCE(AVG(r.rating), 0) average_rating, COUNT(DISTINCT r.id) reviews
     FROM vendors v
     LEFT JOIN orders o ON o.vendor_id = v.id
     LEFT JOIN reviews r ON r.vendor_id = v.id
     ${filters.length ? `WHERE ${filters.join(' AND ')}` : ''}
     GROUP BY v.id
     ORDER BY revenue DESC`,
    params,
  );
  res.json(rows);
}));

export default router;
