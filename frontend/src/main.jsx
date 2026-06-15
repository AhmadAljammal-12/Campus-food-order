import React from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './index.css';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/public/Home';
import Login from './pages/public/Login';
import Register from './pages/public/Register';
import { Menu, Cart, Orders as StudentOrders, Reviews } from './pages/student/StudentPages';
import { MenuManagement, Inventory, Orders as VendorOrders, Queue as VendorQueue, Analytics } from './pages/vendor/VendorPages';
import { Users, Vendors, Reports, Settings } from './pages/admin/AdminPages';
import { Queue as StaffQueue, Pickup } from './pages/staff/StaffPages';

function Guard({ roles, children }) { return <ProtectedRoute roles={roles}>{children}</ProtectedRoute>; }

const router = createBrowserRouter([{ path: '/', element: <Layout />, children: [
  { index: true, element: <Home /> },
  { path: 'login', element: <Login /> },
  { path: 'register', element: <Register /> },
  { path: 'student', element: <Guard roles={['student']}><Dashboard role="student" /></Guard> },
  { path: 'student/menu', element: <Guard roles={['student']}><Menu /></Guard> },
  { path: 'student/cart', element: <Guard roles={['student']}><Cart /></Guard> },
  { path: 'student/checkout', element: <Guard roles={['student']}><Cart /></Guard> },
  { path: 'student/track', element: <Guard roles={['student']}><StudentOrders title="Track Order" /></Guard> },
  { path: 'student/history', element: <Guard roles={['student']}><StudentOrders title="Order History" /></Guard> },
  { path: 'student/reviews', element: <Guard roles={['student']}><Reviews /></Guard> },
  { path: 'vendor', element: <Guard roles={['vendor']}><Dashboard role="vendor" /></Guard> },
  { path: 'vendor/menu', element: <Guard roles={['vendor']}><MenuManagement /></Guard> },
  { path: 'vendor/inventory', element: <Guard roles={['vendor']}><Inventory /></Guard> },
  { path: 'vendor/orders', element: <Guard roles={['vendor']}><VendorOrders title="Incoming Orders" /></Guard> },
  { path: 'vendor/queue', element: <Guard roles={['vendor']}><VendorQueue /></Guard> },
  { path: 'vendor/analytics', element: <Guard roles={['vendor']}><Analytics /></Guard> },
  { path: 'admin', element: <Guard roles={['admin']}><Dashboard role="admin" /></Guard> },
  { path: 'admin/users', element: <Guard roles={['admin']}><Users /></Guard> },
  { path: 'admin/vendors', element: <Guard roles={['admin']}><Vendors /></Guard> },
  { path: 'admin/reports', element: <Guard roles={['admin']}><Reports /></Guard> },
  { path: 'admin/analytics', element: <Guard roles={['admin']}><Dashboard role="admin" /></Guard> },
  { path: 'admin/settings', element: <Guard roles={['admin']}><Settings /></Guard> },
  { path: 'staff', element: <Guard roles={['staff']}><Dashboard role="staff" /></Guard> },
  { path: 'staff/queue', element: <Guard roles={['staff']}><StaffQueue /></Guard> },
  { path: 'staff/pickup', element: <Guard roles={['staff']}><Pickup /></Guard> },
] }]);

createRoot(document.getElementById('root')).render(<React.StrictMode><AuthProvider><RouterProvider router={router} /></AuthProvider></React.StrictMode>);
