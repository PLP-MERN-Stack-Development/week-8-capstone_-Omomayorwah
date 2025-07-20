import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { api } from '../../services/api';

const VerificationForm = ({ onVerify }) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Try to get phone from last registered user in localStorage
  let phone = '';
  try {
    const lastUser = JSON.parse(localStorage.getItem('lernbase_user'));
    if (lastUser && lastUser.phone) phone = lastUser.phone;
  } catch {}

  const validate = () => {
    if (!code.trim()) return 'Verification code is required';
    if (!/^[0-9]{4,8}$/.test(code.trim())) return 'Code must be 4-8 digits';
    if (!phone) return 'Phone number is required (register first)';
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
      await api.verifyPhone({ phone, code });
      setSuccess('Verification successful! You can now log in.');
      setLoading(false);
      onVerify && onVerify(code);
    } catch (err) {
      setError(err.message || 'Verification failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} aria-label="Verification form" style={{ maxWidth: 400, margin: '2rem auto', padding: 24, background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #eee' }}>
      <h2 style={{ marginBottom: 16 }}>Verify Your Account</h2>
      <label htmlFor="verification-code" style={{ display: 'block', marginBottom: 4 }}>Verification Code</label>
      <input
        id="verification-code"
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        placeholder="Verification Code"
        value={code}
        onChange={e => setCode(e.target.value)}
        style={{ width: '100%', padding: 8, marginBottom: 12, borderRadius: 4, border: '1px solid #ccc' }}
        aria-required="true"
        aria-label="Verification Code"
      />
      {error && <div role="alert" style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
      {success && <div role="status" style={{ color: 'green', marginBottom: 12 }}>{success}</div>}
      <button type="submit" disabled={loading} style={{ width: '100%', padding: 10, borderRadius: 4, background: '#667eea', color: '#fff', border: 'none', fontWeight: 'bold' }} aria-busy={loading}>
        {loading ? 'Verifying...' : 'Verify'}
      </button>
    </form>
  );
};

VerificationForm.propTypes = {
  onVerify: PropTypes.func,
};
VerificationForm.defaultProps = {
  onVerify: () => {},
};

export default VerificationForm; 