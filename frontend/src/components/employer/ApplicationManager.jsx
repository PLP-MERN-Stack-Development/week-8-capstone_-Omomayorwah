import React, { useState } from 'react';

const mockApplications = [
  { id: 'app-1', job: 'Experienced Plumber Needed', candidate: 'John Doe', status: 'pending' },
  { id: 'app-2', job: 'Electrical Technician', candidate: 'Jane Smith', status: 'shortlisted' },
];

const ApplicationManager = () => {
  const [applications, setApplications] = useState(mockApplications);

  const handleStatus = (id, status) => {
    setApplications(applications.map(app => app.id === id ? { ...app, status } : app));
  };

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto', background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #eee', padding: 32 }}>
      <h2>Application Manager</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {applications.map(app => (
          <li key={app.id} style={{ marginBottom: 16, padding: 16, background: '#f9f9f9', borderRadius: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <b>{app.candidate}</b> applied for <b>{app.job}</b>
              <div style={{ color: '#555', marginTop: 4 }}>Status: <span style={{ color: app.status === 'pending' ? 'orange' : app.status === 'shortlisted' ? 'blue' : 'green' }}>{app.status}</span></div>
            </div>
            <div>
              <button onClick={() => handleStatus(app.id, 'shortlisted')} disabled={app.status !== 'pending'} style={{ marginRight: 8, background: '#667eea', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 12px', fontWeight: 'bold' }}>Shortlist</button>
              <button onClick={() => handleStatus(app.id, 'accepted')} disabled={app.status === 'accepted'} style={{ background: '#22c55e', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 12px', fontWeight: 'bold' }}>Accept</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ApplicationManager; 