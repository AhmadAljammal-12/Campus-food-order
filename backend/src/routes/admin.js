import { Router } from 'express';
import { body, param } from 'express-validator';
import { query } from '../config/db.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { validate } from '../middleware/error.js';
import { httpError } from '../utils/httpError.js';

const router = Router();
router.use(authenticate, authorize('admin'));

router.get('/users', asyncHandler(async (req, res) => {
  const users = await query('SELECT id, full_name, email, role, enabled, created_at FROM users ORDER BY created_at DESC');
  res.json(users);
}));

router.patch('/users/:id/enabled', [param('id').isInt(), body('enabled').isBoolean()], validate, asyncHandler(async (req, res) => {
  if (Number(req.params.id) === req.user.id && req.body.enabled === false) throw httpError(400, 'Admins cannot disable their own account');
  const result = await query('UPDATE users SET enabled = :enabled WHERE id = :id', { enabled: req.body.enabled, id: req.params.id });
  if (result.affectedRows === 0) throw httpError(404, 'User not found');
  const [user] = await query('SELECT id, full_name, email, role, enabled, created_at FROM users WHERE id = :id', { id: req.params.id });
  res.json(user);
}));

router.get('/reports', asyncHandler(async (req, res) => {
  const [summary] = await query(
    `SELECT COUNT(*) total_orders, COALESCE(SUM(total_amount), 0) total_revenue,
            COALESCE(SUM(status = 'Completed'), 0) completed_orders, COALESCE(SUM(status = 'Cancelled'), 0) cancelled_orders
     FROM orders`,
  );
  const usersByRole = await query('SELECT role, COUNT(*) total FROM users GROUP BY role ORDER BY role');
  const salesByVendor = await query(
    `SELECT v.vendor_name, COUNT(o.id) orders, COALESCE(SUM(o.total_amount), 0) revenue
     FROM vendors v LEFT JOIN orders o ON o.vendor_id = v.id GROUP BY v.id ORDER BY revenue DESC`,
  );
  const popularItems = await query(
    `SELECT mi.item_name, SUM(oi.quantity) quantity_sold, SUM(oi.quantity * oi.price) revenue
     FROM order_items oi JOIN menu_items mi ON mi.id = oi.menu_item_id
     GROUP BY mi.id ORDER BY quantity_sold DESC LIMIT 10`,
  );
  res.json({ summary, usersByRole, salesByVendor, popularItems });
}));

router.get('/settings', asyncHandler(async (req, res) => {
  const rows = await query('SELECT setting_key, setting_value FROM system_settings ORDER BY setting_key');
  const settings = Object.fromEntries(rows.map((row) => [row.setting_key, row.setting_value]));
  res.json(settings);
}));

router.put(
  '/settings',
  [
    body('pickupWindowMinutes').isInt({ min: 1, max: 240 }),
    body('currency').trim().isLength({ min: 3, max: 3 }),
    body('paymentsEnabled').isBoolean(),
    body('reviewsEnabled').isBoolean(),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const settings = {
      pickupWindowMinutes: String(req.body.pickupWindowMinutes),
      currency: req.body.currency.toUpperCase(),
      paymentsEnabled: String(req.body.paymentsEnabled),
      reviewsEnabled: String(req.body.reviewsEnabled),
    };
    await Promise.all(Object.entries(settings).map(([key, value]) => query(
      `INSERT INTO system_settings (setting_key, setting_value) VALUES (:key, :value)
       ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
      { key, value },
    )));
    res.json(settings);
  }),
);

export default router;
