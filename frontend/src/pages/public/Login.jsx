import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ErrorMessage } from '../../components/LoadingError';

export default function Login() {
  const [form, setForm] = useState({ email: 'student@campus.test', password: 'Password123!' });
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  async function submit(event) {
    event.preventDefault(); setError('');
    try { const user = await login(form.email, form.password); navigate(`/${user.role}`); } catch (err) { setError(err.message); }
  }
  return <form onSubmit={submit} className="card mx-auto max-w-md"><h1 className="text-3xl font-black">Login</h1><p className="mb-4 text-slate-600">Use a seed account or your registered student account.</p><ErrorMessage error={error} /><label className="label">Email<input className="input mt-1" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label><label className="label mt-3">Password<input className="input mt-1" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></label><button className="btn mt-5 w-full">Sign in</button><p className="mt-4 text-sm">New student? <Link className="font-bold text-emerald-700" to="/register">Create an account</Link></p></form>;
}
