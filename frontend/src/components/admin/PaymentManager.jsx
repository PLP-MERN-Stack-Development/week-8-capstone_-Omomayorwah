import React, { useState, useEffect } from 'react';

const allowedStatuses = ['completed', 'pending', 'failed'];

const PaymentManager = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusLoading, setStatusLoading] = useState({});
  const [statusError, setStatusError] = useState({});

  useEffect(() => {
    const fetchPayments = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('accessToken');
        const res = await fetch('/api/payments/history', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        const data = await res.json();
        if (data.success && data.data && Array.isArray(data.data.history)) {
          setPayments(data.data.history);
        } else if (Array.isArray(data)) {
          setPayments(data); // fallback for mock
        } else if (data.history) {
          setPayments(data.history);
        } else {
          setError(data.message || 'Failed to fetch payments');
        }
      } catch (err) {
        setError('Network error');
      }
      setLoading(false);
    };
    fetchPayments();
  }, []);

  const handleStatusChange = async (paymentId, newStatus) => {
    setStatusLoading(prev => ({ ...prev, [paymentId]: true }));
    setStatusError(prev => ({ ...prev, [paymentId]: null }));
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`/api/payments/${paymentId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setPayments(payments => payments.map(p => (p.id === paymentId || p._id === paymentId) ? { ...p, status: newStatus } : p));
      } else {
        setStatusError(prev => ({ ...prev, [paymentId]: data.message || 'Failed to update status' }));
      }
    } catch (err) {
      setStatusError(prev => ({ ...prev, [paymentId]: 'Network error' }));
    }
    setStatusLoading(prev => ({ ...prev, [paymentId]: false }));
  };

  return (
    <div style={{ maxWidth: 700, margin: '2rem auto', background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #eee', padding: 32 }}>
      <h2>Payment Management</h2>
      {loading ? (
        <div>Loading payments...</div>
      ) : error ? (
        <div style={{ color: 'red' }}>{error}</div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f3f3f3' }}>
              <th style={{ padding: 8, textAlign: 'left' }}>User</th>
              <th style={{ padding: 8, textAlign: 'left' }}>Amount (₦)</th>
              <th style={{ padding: 8, textAlign: 'left' }}>Status</th>
              <th style={{ padding: 8, textAlign: 'left' }}>Date</th>
              <th style={{ padding: 8, textAlign: 'left' }}>Description</th>
              <th style={{ padding: 8 }}></th>
            </tr>
          </thead>
          <tbody>
            {payments.map(payment => {
              const paymentId = payment.id || payment._id;
              return (
                <tr key={paymentId}>
                  <td style={{ padding: 8 }}>{payment.user || payment.userId || ''}</td>
                  <td style={{ padding: 8 }}>{payment.amount}</td>
                  <td style={{ padding: 8 }}>{payment.status}</td>
                  <td style={{ padding: 8 }}>{payment.date ? new Date(payment.date).toLocaleDateString() : ''}</td>
                  <td style={{ padding: 8 }}>{payment.description || ''}</td>
                  <td style={{ padding: 8 }}>
                    <select
                      value={payment.status}
                      onChange={e => handleStatusChange(paymentId, e.target.value)}
                      disabled={statusLoading[paymentId]}
                      style={{ padding: 4, borderRadius: 4 }}
                    >
                      {allowedStatuses.map(s => (
                        <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                      ))}
                    </select>
                    {statusLoading[paymentId] && <span style={{ marginLeft: 8, color: '#888' }}>Updating...</span>}
                    {statusError[paymentId] && <div style={{ color: 'red', fontSize: 12 }}>{statusError[paymentId]}</div>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default PaymentManager; 