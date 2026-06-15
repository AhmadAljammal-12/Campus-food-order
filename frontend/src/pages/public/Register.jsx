import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ErrorMessage } from '../../components/LoadingError';

export default function Register() {
  const [form, setForm] = useState({ full_name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();
  async function submit(event) {
    event.preventDefault(); setError('');
    try { await register(form); navigate('/student'); } catch (err) { setError(err.message); }
  }
  return <form onSubmit={submit} className="card mx-auto max-w-md"><h1 className="text-3xl font-black">Student registration</h1><p className="mb-4 text-slate-600">Create an account to order from campus vendors.</p><ErrorMessage error={error} />{[['full_name', 'Full name', 'text'], ['email', 'Email', 'email'], ['password', 'Password', 'password']].map(([key, label, type]) => <label className="label mt-3 block" key={key}>{label}<input required minLength={key === 'password' ? 8 : 2} className="input mt-1" type={type} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} /></label>)}<button className="btn mt-5 w-full">Create account</button><p className="mt-4 text-sm">Already registered? <Link className="font-bold text-emerald-700" to="/login">Login</Link></p></form>;
}
