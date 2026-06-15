import { Router } from 'express';
import { body, param, query as queryParam } from 'express-validator';
import { query } from '../config/db.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { validate } from '../middleware/error.js';
import { httpError } from '../utils/httpError.js';

const router = Router();

async function getVendorForUser(userId) {
  const [vendor] = await query('SELECT id FROM vendors WHERE user_id = :userId', { userId });
  if (!vendor) throw httpError(404, 'Vendor profile not found');
  return vendor.id;
}

async function assertMenuOwnership(user, itemId) {
  if (user.role === 'admin') return;
  const [row] = await query('SELECT mi.id FROM menu_items mi JOIN vendors v ON v.id = mi.vendor_id WHERE mi.id = :itemId AND v.user_id = :userId', { itemId, userId: user.id });
  if (!row) throw httpError(403, 'You can only manage your own menu items');
}


router.get('/mine', authenticate, authorize('vendor'), asyncHandler(async (req, res) => {
  const vendorId = await getVendorForUser(req.user.id);
  const rows = await query(
    `SELECT mi.*, v.vendor_name FROM menu_items mi JOIN vendors v ON v.id = mi.vendor_id
     WHERE mi.vendor_id = :vendorId ORDER BY mi.item_name`,
    { vendorId },
  );
  res.json(rows);
}));

router.get(
  '/',
  [queryParam('search').optional().trim(), queryParam('vendor_id').optional().isInt()],
  validate,
  asyncHandler(async (req, res) => {
    const params = { search: `%${req.query.search || ''}%` };
    const filters = ['(mi.item_name LIKE :search OR mi.description LIKE :search OR v.vendor_name LIKE :search)'];
    if (req.query.vendor_id) {
      params.vendorId = Number(req.query.vendor_id);
      filters.push('mi.vendor_id = :vendorId');
    }
    if (req.query.include_unavailable !== 'true') filters.push('mi.available = 1');
    const rows = await query(
      `SELECT mi.*, v.vendor_name FROM menu_items mi JOIN vendors v ON v.id = mi.vendor_id WHERE ${filters.join(' AND ')} ORDER BY v.vendor_name, mi.item_name`,
      params,
    );
    res.json(rows);
  }),
);

router.post(
  '/',
  authenticate,
  authorize('vendor', 'admin'),
  [
    body('vendor_id').optional().isInt(),
    body('item_name').trim().isLength({ min: 2, max: 150 }),
    body('description').optional({ nullable: true }).trim().isLength({ max: 1000 }),
    body('price').isFloat({ min: 0 }),
    body('image').optional({ nullable: true }).isURL(),
    body('stock_quantity').isInt({ min: 0 }),
    body('available').optional().isBoolean(),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const vendorId = req.user.role === 'vendor' ? await getVendorForUser(req.user.id) : req.body.vendor_id;
    if (!vendorId) throw httpError(422, 'vendor_id is required for admin-created menu items');
    const result = await query(
      `INSERT INTO menu_items (vendor_id, item_name, description, price, image, stock_quantity, available)
       VALUES (:vendorId, :item_name, :description, :price, :image, :stock_quantity, :available)`,
      { vendorId, description: null, image: null, available: true, ...req.body },
    );
    const [item] = await query('SELECT * FROM menu_items WHERE id = :id', { id: result.insertId });
    res.status(201).json(item);
  }),
);

router.put(
  '/:id',
  authenticate,
  authorize('vendor', 'admin'),
  [param('id').isInt(), body('item_name').trim().isLength({ min: 2, max: 150 }), body('price').isFloat({ min: 0 }), body('stock_quantity').isInt({ min: 0 }), body('available').isBoolean()],
  validate,
  asyncHandler(async (req, res) => {
    await assertMenuOwnership(req.user, req.params.id);
    await query(
      `UPDATE menu_items SET item_name = :item_name, description = :description, price = :price, image = :image,
       stock_quantity = :stock_quantity, available = :available WHERE id = :id`,
      { description: null, image: null, ...req.body, id: req.params.id },
    );
    const [item] = await query('SELECT * FROM menu_items WHERE id = :id', { id: req.params.id });
    res.json(item);
  }),
);

router.delete('/:id', authenticate, authorize('vendor', 'admin'), [param('id').isInt()], validate, asyncHandler(async (req, res) => {
  await assertMenuOwnership(req.user, req.params.id);
  await query('DELETE FROM menu_items WHERE id = :id', { id: req.params.id });
  res.status(204).send();
}));

export default router;
