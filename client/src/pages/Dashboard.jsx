import { useEffect, useState } from 'react';
import api from '../api';

const emptyForm = { title: '', amount: '', type: 'expense', category: '' };

export default function Dashboard() {
  const [list, setList] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [month, setMonth] = useState('');

  const load = async () => {
    try {
      const { data } = await api.get('/transactions');
      setList(data);
    } catch (e) {
      localStorage.clear();
      location.href = '/login';
    }
  };

  useEffect(() => { load(); }, []);

  const set = key => e => setForm({ ...form, [key]: e.target.value });

  const add = async () => {
    if (!form.title || !form.amount) {
      setError('Title and amount are required');
      return;
    }
    try {
      await api.post('/transactions', {
        ...form,
        amount: Number(form.amount),
        category: form.category || 'General'
      });
      setForm(emptyForm);
      setError('');
      load();
    } catch (e) {
      setError(e.response?.data?.msg || 'Could not add transaction');
    }
  };

  const remove = async id => {
    await api.delete(`/transactions/${id}`);
    load();
  };

  const logout = () => {
    localStorage.clear();
    location.href = '/login';
  };

  // month filter: month looks like "2026-10"
  const shown = month ? list.filter(t => t.date.slice(0, 7) === month) : list;

  const income = shown.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expense = shown.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const balance = income - expense;

  // total expense per category
  const byCategory = {};
  shown.filter(t => t.type === 'expense').forEach(t => {
    byCategory[t.category] = (byCategory[t.category] || 0) + t.amount;
  });
  const maxCat = Math.max(...Object.values(byCategory), 1);

  return (
    <div className="dashboard">
      <div className="top-bar">
        <h2>Hi, {localStorage.getItem('name')}</h2>
        <button className="logout-btn" onClick={logout}>Logout</button>
      </div>

      <div className="filter-row">
        <label>Filter by month: </label>
        <input type="month" value={month} onChange={e => setMonth(e.target.value)} />
        {month && <button className="clear-btn" onClick={() => setMonth('')}>Clear</button>}
      </div>

      <div className="summary">
        <div className="box">Balance<br /><b>₹{balance}</b></div>
        <div className="box income">Income<br /><b>₹{income}</b></div>
        <div className="box expense">Expense<br /><b>₹{expense}</b></div>
      </div>

      {Object.keys(byCategory).length > 0 && (
        <div className="card form-card">
          <h3>Spending by category</h3>
          {Object.entries(byCategory).map(([cat, amt]) => (
            <div key={cat} className="cat-row">
              <span className="cat-name">{cat}</span>
              <div className="cat-bar">
                <div className="cat-fill" style={{ width: `${(amt / maxCat) * 100}%` }} />
              </div>
              <span>₹{amt}</span>
            </div>
          ))}
        </div>
      )}

      <div className="card form-card">
        <h3>Add transaction</h3>
        <input placeholder="Title (e.g. Groceries)" value={form.title} onChange={set('title')} />
        <input placeholder="Amount" type="number" value={form.amount} onChange={set('amount')} />
        <input placeholder="Category (e.g. Food)" value={form.category} onChange={set('category')} />
        <select value={form.type} onChange={set('type')}>
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
        <button onClick={add}>Add</button>
        {error && <p className="error">{error}</p>}
      </div>

      <h3>Transactions</h3>
      {shown.length === 0 && <p>No transactions found.</p>}
      <ul className="list">
        {shown.map(t => (
          <li key={t._id}>
            <div>
              <b>{t.title}</b>
              <small> · {t.category} · {new Date(t.date).toLocaleDateString()}</small>
            </div>
            <div>
              <span className={t.type}>
                {t.type === 'income' ? '+' : '-'}₹{t.amount}
              </span>
              <button className="del-btn" onClick={() => remove(t._id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}