import React, { useState } from 'react';
import { api } from '../../services/api';

const ResetPasswordForm = ({ token }) => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!password || password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    setLoading(true);
    try {
      await api.resetPassword({ token, password });
      setSuccess('Password reset successful! You can now log in.');
    } catch (err) {
      setError(err.message || 'Failed to reset password.');
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 400, margin: '2rem auto', padding: 24, background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #eee' }}>
      <h2 style={{ marginBottom: 16 }}>Reset Password</h2>
      <label htmlFor="reset-password" style={{ display: 'block', marginBottom: 4 }}>New Password</label>
      <input
        id="reset-password"
        type="password"
        placeholder="Enter new password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        style={{ width: '100%', padding: 8, marginBottom: 12, borderRadius: 4, border: '1px solid #ccc' }}
        aria-required="true"
      />
      {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
      {success && <div style={{ color: 'green', marginBottom: 12 }}>{success}</div>}
      <button type="submit" disabled={loading} style={{ width: '100%', padding: 10, borderRadius: 4, background: '#667eea', color: '#fff', border: 'none', fontWeight: 'bold' }}>
        {loading ? 'Resetting...' : 'Reset Password'}
      </button>
    </form>
  );
};

export default ResetPasswordForm; 