const colors = {
  Pending: 'bg-amber-100 text-amber-700', Confirmed: 'bg-blue-100 text-blue-700', Preparing: 'bg-purple-100 text-purple-700',
  Ready: 'bg-emerald-100 text-emerald-700', Completed: 'bg-slate-100 text-slate-700', Cancelled: 'bg-rose-100 text-rose-700',
  Waiting: 'bg-amber-100 text-amber-700', Called: 'bg-indigo-100 text-indigo-700', PickedUp: 'bg-emerald-100 text-emerald-700', Paid: 'bg-emerald-100 text-emerald-700',
};
export default function Status({ value }) {
  return <span className={`rounded-full px-3 py-1 text-xs font-bold ${colors[value] || 'bg-slate-100 text-slate-700'}`}>{value}</span>;
}
