export function ErrorMessage({ error }) { return error ? <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-rose-700">{error}</div> : null; }
export function EmptyState({ children }) { return <div className="card text-center text-slate-500">{children}</div>; }
