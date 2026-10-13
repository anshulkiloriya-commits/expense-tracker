import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

export default function Auth({ mode }) {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const nav = useNavigate();

  const set = key => e => setForm({ ...form, [key]: e.target.value });

  const submit = async () => {
    try {
      const { data } = await api.post(`/auth/${mode}`, form);
      localStorage.setItem('token', data.token);
      localStorage.setItem('name', data.name);
      nav('/');
    } catch (e) {
      setError(e.response?.data?.msg || 'Something went wrong');
    }
  };

  return (
    <div className="card">
      <h2>{mode === 'login' ? 'Login' : 'Register'}</h2>
      {mode === 'register' && <input placeholder="Name" onChange={set('name')} />}
      <input placeholder="Email" onChange={set('email')} />

      <div className="password-wrap">
        <input
          placeholder="Password"
          type={showPassword ? 'text' : 'password'}
          onChange={set('password')}
        />
        <button
          type="button"
          className="toggle-btn"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? 'Hide' : 'Show'}
        </button>
      </div>

      <button onClick={submit}>{mode === 'login' ? 'Login' : 'Create account'}</button>
      {error && <p className="error">{error}</p>}
      <Link to={mode === 'login' ? '/register' : '/login'}>
        {mode === 'login' ? 'New here? Register' : 'Already have an account? Login'}
      </Link>
    </div>
  );
}