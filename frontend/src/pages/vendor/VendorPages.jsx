import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import Status from '../../components/Status';
import { ErrorMessage, EmptyState } from '../../components/LoadingError';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const blankItem = { item_name: '', description: '', price: '', image: '', stock_quantity: 0, available: true };

export function MenuManagement() {
  const [items, setItems] = useState([]); const [form, setForm] = useState(blankItem); const [editing, setEditing] = useState(null); const [error, setError] = useState(''); const [message, setMessage] = useState('');
  async function load() { const { data } = await api.get('/menu/mine'); setItems(data); }
  useEffect(() => { load().catch((err) => setError(err.message)); }, []);
  async function submit(e) { e.preventDefault(); setError(''); try { const payload = { ...form, price: Number(form.price), stock_quantity: Number(form.stock_quantity), available: Boolean(form.available), image: form.image || null }; editing ? await api.put(`/menu/${editing}`, payload) : await api.post('/menu', payload); setMessage(editing ? 'Menu item updated.' : 'Menu item created.'); setForm(blankItem); setEditing(null); load(); } catch (err) { setError(err.message); } }
  function edit(item) { setEditing(item.id); setForm({ item_name: item.item_name, description: item.description || '', price: item.price, image: item.image || '', stock_quantity: item.stock_quantity, available: Boolean(item.available) }); }
  async function remove(id) { try { await api.delete(`/menu/${id}`); setMessage('Menu item deleted.'); load(); } catch (err) { setError(err.message); } }
  return <section className="grid gap-6 lg:grid-cols-3"><form onSubmit={submit} className="card h-fit"><h1 className="text-2xl font-black">{editing ? 'Edit menu item' : 'Add menu item'}</h1><ErrorMessage error={error} />{message && <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-emerald-700">{message}</div>}{['item_name', 'description', 'price', 'image', 'stock_quantity'].map((key) => <label className="label mt-3 block" key={key}>{key.replace('_', ' ')}<input className="input mt-1" required={['item_name', 'price', 'stock_quantity'].includes(key)} type={['price', 'stock_quantity'].includes(key) ? 'number' : 'text'} step="0.01" value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} /></label>)}<label className="mt-3 flex items-center gap-2 font-semibold"><input type="checkbox" checked={form.available} onChange={(e) => setForm({ ...form, available: e.target.checked })} /> Available</label><button className="btn mt-4 w-full">Save item</button>{editing && <button type="button" className="mt-2 w-full rounded-xl border px-4 py-2" onClick={() => { setEditing(null); setForm(blankItem); }}>Cancel</button>}</form><div className="lg:col-span-2 grid gap-3">{items.map((item) => <article className="card flex flex-col gap-3 md:flex-row md:items-center md:justify-between" key={item.id}><div><p className="font-black">{item.item_name}</p><p className="text-sm text-slate-500">${Number(item.price).toFixed(2)} · stock {item.stock_quantity} · {item.available ? 'available' : 'hidden'}</p></div><div className="flex gap-2"><button className="rounded-xl border px-3 py-2" onClick={() => edit(item)}>Edit</button><button className="rounded-xl border px-3 py-2 text-rose-700" onClick={() => remove(item.id)}>Delete</button></div></article>)}</div></section>;
}

export function Inventory() { return <MenuManagement />; }

export function Orders({ title = 'Incoming Orders' }) {
  const [orders, setOrders] = useState([]); const [error, setError] = useState('');
  async function load() { const { data } = await api.get('/orders'); setOrders(data); }
  useEffect(() => { load().catch((err) => setError(err.message)); }, []);
  async function update(id, status) { try { await api.patch(`/orders/${id}/status`, { status }); load(); } catch (err) { setError(err.message); } }
  return <section><h1 className="mb-4 text-3xl font-black">{title}</h1><ErrorMessage error={error} />{orders.length === 0 ? <EmptyState>No orders available.</EmptyState> : <div className="grid gap-3">{orders.map((order) => <article className="card flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between" key={order.id}><div><p className="font-black">Order #{order.id} · Queue #{order.queue_number}</p><p className="text-slate-600">{order.student_name} · ${Number(order.total_amount).toFixed(2)} · {new Date(order.pickup_time).toLocaleString()}</p></div><div className="flex flex-wrap items-center gap-2"><Status value={order.status} /><select className="input w-44" value={order.status} onChange={(e) => update(order.id, e.target.value)}>{['Pending', 'Confirmed', 'Preparing', 'Ready', 'Completed', 'Cancelled'].map((s) => <option key={s}>{s}</option>)}</select></div></article>)}</div>}</section>;
}

export function Queue() {
  const [queue, setQueue] = useState([]); const [error, setError] = useState('');
  async function load() { const { data } = await api.get('/queue'); setQueue(data); }
  useEffect(() => { load().catch((err) => setError(err.message)); }, []);
  async function update(id, status) { try { await api.patch(`/queue/${id}`, { status }); load(); } catch (err) { setError(err.message); } }
  return <section><h1 className="mb-4 text-3xl font-black">Queue Management</h1><ErrorMessage error={error} />{queue.length === 0 ? <EmptyState>No queue numbers.</EmptyState> : <div className="grid gap-3">{queue.map((item) => <article className="card flex flex-col gap-3 md:flex-row md:items-center md:justify-between" key={item.id}><div><p className="text-2xl font-black">#{item.queue_number}</p><p className="text-slate-600">{item.student_name} · {item.vendor_name}</p></div><div className="flex gap-2"><Status value={item.status} /><select className="input w-36" value={item.status} onChange={(e) => update(item.id, e.target.value)}>{['Waiting', 'Called', 'PickedUp', 'Cancelled'].map((s) => <option key={s}>{s}</option>)}</select></div></article>)}</div>}</section>;
}

export function Analytics() {
  const [rows, setRows] = useState([]); const [error, setError] = useState('');
  useEffect(() => { api.get('/vendors/analytics').then((r) => setRows(r.data)).catch((err) => setError(err.message)); }, []);
  const chartData = { labels: rows.map((row) => row.vendor_name), datasets: [{ label: 'Revenue', data: rows.map((row) => Number(row.revenue)), backgroundColor: '#059669' }] };
  return <section><h1 className="mb-4 text-3xl font-black">Sales Analytics</h1><ErrorMessage error={error} />{rows.length > 0 && <div className="card mb-4"><Bar data={chartData} /></div>}<div className="grid gap-4 md:grid-cols-3">{rows.map((row) => <div className="card" key={row.id}><h2 className="font-black">{row.vendor_name}</h2><p className="mt-3 text-3xl font-black">${Number(row.revenue).toFixed(2)}</p><p className="text-slate-500">{row.orders} orders · {Number(row.average_rating).toFixed(1)}★</p></div>)}</div></section>;
}
