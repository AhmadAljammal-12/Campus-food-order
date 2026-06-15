# TT5L Campus Food Ordering and Management System Checklist

| Requirement | Implemented | File locations | Missing work |
| --- | --- | --- | --- |
| React + Tailwind CSS frontend | Yes | `frontend/package.json`, `frontend/src/main.jsx`, `frontend/src/index.css`, `frontend/tailwind.config.js` | None |
| Node.js + Express backend | Yes | `backend/package.json`, `backend/src/server.js` | None |
| MySQL database integration | Yes | `backend/src/config/db.js`, `backend/database/schema.sql` | None |
| JWT authentication | Yes | `backend/src/routes/auth.js`, `backend/src/middleware/auth.js`, `backend/src/utils/tokens.js`, `frontend/src/context/AuthContext.jsx` | None |
| REST API architecture | Yes | `backend/src/server.js`, `backend/src/routes/*` | None |
| Student register and login | Yes | `backend/src/routes/auth.js`, `frontend/src/pages/public/Register.jsx`, `frontend/src/pages/public/Login.jsx` | None |
| Student browse vendor food menu | Yes | `backend/src/routes/menu.js`, `frontend/src/pages/student/StudentPages.jsx` | None |
| Student search food items | Yes | `backend/src/routes/menu.js`, `frontend/src/pages/student/StudentPages.jsx` | None |
| Student add items to cart | Yes | `backend/src/routes/cart.js`, `frontend/src/pages/student/StudentPages.jsx` | None |
| Student update cart quantity | Yes | `backend/src/routes/cart.js`, `frontend/src/pages/student/StudentPages.jsx` | None |
| Student remove items from cart | Yes | `backend/src/routes/cart.js`, `frontend/src/pages/student/StudentPages.jsx` | None |
| Student schedule pickup time | Yes | `backend/src/routes/orders.js`, `frontend/src/pages/student/StudentPages.jsx` | None |
| Student checkout and make payment | Yes | `backend/src/routes/orders.js`, `backend/database/schema.sql`, `frontend/src/pages/student/StudentPages.jsx` | Payments are recorded as simulated campus payments; no external gateway was required in the specification. |
| Student view order history | Yes | `backend/src/routes/orders.js`, `frontend/src/pages/student/StudentPages.jsx` | None |
| Student track order status in real time | Yes | `backend/src/routes/orders.js`, `frontend/src/pages/student/StudentPages.jsx` | Implemented as 10-second polling; WebSockets/SSE can be added later if strict push-based updates are desired. |
| Student submit ratings and reviews | Yes | `backend/src/routes/reviews.js`, `frontend/src/pages/student/StudentPages.jsx` | None |
| Vendor login | Yes | `backend/src/routes/auth.js`, `frontend/src/pages/public/Login.jsx` | None |
| Vendor manage menu items CRUD | Yes | `backend/src/routes/menu.js`, `frontend/src/pages/vendor/VendorPages.jsx` | None |
| Vendor manage inventory | Yes | `backend/src/routes/menu.js`, `frontend/src/pages/vendor/VendorPages.jsx` | None |
| Vendor view incoming orders | Yes | `backend/src/routes/orders.js`, `frontend/src/pages/vendor/VendorPages.jsx` | None |
| Vendor update order status: Pending, Confirmed, Preparing, Ready, Completed, Cancelled | Yes | `backend/src/routes/orders.js`, `frontend/src/pages/vendor/VendorPages.jsx` | None |
| Vendor manage order queue | Yes | `backend/src/routes/queue.js`, `frontend/src/pages/vendor/VendorPages.jsx` | None |
| Vendor sales analytics dashboard | Yes | `backend/src/routes/vendors.js`, `frontend/src/pages/vendor/VendorPages.jsx` | None |
| Admin login | Yes | `backend/src/routes/auth.js`, `frontend/src/pages/public/Login.jsx` | None |
| Admin manage students | Yes | `backend/src/routes/admin.js`, `frontend/src/pages/admin/AdminPages.jsx` | None |
| Admin manage vendors | Yes | `backend/src/routes/vendors.js`, `frontend/src/pages/admin/AdminPages.jsx` | None |
| Admin enable/disable accounts | Yes | `backend/src/routes/admin.js`, `frontend/src/pages/admin/AdminPages.jsx` | None |
| Admin view system reports | Yes | `backend/src/routes/admin.js`, `frontend/src/pages/admin/AdminPages.jsx` | None |
| Admin analytics dashboard | Yes | `backend/src/routes/admin.js`, `frontend/src/components/Dashboard.jsx` | None |
| Admin configure system settings | Yes | `backend/database/schema.sql`, `backend/src/routes/admin.js`, `frontend/src/pages/admin/AdminPages.jsx` | None |
| Staff login | Yes | `backend/src/routes/auth.js`, `frontend/src/pages/public/Login.jsx` | None |
| Staff call queue numbers | Yes | `backend/src/routes/queue.js`, `frontend/src/pages/staff/StaffPages.jsx`, `frontend/src/pages/vendor/VendorPages.jsx` | None |
| Staff confirm order pickup | Yes | `backend/src/routes/queue.js`, `frontend/src/pages/staff/StaffPages.jsx` | None |
| Staff update delivery/pickup status | Yes | `backend/src/routes/queue.js`, `frontend/src/pages/staff/StaffPages.jsx` | None |
| `users` table | Yes | `backend/database/schema.sql` | Added `enabled` for account disablement. |
| `vendors` table | Yes | `backend/database/schema.sql` | None |
| `menu_items` table | Yes | `backend/database/schema.sql` | Added unique vendor/item constraint for idempotent seeding. |
| `carts` table | Yes | `backend/database/schema.sql` | None |
| `cart_items` table | Yes | `backend/database/schema.sql` | None |
| `orders` table | Yes | `backend/database/schema.sql` | None |
| `order_items` table | Yes | `backend/database/schema.sql` | None |
| `payments` table | Yes | `backend/database/schema.sql` | None |
| `reviews` table | Yes | `backend/database/schema.sql` | None |
| `queue_numbers` table | Yes | `backend/database/schema.sql` | None |
| Public Home page | Yes | `frontend/src/pages/public/Home.jsx` | None |
| Public Login page | Yes | `frontend/src/pages/public/Login.jsx` | None |
| Public Register page | Yes | `frontend/src/pages/public/Register.jsx` | None |
| Student Dashboard page | Yes | `frontend/src/components/Dashboard.jsx`, `frontend/src/main.jsx` | None |
| Student Food Menu page | Yes | `frontend/src/pages/student/StudentPages.jsx` | None |
| Student Cart page | Yes | `frontend/src/pages/student/StudentPages.jsx` | None |
| Student Checkout page | Yes | `frontend/src/pages/student/StudentPages.jsx`, `frontend/src/main.jsx` | None |
| Student Track Order page | Yes | `frontend/src/pages/student/StudentPages.jsx`, `frontend/src/main.jsx` | None |
| Student Order History page | Yes | `frontend/src/pages/student/StudentPages.jsx`, `frontend/src/main.jsx` | None |
| Student Reviews page | Yes | `frontend/src/pages/student/StudentPages.jsx`, `frontend/src/main.jsx` | None |
| Vendor Dashboard page | Yes | `frontend/src/components/Dashboard.jsx`, `frontend/src/main.jsx` | None |
| Vendor Menu Management page | Yes | `frontend/src/pages/vendor/VendorPages.jsx`, `frontend/src/main.jsx` | None |
| Vendor Inventory Management page | Yes | `frontend/src/pages/vendor/VendorPages.jsx`, `frontend/src/main.jsx` | None |
| Vendor Orders page | Yes | `frontend/src/pages/vendor/VendorPages.jsx`, `frontend/src/main.jsx` | None |
| Vendor Queue Management page | Yes | `frontend/src/pages/vendor/VendorPages.jsx`, `frontend/src/main.jsx` | None |
| Vendor Sales Analytics page | Yes | `frontend/src/pages/vendor/VendorPages.jsx`, `frontend/src/main.jsx` | None |
| Admin Dashboard page | Yes | `frontend/src/components/Dashboard.jsx`, `frontend/src/main.jsx` | None |
| Admin User Management page | Yes | `frontend/src/pages/admin/AdminPages.jsx`, `frontend/src/main.jsx` | None |
| Admin Vendor Management page | Yes | `frontend/src/pages/admin/AdminPages.jsx`, `frontend/src/main.jsx` | None |
| Admin Reports page | Yes | `frontend/src/pages/admin/AdminPages.jsx`, `frontend/src/main.jsx` | None |
| Admin Analytics page | Yes | `frontend/src/components/Dashboard.jsx`, `frontend/src/main.jsx` | None |
| Staff Dashboard page | Yes | `frontend/src/components/Dashboard.jsx`, `frontend/src/main.jsx` | None |
| Staff Queue Control page | Yes | `frontend/src/pages/staff/StaffPages.jsx`, `frontend/src/main.jsx` | None |
| Staff Pickup Confirmation page | Yes | `frontend/src/pages/staff/StaffPages.jsx`, `frontend/src/main.jsx` | None |
| Responsive design | Yes | Tailwind classes throughout `frontend/src/components/*` and `frontend/src/pages/*` | None |
| Modern UI using Tailwind CSS | Yes | `frontend/src/index.css`, `frontend/src/components/*`, `frontend/src/pages/*` | None |
| Role-based authorization | Yes | `backend/src/middleware/auth.js`, `frontend/src/components/ProtectedRoute.jsx` | None |
| Input validation | Yes | `backend/src/routes/*`, frontend form constraints | None |
| Error handling | Yes | `backend/src/middleware/error.js`, `frontend/src/components/LoadingError.jsx` | None |
| Dashboard charts using Chart.js | Yes | `frontend/src/components/Dashboard.jsx`, `frontend/src/pages/vendor/VendorPages.jsx` | None |
| Clean folder structure | Yes | `backend/`, `frontend/`, `backend/database/`, `backend/scripts/` | None |
| Environment variables | Yes | `backend/.env.example`, `frontend/.env.example` | None |
| Seed data for testing | Yes | `backend/scripts/seed.js`, `backend/database/seed.sql` | None |
| Setup instructions | Yes | `README.md` | None |
