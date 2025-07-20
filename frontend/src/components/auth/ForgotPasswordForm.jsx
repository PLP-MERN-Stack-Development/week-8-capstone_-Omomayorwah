import React, { useState } from 'react';
import { api } from '../../services/api';

const ForgotPasswordForm = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!email) {
      setError('Email is required');
      return;
    }
    setLoading(true);
    try {
      await api.forgotPassword(email);
      setSuccess('If an account with that email exists, a password reset link has been sent.');
    } catch (err) {
      setError(err.message || 'Failed to send reset email.');
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 400, margin: '2rem auto', padding: 24, background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #eee' }}>
      <h2 style={{ marginBottom: 16 }}>Forgot Password</h2>
      <label htmlFor="forgot-email" style={{ display: 'block', marginBottom: 4 }}>Email</label>
      <input
        id="forgot-email"
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        style={{ width: '100%', padding: 8, marginBottom: 12, borderRadius: 4, border: '1px solid #ccc' }}
        aria-required="true"
      />
      {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
      {success && <div style={{ color: 'green', marginBottom: 12 }}>{success}</div>}
      <button type="submit" disabled={loading} style={{ width: '100%', padding: 10, borderRadius: 4, background: '#667eea', color: '#fff', border: 'none', fontWeight: 'bold' }}>
        {loading ? 'Sending...' : 'Send Reset Link'}
      </button>
    </form>
  );
};

export default ForgotPasswordForm; 