import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { pool } from '../src/config/db.js';

dotenv.config();

const passwordHash = await bcrypt.hash('Password123!', 12);
const users = [
  ['Campus Admin', 'admin@campus.test', 'admin'],
  ['Student One', 'student@campus.test', 'student'],
  ['Vendor Manager', 'vendor@campus.test', 'vendor'],
  ['Pickup Staff', 'staff@campus.test', 'staff'],
];

const conn = await pool.getConnection();
try {
  await conn.beginTransaction();
  for (const [fullName, email, role] of users) {
    await conn.execute(
      `INSERT INTO users (full_name, email, password, role, enabled) VALUES (?, ?, ?, ?, TRUE)
       ON DUPLICATE KEY UPDATE full_name = VALUES(full_name), password = VALUES(password), role = VALUES(role), enabled = TRUE`,
      [fullName, email, passwordHash, role],
    );
  }
  const [[student]] = await conn.execute('SELECT id FROM users WHERE email = ?', ['student@campus.test']);
  await conn.execute('INSERT INTO carts (student_id) VALUES (?) ON DUPLICATE KEY UPDATE student_id = VALUES(student_id)', [student.id]);
  const [[vendorUser]] = await conn.execute('SELECT id FROM users WHERE email = ?', ['vendor@campus.test']);
  await conn.execute(
    `INSERT INTO vendors (user_id, vendor_name, description) VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE vendor_name = VALUES(vendor_name), description = VALUES(description)`,
    [vendorUser.id, 'Green Bowl Cafe', 'Healthy campus meals and smoothies.'],
  );
  const [[vendor]] = await conn.execute('SELECT id FROM vendors WHERE user_id = ?', [vendorUser.id]);
  const menuItems = [
    ['Chicken Rice Bowl', 'Grilled chicken with brown rice and vegetables.', 8.99, 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c', 50],
    ['Berry Smoothie', 'Mixed berries, banana and yogurt.', 4.99, 'https://images.unsplash.com/photo-1505252585461-04db1eb84625', 35],
    ['Veggie Wrap', 'Hummus, greens, peppers, and feta in a whole wheat wrap.', 6.75, 'https://images.unsplash.com/photo-1529059997568-3d847b1154f0', 40],
  ];
  for (const item of menuItems) {
    await conn.execute(
      `INSERT INTO menu_items (vendor_id, item_name, description, price, image, stock_quantity, available)
       VALUES (?, ?, ?, ?, ?, ?, TRUE)
       ON DUPLICATE KEY UPDATE description = VALUES(description), price = VALUES(price), image = VALUES(image), stock_quantity = VALUES(stock_quantity), available = TRUE`,
      [vendor.id, ...item],
    );
  }
  const settings = [
    ['pickupWindowMinutes', '15'],
    ['currency', 'USD'],
    ['paymentsEnabled', 'true'],
    ['reviewsEnabled', 'true'],
  ];
  for (const [key, value] of settings) {
    await conn.execute(
      `INSERT INTO system_settings (setting_key, setting_value) VALUES (?, ?)
       ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
      [key, value],
    );
  }
  await conn.commit();
  console.log('Seed data inserted. Password for all accounts: Password123!');
} catch (error) {
  await conn.rollback();
  console.error(error);
  process.exitCode = 1;
} finally {
  conn.release();
  await pool.end();
}
