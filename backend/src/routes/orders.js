import { Router } from 'express';
import { body, param } from 'express-validator';
import { pool, query } from '../config/db.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { validate } from '../middleware/error.js';
import { httpError } from '../utils/httpError.js';

const STATUSES = ['Pending', 'Confirmed', 'Preparing', 'Ready', 'Completed', 'Cancelled'];
const router = Router();
router.use(authenticate);

router.get('/', asyncHandler(async (req, res) => {
  const params = {};
  const filters = [];
  let vendorJoin = '';
  if (req.user.role === 'student') {
    filters.push('o.student_id = :userId');
    params.userId = req.user.id;
  }
  if (req.user.role === 'vendor') {
    vendorJoin = 'JOIN vendors own_vendor ON own_vendor.id = o.vendor_id';
    filters.push('own_vendor.user_id = :userId');
    params.userId = req.user.id;
  }
  const orders = await query(
    `SELECT o.*, u.full_name student_name, v.vendor_name, q.queue_number, q.status queue_status
     FROM orders o
     JOIN users u ON u.id = o.student_id
     JOIN vendors v ON v.id = o.vendor_id
     LEFT JOIN queue_numbers q ON q.order_id = o.id
     ${vendorJoin}
     ${filters.length ? `WHERE ${filters.join(' AND ')}` : ''}
     ORDER BY o.created_at DESC`,
    params,
  );
  res.json(orders);
}));

router.get('/:id', [param('id').isInt()], validate, asyncHandler(async (req, res) => {
  const [order] = await query(
    `SELECT o.*, u.full_name student_name, v.vendor_name, q.queue_number, q.status queue_status
     FROM orders o JOIN users u ON u.id = o.student_id JOIN vendors v ON v.id = o.vendor_id
     LEFT JOIN queue_numbers q ON q.order_id = o.id WHERE o.id = :id`,
    { id: req.params.id },
  );
  if (!order) throw httpError(404, 'Order not found');
  if (req.user.role === 'student' && order.student_id !== req.user.id) throw httpError(403, 'Cannot view this order');
  if (req.user.role === 'vendor') {
    const [vendor] = await query('SELECT id FROM vendors WHERE user_id = :id', { id: req.user.id });
    if (!vendor || vendor.id !== order.vendor_id) throw httpError(403, 'Cannot view this order');
  }
  order.items = await query('SELECT oi.*, mi.item_name FROM order_items oi JOIN menu_items mi ON mi.id = oi.menu_item_id WHERE oi.order_id = :id', { id: order.id });
  res.json(order);
}));

router.post('/checkout', authorize('student'), [body('pickup_time').isISO8601(), body('payment_method').trim().notEmpty()], validate, asyncHandler(async (req, res) => {
  const pickupTime = new Date(req.body.pickup_time);
  if (pickupTime.getTime() < Date.now()) throw httpError(422, 'Pickup time must be in the future');
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [items] = await conn.execute(
      `SELECT ci.id cart_item_id, ci.menu_item_id, ci.quantity, mi.price, mi.vendor_id, mi.stock_quantity, mi.available
       FROM carts c JOIN cart_items ci ON ci.cart_id = c.id JOIN menu_items mi ON mi.id = ci.menu_item_id
       WHERE c.student_id = ? FOR UPDATE`,
      [req.user.id],
    );
    if (!items.length) throw httpError(400, 'Cart is empty');
    const vendorId = items[0].vendor_id;
    if (items.some((item) => item.vendor_id !== vendorId)) throw httpError(400, 'Checkout supports one vendor per order');
    for (const item of items) {
      if (!item.available) throw httpError(409, 'One or more items are no longer available');
      if (item.stock_quantity < item.quantity) throw httpError(409, `Insufficient stock for menu item ${item.menu_item_id}`);
    }
    const total = items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
    const [orderResult] = await conn.execute(
      'INSERT INTO orders (student_id, vendor_id, total_amount, pickup_time, payment_status) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, vendorId, total, pickupTime, 'Paid'],
    );
    for (const item of items) {
      await conn.execute('INSERT INTO order_items (order_id, menu_item_id, quantity, price) VALUES (?, ?, ?, ?)', [orderResult.insertId, item.menu_item_id, item.quantity, item.price]);
      await conn.execute('UPDATE menu_items SET stock_quantity = stock_quantity - ? WHERE id = ?', [item.quantity, item.menu_item_id]);
    }
    await conn.execute('INSERT INTO payments (order_id, payment_method, amount, payment_status) VALUES (?, ?, ?, ?)', [orderResult.insertId, req.body.payment_method, total, 'Paid']);
    await conn.execute('INSERT INTO queue_numbers (order_id, queue_number, status) VALUES (?, ?, ?)', [orderResult.insertId, orderResult.insertId + 1000, 'Waiting']);
    await conn.execute('DELETE ci FROM cart_items ci JOIN carts c ON c.id = ci.cart_id WHERE c.student_id = ?', [req.user.id]);
    await conn.commit();
    res.status(201).json({ id: orderResult.insertId, total_amount: total, status: 'Pending', payment_status: 'Paid', queue_number: orderResult.insertId + 1000 });
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}));

router.patch('/:id/status', authorize('vendor', 'staff', 'admin'), [param('id').isInt(), body('status').isIn(STATUSES)], validate, asyncHandler(async (req, res) => {
  if (req.user.role === 'vendor') {
    const [order] = await query('SELECT o.id FROM orders o JOIN vendors v ON v.id = o.vendor_id WHERE o.id = :orderId AND v.user_id = :userId', { orderId: req.params.id, userId: req.user.id });
    if (!order) throw httpError(403, 'Cannot update this order');
  }
  const result = await query('UPDATE orders SET status = :status WHERE id = :id', { status: req.body.status, id: req.params.id });
  if (result.affectedRows === 0) throw httpError(404, 'Order not found');
  if (req.body.status === 'Ready') await query('UPDATE queue_numbers SET status = \'Waiting\' WHERE order_id = :id', { id: req.params.id });
  if (['Completed', 'Cancelled'].includes(req.body.status)) await query('UPDATE queue_numbers SET status = :queueStatus WHERE order_id = :id', { queueStatus: req.body.status === 'Completed' ? 'PickedUp' : 'Cancelled', id: req.params.id });
  const [order] = await query('SELECT * FROM orders WHERE id = :id', { id: req.params.id });
  res.json(order);
}));

export default router;
