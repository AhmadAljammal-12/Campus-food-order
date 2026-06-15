# Campus Food Ordering and Management System

A production-oriented full-stack campus dining application with Student, Vendor, Admin, and Staff role workflows.

## Stack
- Frontend: React, Vite, Tailwind CSS, Chart.js
- Backend: Node.js, Express, JWT, express-validator
- Database: MySQL via `mysql2/promise`
- Architecture: REST API with role-based authorization

## Features
### Student
Register/login, browse and search menus, manage cart quantities, checkout with pickup time and payment method, track orders/queue numbers, view order history, and submit vendor reviews after completed orders.

### Vendor
Login, create/update/delete menu items, update inventory/availability, view incoming orders, advance order statuses, manage queue numbers, and view sales analytics.

### Admin
Login, manage users and account enablement, create vendors, view system reports, analytics, and settings.

### Staff
Login, call queue numbers, confirm pickups, and update pickup/queue statuses.

## Prerequisites
Install these before running the project locally:
- Node.js 20 or newer
- npm 10 or newer
- MySQL 8 or newer
- A MySQL user that can create and write to the `campus_food_ordering` database

## Local Setup Commands
Run the following commands from the repository root.

### 1. Install root tooling
The root project uses `concurrently` to run the backend and frontend together.

```bash
npm install
```

### 2. Install backend and frontend dependencies

```bash
npm run install:all
```

### 3. Create environment files

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

### 4. Configure `backend/.env`
Edit `backend/.env` to match your MySQL credentials and set a strong JWT secret. `JWT_SECRET` must be at least 32 characters.

```bash
PORT=5000
NODE_ENV=development
JWT_SECRET=replace-this-with-a-very-long-random-secret
JWT_EXPIRES_IN=1d
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=campus_food_ordering
FRONTEND_URL=http://localhost:5173
```

### 5. Configure `frontend/.env`
The default value works when the backend runs on port `5000`.

```bash
VITE_API_URL=http://localhost:5000/api
```

### 6. Create the MySQL schema
This script creates the `campus_food_ordering` database and all required tables.

```bash
mysql -u root -p < backend/database/schema.sql
```

If you use a non-root MySQL user, replace `root` with that username:

```bash
mysql -u your_mysql_user -p < backend/database/schema.sql
```

### 7. Seed demo data
The JavaScript seeder creates working bcrypt password hashes for the seed accounts.

```bash
npm run seed
```

### 8. Start the full app

```bash
npm run dev
```

The services will be available at:
- Frontend: <http://localhost:5173>
- Backend API: <http://localhost:5000/api>
- Health check: <http://localhost:5000/api/health>

## Running Services Separately
If you prefer separate terminals, use these commands.

Terminal 1 — backend API:

```bash
npm run dev --prefix backend
```

Terminal 2 — frontend app:

```bash
npm run dev --prefix frontend
```

## Seed Accounts
The JavaScript seeder creates all seed accounts with password `Password123!`.

| Role | Email | Password |
| --- | --- | --- |
| Student | `student@campus.test` | `Password123!` |
| Vendor | `vendor@campus.test` | `Password123!` |
| Admin | `admin@campus.test` | `Password123!` |
| Staff | `staff@campus.test` | `Password123!` |

## Quick Verification
After `npm run dev` starts both services, verify the app with these checks:

```bash
curl http://localhost:5000/api/health
```

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student@campus.test","password":"Password123!"}'
```

Then open <http://localhost:5173>, log in with any seed account, and confirm you are redirected to the correct role dashboard.

## REST API
- Auth: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- Menu: `GET /api/menu`, `GET /api/menu/mine`, `POST /api/menu`, `PUT /api/menu/:id`, `DELETE /api/menu/:id`
- Cart: `GET /api/cart`, `POST /api/cart/items`, `PUT /api/cart/items/:id`, `DELETE /api/cart/items/:id`, `DELETE /api/cart`
- Orders: `GET /api/orders`, `GET /api/orders/:id`, `POST /api/orders/checkout`, `PATCH /api/orders/:id/status`
- Queue: `GET /api/queue`, `PATCH /api/queue/:id`
- Reviews: `GET /api/reviews`, `POST /api/reviews`, `DELETE /api/reviews/:id`
- Vendors: `GET /api/vendors`, `POST /api/vendors`, `PUT /api/vendors/:id`, `GET /api/vendors/analytics`
- Admin: `GET /api/admin/users`, `PATCH /api/admin/users/:id/enabled`, `GET /api/admin/reports`, `GET /api/admin/settings`, `PUT /api/admin/settings`

## Troubleshooting
- **`JWT_SECRET must be set to at least 32 characters`**: update `backend/.env` with a longer secret.
- **`ER_ACCESS_DENIED_ERROR` or `ER_BAD_DB_ERROR`**: verify `DB_USER`, `DB_PASSWORD`, and `DB_NAME` in `backend/.env`, then rerun the schema command.
- **Frontend cannot reach API**: confirm `VITE_API_URL=http://localhost:5000/api` and `FRONTEND_URL=http://localhost:5173`.
- **Port already in use**: change `PORT` in `backend/.env`; if the frontend port is busy, Vite will print the alternate local URL.

## Requirements Checklist
A full TT5L requirement-by-requirement implementation checklist is available in [`REQUIREMENTS_CHECKLIST.md`](REQUIREMENTS_CHECKLIST.md).

## Project Structure
```text
backend/
  database/schema.sql      MySQL schema
  database/seed.sql        Optional SQL sample data
  scripts/seed.js          Recommended JS seeder with bcrypt hashes
  src/config/db.js         MySQL connection pool
  src/middleware/          Auth, validation, async and error middleware
  src/routes/              REST API routes
frontend/
  src/api/client.js        Axios API client with JWT interceptor
  src/context/AuthContext.jsx
  src/components/          Layout, protection, charts/status helpers
  src/pages/               Public and role-specific pages
```
