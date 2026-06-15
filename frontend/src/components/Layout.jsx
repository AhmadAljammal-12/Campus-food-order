import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const roleLinks = {
  student: [['/student', 'Dashboard'], ['/student/menu', 'Food Menu'], ['/student/cart', 'Cart'], ['/student/track', 'Track'], ['/student/history', 'History'], ['/student/reviews', 'Reviews']],
  vendor: [['/vendor', 'Dashboard'], ['/vendor/menu', 'Menu'], ['/vendor/inventory', 'Inventory'], ['/vendor/orders', 'Orders'], ['/vendor/queue', 'Queue'], ['/vendor/analytics', 'Analytics']],
  admin: [['/admin', 'Dashboard'], ['/admin/users', 'Users'], ['/admin/vendors', 'Vendors'], ['/admin/reports', 'Reports'], ['/admin/analytics', 'Analytics'], ['/admin/settings', 'Settings']],
  staff: [['/staff', 'Dashboard'], ['/staff/queue', 'Queue Control'], ['/staff/pickup', 'Pickup']],
};

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const links = user ? roleLinks[user.role] || [] : [];
  return (
    <>
      <header className="sticky top-0 z-20 border-b bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
          <Link to="/" className="flex items-center gap-2 text-2xl font-black text-emerald-700"><ShoppingBag /> CampusEats</Link>
          <nav className="flex flex-wrap items-center gap-3 text-sm font-semibold">
            {links.map(([href, label]) => <NavLink key={href} to={href} className={({ isActive }) => isActive ? 'text-emerald-700' : 'text-slate-600 hover:text-emerald-700'}>{label}</NavLink>)}
            {user ? <button className="rounded-lg border px-3 py-1" onClick={() => { logout(); navigate('/login'); }}>Logout</button> : <><Link to="/login">Login</Link><Link className="btn" to="/register">Register</Link></>}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl p-4 md:p-6"><Outlet /></main>
    </>
  );
}
