import { Router } from 'express';
import { body, param } from 'express-validator';
import { query } from '../config/db.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { validate } from '../middleware/error.js';
import { httpError } from '../utils/httpError.js';

const router = Router();
router.use(authenticate, authorize('student'));

async function getCartId(studentId) {
  const [cart] = await query('SELECT id FROM carts WHERE student_id = :studentId', { studentId });
  if (cart) return cart.id;
  const result = await query('INSERT INTO carts (student_id) VALUES (:studentId)', { studentId });
  return result.insertId;
}

router.get('/', asyncHandler(async (req, res) => {
  const cartId = await getCartId(req.user.id);
  const items = await query(
    `SELECT ci.id, ci.menu_item_id, ci.quantity, mi.item_name, mi.description, mi.price, mi.image, mi.stock_quantity,
            mi.available, mi.vendor_id, v.vendor_name, (ci.quantity * mi.price) subtotal
     FROM cart_items ci
     JOIN menu_items mi ON mi.id = ci.menu_item_id
     JOIN vendors v ON v.id = mi.vendor_id
     WHERE ci.cart_id = :cartId
     ORDER BY ci.id`,
    { cartId },
  );
  res.json({ items, total: items.reduce((sum, item) => sum + Number(item.subtotal), 0) });
}));

router.post('/items', [body('menu_item_id').isInt(), body('quantity').isInt({ min: 1 })], validate, asyncHandler(async (req, res) => {
  const [item] = await query('SELECT id, available, stock_quantity FROM menu_items WHERE id = :id', { id: req.body.menu_item_id });
  if (!item || !item.available) throw httpError(404, 'Menu item is not available');
  const cartId = await getCartId(req.user.id);
  const [existing] = await query('SELECT quantity FROM cart_items WHERE cart_id = :cartId AND menu_item_id = :menuItemId', { cartId, menuItemId: req.body.menu_item_id });
  const desiredQuantity = Number(req.body.quantity) + Number(existing?.quantity || 0);
  if (item.stock_quantity < desiredQuantity) throw httpError(409, 'Not enough stock available');
  await query(
    `INSERT INTO cart_items (cart_id, menu_item_id, quantity) VALUES (:cartId, :menu_item_id, :quantity)
     ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)`,
    { cartId, ...req.body },
  );
  const [cartItem] = await query('SELECT * FROM cart_items WHERE cart_id = :cartId AND menu_item_id = :menu_item_id', { cartId, menu_item_id: req.body.menu_item_id });
  res.status(201).json(cartItem);
}));

router.put('/items/:id', [param('id').isInt(), body('quantity').isInt({ min: 1 })], validate, asyncHandler(async (req, res) => {
  const cartId = await getCartId(req.user.id);
  const [cartItemToUpdate] = await query('SELECT ci.menu_item_id, mi.stock_quantity FROM cart_items ci JOIN menu_items mi ON mi.id = ci.menu_item_id WHERE ci.id = :id AND ci.cart_id = :cartId', { id: req.params.id, cartId });
  if (!cartItemToUpdate) throw httpError(404, 'Cart item not found');
  if (cartItemToUpdate.stock_quantity < req.body.quantity) throw httpError(409, 'Not enough stock available');
  const result = await query('UPDATE cart_items SET quantity = :quantity WHERE id = :id AND cart_id = :cartId', { quantity: req.body.quantity, id: req.params.id, cartId });
  const [cartItem] = await query('SELECT * FROM cart_items WHERE id = :id', { id: req.params.id });
  res.json(cartItem);
}));

router.delete('/items/:id', [param('id').isInt()], validate, asyncHandler(async (req, res) => {
  const cartId = await getCartId(req.user.id);
  const result = await query('DELETE FROM cart_items WHERE id = :id AND cart_id = :cartId', { id: req.params.id, cartId });
  if (result.affectedRows === 0) throw httpError(404, 'Cart item not found');
  res.status(204).send();
}));

router.delete('/', asyncHandler(async (req, res) => {
  const cartId = await getCartId(req.user.id);
  await query('DELETE FROM cart_items WHERE cart_id = :cartId', { cartId });
  res.status(204).send();
}));

export default router;
