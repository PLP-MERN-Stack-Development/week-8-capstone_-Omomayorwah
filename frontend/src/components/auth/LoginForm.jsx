import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { api } from '../../services/api';

const LoginForm = ({ onLogin }) => {
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const validate = () => {
    if (!emailOrPhone.trim()) return 'Email or phone is required';
    if (!password) return 'Password is required';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setLoading(true);
    try {
      const res = await api.login({ emailOrPhone, password });
      setSuccess('Login successful!');
      setLoading(false);
      // Store token and user info
      localStorage.setItem('lernbase_token', res.data.tokens.accessToken);
      localStorage.setItem('lernbase_refresh', res.data.tokens.refreshToken);
      localStorage.setItem('lernbase_user', JSON.stringify(res.data.user));
      onLogin && onLogin(res.data.user, res.data.tokens);
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} aria-label="Login form" style={{ maxWidth: 400, margin: '2rem auto', padding: 24, background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #eee' }}>
      <h2 style={{ marginBottom: 16, textAlign: 'center' }}>Login</h2>
      <label htmlFor="login-emailOrPhone" style={{ display: 'block', marginBottom: 4 }}>Email or Phone</label>
      <input
        id="login-emailOrPhone"
        type="text"
        autoComplete="username"
        placeholder="Email or Phone"
        value={emailOrPhone}
        onChange={e => setEmailOrPhone(e.target.value)}
        style={{ width: '100%', padding: 8, marginBottom: 12, borderRadius: 4, border: '1px solid #ccc' }}
        aria-required="true"
      />
      <label htmlFor="login-password" style={{ display: 'block', marginBottom: 4 }}>Password</label>
      <input
        id="login-password"
        type="password"
        autoComplete="current-password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        style={{ width: '100%', padding: 8, marginBottom: 12, borderRadius: 4, border: '1px solid #ccc' }}
        aria-required="true"
      />
      {error && <div role="alert" style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
      {success && <div role="status" style={{ color: 'green', marginBottom: 12 }}>{success}</div>}
      <button type="submit" disabled={loading} style={{ width: '100%', padding: 10, borderRadius: 4, background: '#667eea', color: '#fff', border: 'none', fontWeight: 'bold' }} aria-busy={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
      <div style={{ marginTop: 16, textAlign: 'center' }}>
        <a href="/forgot-password" style={{ color: '#667eea', textDecoration: 'none' }}>Forgot password?</a>
      </div>
       <div style={{ marginTop: 16, textAlign: 'center' }}>
        <p>Do not have an account? <a href="/register" style={{ color: '#667eea', textDecoration: 'none' }}>Register</a></p>
      </div>
    </form>
  );
};

LoginForm.propTypes = {
  onLogin: PropTypes.func,
};
LoginForm.defaultProps = {
  onLogin: () => {},
};

export default LoginForm; 