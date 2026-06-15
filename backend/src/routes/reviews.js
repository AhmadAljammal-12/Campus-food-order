import { Router } from 'express';
import { body, param, query as queryParam } from 'express-validator';
import { query } from '../config/db.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { validate } from '../middleware/error.js';
import { httpError } from '../utils/httpError.js';

const router = Router();

router.get('/', [queryParam('vendor_id').optional().isInt()], validate, asyncHandler(async (req, res) => {
  const params = {};
  const filters = [];
  if (req.query.vendor_id) {
    params.vendorId = Number(req.query.vendor_id);
    filters.push('r.vendor_id = :vendorId');
  }
  const rows = await query(
    `SELECT r.*, u.full_name student_name, v.vendor_name
     FROM reviews r JOIN users u ON u.id = r.student_id JOIN vendors v ON v.id = r.vendor_id
     ${filters.length ? `WHERE ${filters.join(' AND ')}` : ''}
     ORDER BY r.created_at DESC`,
    params,
  );
  res.json(rows);
}));

router.post('/', authenticate, authorize('student'), [body('vendor_id').isInt(), body('rating').isInt({ min: 1, max: 5 }), body('comment').optional().trim().isLength({ max: 1000 })], validate, asyncHandler(async (req, res) => {
  const [completedOrder] = await query('SELECT id FROM orders WHERE student_id = :studentId AND vendor_id = :vendorId AND status = \'Completed\' LIMIT 1', { studentId: req.user.id, vendorId: req.body.vendor_id });
  if (!completedOrder) throw httpError(403, 'You can review vendors after a completed order');
  const result = await query('INSERT INTO reviews (student_id, vendor_id, rating, comment) VALUES (:studentId, :vendor_id, :rating, :comment)', { studentId: req.user.id, comment: '', ...req.body });
  const [review] = await query('SELECT * FROM reviews WHERE id = :id', { id: result.insertId });
  res.status(201).json(review);
}));

router.delete('/:id', authenticate, [param('id').isInt()], validate, asyncHandler(async (req, res) => {
  const params = { id: req.params.id };
  let sql = 'DELETE FROM reviews WHERE id = :id';
  if (req.user.role === 'student') {
    sql += ' AND student_id = :studentId';
    params.studentId = req.user.id;
  } else if (!['admin'].includes(req.user.role)) {
    throw httpError(403, 'Insufficient permissions');
  }
  const result = await query(sql, params);
  if (result.affectedRows === 0) throw httpError(404, 'Review not found');
  res.status(204).send();
}));

export default router;
