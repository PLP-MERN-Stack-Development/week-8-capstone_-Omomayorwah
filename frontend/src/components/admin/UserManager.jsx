import React, { useState, useEffect } from 'react';

const allowedRoles = ['student', 'artisan', 'employer', 'admin'];

const UserManager = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [roleLoading, setRoleLoading] = useState({});
  const [roleError, setRoleError] = useState({});

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('accessToken');
        const res = await fetch('/api/users/search', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        const data = await res.json();
        if (data.success) {
          setUsers(data.data.users);
        } else {
          setError(data.message || 'Failed to fetch users');
        }
      } catch (err) {
        setError('Network error');
      }
      setLoading(false);
    };
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    setRoleLoading(prev => ({ ...prev, [userId]: true }));
    setRoleError(prev => ({ ...prev, [userId]: null }));
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`/api/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      });
      const data = await res.json();
      if (data.success) {
        setUsers(users => users.map(u => u._id === userId ? { ...u, role: newRole } : u));
      } else {
        setRoleError(prev => ({ ...prev, [userId]: data.message || 'Failed to update role' }));
      }
    } catch (err) {
      setRoleError(prev => ({ ...prev, [userId]: 'Network error' }));
    }
    setRoleLoading(prev => ({ ...prev, [userId]: false }));
  };

  return (
    <div style={{ maxWidth: 700, margin: '2rem auto', background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #eee', padding: 32 }}>
      <h2>User Management</h2>
      {loading ? (
        <div>Loading users...</div>
      ) : error ? (
        <div style={{ color: 'red' }}>{error}</div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f3f3f3' }}>
              <th style={{ padding: 8, textAlign: 'left' }}>Name</th>
              <th style={{ padding: 8, textAlign: 'left' }}>Email</th>
              <th style={{ padding: 8, textAlign: 'left' }}>Role</th>
              <th style={{ padding: 8 }}></th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user._id}>
                <td style={{ padding: 8 }}>{user.profile?.firstName || user.name} {user.profile?.lastName || ''}</td>
                <td style={{ padding: 8 }}>{user.email}</td>
                <td style={{ padding: 8 }}>{user.role}</td>
                <td style={{ padding: 8 }}>
                  <select
                    value={user.role}
                    onChange={e => handleRoleChange(user._id, e.target.value)}
                    disabled={roleLoading[user._id]}
                    style={{ padding: 4, borderRadius: 4 }}
                  >
                    {allowedRoles.map(r => (
                      <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                    ))}
                  </select>
                  {roleLoading[user._id] && <span style={{ marginLeft: 8, color: '#888' }}>Updating...</span>}
                  {roleError[user._id] && <div style={{ color: 'red', fontSize: 12 }}>{roleError[user._id]}</div>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default UserManager; 