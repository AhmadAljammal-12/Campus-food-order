import { useEffect, useState } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import { api } from '../api/client';
ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function Dashboard({ role }) {
  const [orders, setOrders] = useState([]);
  const [reports, setReports] = useState(null);
  useEffect(() => {
    if (role !== 'admin') api.get('/orders').then((r) => setOrders(r.data)).catch(() => setOrders([]));
    if (role === 'admin') api.get('/admin/reports').then((r) => setReports(r.data)).catch(() => setReports(null));
  }, [role]);
  const revenue = reports?.summary?.total_revenue || orders.reduce((sum, order) => sum + Number(order.total_amount || 0), 0);
  const count = reports?.summary?.total_orders || orders.length;
  const barData = { labels: ['Pending', 'Confirmed', 'Preparing', 'Ready', 'Completed'], datasets: [{ label: 'Orders', data: ['Pending', 'Confirmed', 'Preparing', 'Ready', 'Completed'].map((s) => orders.filter((o) => o.status === s).length), backgroundColor: '#059669' }] };
  const doughnutData = { labels: reports?.usersByRole?.map((r) => r.role) || ['Orders'], datasets: [{ data: reports?.usersByRole?.map((r) => r.total) || [count || 1], backgroundColor: ['#059669', '#2563eb', '#9333ea', '#f59e0b'] }] };
  return <div className="grid gap-6 lg:grid-cols-3"><section className="card lg:col-span-2"><p className="font-semibold text-emerald-600">{role.toUpperCase()}</p><h1 className="text-4xl font-black capitalize">{role} dashboard</h1><p className="mt-2 text-slate-600">Live operational summary for campus food ordering.</p><div className="mt-6"><Bar data={barData} /></div></section><section className="grid gap-4"><div className="card"><p className="text-slate-500">Orders</p><p className="text-4xl font-black">{count}</p></div><div className="card"><p className="text-slate-500">Revenue</p><p className="text-4xl font-black">${Number(revenue).toFixed(2)}</p></div><div className="card"><Doughnut data={doughnutData} /></div></section></div>;
}
