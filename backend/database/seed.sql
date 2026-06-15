USE campus_food_ordering;
-- Static sample data. For guaranteed working bcrypt hashes, prefer: npm run seed --prefix backend
-- Password hash below is for demo use only; the JS seeder generates fresh bcrypt hashes for Password123!.
INSERT INTO users (full_name,email,password,role,enabled) VALUES
('Campus Admin','admin@campus.test','$2a$10$/1v1RJ6dzlgvGDRNmEsYke1rEVn2KNzSvMMUUYYzdG9xcNqXBgZ2S','admin',true),
('Student One','student@campus.test','$2a$10$/1v1RJ6dzlgvGDRNmEsYke1rEVn2KNzSvMMUUYYzdG9xcNqXBgZ2S','student',true),
('Vendor Manager','vendor@campus.test','$2a$10$/1v1RJ6dzlgvGDRNmEsYke1rEVn2KNzSvMMUUYYzdG9xcNqXBgZ2S','vendor',true),
('Pickup Staff','staff@campus.test','$2a$10$/1v1RJ6dzlgvGDRNmEsYke1rEVn2KNzSvMMUUYYzdG9xcNqXBgZ2S','staff',true)
ON DUPLICATE KEY UPDATE full_name=VALUES(full_name), role=VALUES(role), enabled=true;
INSERT INTO carts (student_id) SELECT id FROM users WHERE email='student@campus.test' ON DUPLICATE KEY UPDATE student_id=VALUES(student_id);
INSERT INTO vendors (user_id,vendor_name,description) SELECT id,'Green Bowl Cafe','Healthy campus meals and smoothies.' FROM users WHERE email='vendor@campus.test' ON DUPLICATE KEY UPDATE vendor_name=VALUES(vendor_name), description=VALUES(description);
INSERT INTO menu_items (vendor_id,item_name,description,price,image,stock_quantity,available) SELECT v.id,'Chicken Rice Bowl','Grilled chicken with brown rice and vegetables.',8.99,'https://images.unsplash.com/photo-1546069901-ba9599a7e63c',50,true FROM vendors v WHERE vendor_name='Green Bowl Cafe'
ON DUPLICATE KEY UPDATE description=VALUES(description), price=VALUES(price), image=VALUES(image), stock_quantity=VALUES(stock_quantity), available=true;
INSERT INTO menu_items (vendor_id,item_name,description,price,image,stock_quantity,available) SELECT v.id,'Berry Smoothie','Mixed berries, banana and yogurt.',4.99,'https://images.unsplash.com/photo-1505252585461-04db1eb84625',35,true FROM vendors v WHERE vendor_name='Green Bowl Cafe'
ON DUPLICATE KEY UPDATE description=VALUES(description), price=VALUES(price), image=VALUES(image), stock_quantity=VALUES(stock_quantity), available=true;
INSERT INTO menu_items (vendor_id,item_name,description,price,image,stock_quantity,available) SELECT v.id,'Veggie Wrap','Hummus, greens, peppers, and feta in a whole wheat wrap.',6.75,'https://images.unsplash.com/photo-1529059997568-3d847b1154f0',40,true FROM vendors v WHERE vendor_name='Green Bowl Cafe'
ON DUPLICATE KEY UPDATE description=VALUES(description), price=VALUES(price), image=VALUES(image), stock_quantity=VALUES(stock_quantity), available=true;

INSERT INTO system_settings (setting_key, setting_value) VALUES
('pickupWindowMinutes', '15'),
('currency', 'USD'),
('paymentsEnabled', 'true'),
('reviewsEnabled', 'true')
ON DUPLICATE KEY UPDATE setting_value=VALUES(setting_value);
