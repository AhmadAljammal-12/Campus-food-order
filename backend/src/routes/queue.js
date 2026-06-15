import { Router } from 'express';
import { body, param } from 'express-validator';
import { query } from '../config/db.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { validate } from '../middleware/error.js';
import { httpError } from '../utils/httpError.js';

const router = Router();
router.use(authenticate, authorize('staff', 'vendor', 'admin'));

router.get('/', asyncHandler(async (req, res) => {
  const params = {};
  let vendorFilter = '';
  if (req.user.role === 'vendor') {
    vendorFilter = 'WHERE vendor_profile.user_id = :userId';
    params.userId = req.user.id;
  }
  const rows = await query(
    `SELECT q.*, o.status order_status, o.pickup_time, u.full_name student_name, vendor_profile.vendor_name
     FROM queue_numbers q
     JOIN orders o ON o.id = q.order_id
     JOIN users u ON u.id = o.student_id
     JOIN vendors vendor_profile ON vendor_profile.id = o.vendor_id
     ${vendorFilter}
     ORDER BY FIELD(q.status, 'Called', 'Waiting', 'PickedUp', 'Cancelled'), q.queue_number`,
    params,
  );
  res.json(rows);
}));

router.patch('/:id', [param('id').isInt(), body('status').isIn(['Waiting', 'Called', 'PickedUp', 'Cancelled'])], validate, asyncHandler(async (req, res) => {
  const [queueItem] = await query('SELECT q.*, o.vendor_id FROM queue_numbers q JOIN orders o ON o.id = q.order_id WHERE q.id = :id', { id: req.params.id });
  if (!queueItem) throw httpError(404, 'Queue number not found');
  if (req.user.role === 'vendor') {
    const [vendor] = await query('SELECT id FROM vendors WHERE user_id = :id', { id: req.user.id });
    if (!vendor || vendor.id !== queueItem.vendor_id) throw httpError(403, 'Cannot update this queue number');
  }
  await query('UPDATE queue_numbers SET status = :status WHERE id = :id', { status: req.body.status, id: req.params.id });
  if (req.body.status === 'Called') await query('UPDATE orders SET status = \'Ready\' WHERE id = :orderId', { orderId: queueItem.order_id });
  if (req.body.status === 'PickedUp') await query('UPDATE orders SET status = \'Completed\' WHERE id = :orderId', { orderId: queueItem.order_id });
  if (req.body.status === 'Cancelled') await query('UPDATE orders SET status = \'Cancelled\' WHERE id = :orderId', { orderId: queueItem.order_id });
  const [updated] = await query('SELECT * FROM queue_numbers WHERE id = :id', { id: req.params.id });
  res.json(updated);
}));

export default router;
