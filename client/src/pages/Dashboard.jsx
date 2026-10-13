import { useEffect, useState } from 'react';
import api from '../api';

const emptyForm = { title: '', amount: '', type: 'expense', category: '' };

export default function Dashboard() {
  const [list, setList] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const { data } = await api.get('/transactions');
      setList(data);
    } catch (e) {
      // token expired or invalid, send user back to login
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

  const income = list.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expense = list.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const balance = income - expense;

  return (
    <div className="dashboard">
      <div className="top-bar">
        <h2>Hi, {localStorage.getItem('name')}</h2>
        <button className="logout-btn" onClick={logout}>Logout</button>
      </div>

      <div className="summary">
        <div className="box">Balance<br /><b>₹{balance}</b></div>
        <div className="box income">Income<br /><b>₹{income}</b></div>
        <div className="box expense">Expense<br /><b>₹{expense}</b></div>
      </div>

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
      {list.length === 0 && <p>No transactions yet.</p>}
      <ul className="list">
        {list.map(t => (
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