import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { api } from '../../services/api';

const RegisterForm = ({ onRegister }) => {
  const [form, setForm] = useState({
    email: '',
    phone: '',
    password: '',
    role: 'student',
    firstName: '',
    lastName: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const validate = () => {
    if (!form.firstName.trim()) return 'First name is required';
    if (!form.lastName.trim()) return 'Last name is required';
    if (!form.email.trim()) return 'Email is required';
    if (!form.phone.trim()) return 'Phone is required';
    if (!form.password) return 'Password is required';
    if (form.password.length < 8) return 'Password must be at least 8 characters';
    return '';
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
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
      await api.register(form);
      setSuccess('Registration successful! Please check your email or phone for a verification code.');
      setLoading(false);
      onRegister && onRegister(form);
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} aria-label="Register form" style={{ maxWidth: 400, margin: '2rem auto', padding: 24, background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #eee' }}>
      <h2 style={{ marginBottom: 16, textAlign: 'center' }}>Register</h2>
      <label htmlFor="register-firstName" style={{ display: 'block', marginBottom: 4 }}>First Name:</label>
      <input type="text" id="register-firstName" name="firstName" placeholder="First Name" value={form.firstName} onChange={handleChange} style={{ width: '100%', padding: 8, marginBottom: 12, borderRadius: 4, border: '1px solid #ccc' }} aria-required="true" />
      <label htmlFor="register-lastName" style={{ display: 'block', marginBottom: 4 }}>Last Name:</label>
      <input type="text" id="register-lastName" name="lastName" placeholder="Last Name" value={form.lastName} onChange={handleChange} style={{ width: '100%', padding: 8, marginBottom: 12, borderRadius: 4, border: '1px solid #ccc' }} aria-required="true" />
      <label htmlFor="register-email" style={{ display: 'block', marginBottom: 4 }}>Email:</label>
      <input type="email" id="register-email" name="email" placeholder="Email" value={form.email} onChange={handleChange} style={{ width: '100%', padding: 8, marginBottom: 12, borderRadius: 4, border: '1px solid #ccc' }} aria-required="true" />
      <label htmlFor="register-phone" style={{ display: 'block', marginBottom: 4 }}>Phone:</label>
      <input type="text" id="register-phone" name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} style={{ width: '100%', padding: 8, marginBottom: 12, borderRadius: 4, border: '1px solid #ccc' }} aria-required="true" />
      <label htmlFor="register-password" style={{ display: 'block', marginBottom: 4 }}>Password:</label>
      <input type="password" id="register-password" name="password" placeholder="Password" value={form.password} onChange={handleChange} style={{ width: '100%', padding: 8, marginBottom: 12, borderRadius: 4, border: '1px solid #ccc' }} aria-required="true" />
      <label htmlFor="register-role" style={{ display: 'block', marginBottom: 4 }}>Register as:</label>
      <select id="register-role" name="role" value={form.role} onChange={handleChange} style={{ width: '100%', padding: 8, marginBottom: 12, borderRadius: 4, border: '1px solid #ccc' }} aria-required="true">
        <option value="student">Student</option>
        <option value="artisan">Artisan</option>
        <option value="employer">Employer</option>
      </select>
      {error && <div role="alert" style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
      {success && <div role="status" style={{ color: 'green', marginBottom: 12 }}>{success}</div>}
      <button type="submit" disabled={loading} style={{ width: '100%', padding: 10, borderRadius: 4, background: '#667eea', color: '#fff', border: 'none', fontWeight: 'bold' }} aria-busy={loading}>
        {loading ? 'Registering...' : 'Register'}
      </button>
      <div style={{ marginTop: 16, textAlign: 'center' }}>
        <p>Already have an account? <a href="/login" style={{ color: '#667eea', textDecoration: 'none' }}>Login</a></p>
      </div>
    </form>
  );
};

RegisterForm.propTypes = {
  onRegister: PropTypes.func,
};
RegisterForm.defaultProps = {
  onRegister: () => {},
};

export default RegisterForm; 