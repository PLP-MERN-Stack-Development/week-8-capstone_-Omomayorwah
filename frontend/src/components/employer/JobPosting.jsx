import React, { useState } from 'react';

const mockJobs = [
  { id: 'job-1', title: 'Experienced Plumber Needed', location: 'Lagos', type: 'full-time', status: 'active' },
  { id: 'job-2', title: 'Electrical Technician', location: 'Abuja', type: 'contract', status: 'closed' },
];

const JobPosting = () => {
  const [jobs, setJobs] = useState(mockJobs);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ title: '', location: '', type: 'full-time' });

  const handleAdd = (e) => {
    e.preventDefault();
    setJobs([
      ...jobs,
      { ...form, id: `job-${Date.now()}`, status: 'active' },
    ]);
    setForm({ title: '', location: '', type: 'full-time' });
    setAdding(false);
  };

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto', background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #eee', padding: 32 }}>
      <h2>Job Posting</h2>
      <button onClick={() => setAdding(!adding)} style={{ marginBottom: 16, background: '#667eea', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 16px', fontWeight: 'bold' }}>{adding ? 'Cancel' : 'Post New Job'}</button>
      {adding && (
        <form onSubmit={handleAdd} style={{ marginBottom: 24 }}>
          <input placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} style={{ width: '100%', marginBottom: 8 }} />
          <input placeholder="Location" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} style={{ width: '100%', marginBottom: 8 }} />
          <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} style={{ width: '100%', marginBottom: 8 }}>
            <option value="full-time">Full-time</option>
            <option value="part-time">Part-time</option>
            <option value="contract">Contract</option>
            <option value="gig">Gig</option>
          </select>
          <button type="submit" style={{ background: '#667eea', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 16px', fontWeight: 'bold', width: '100%' }}>Post</button>
        </form>
      )}
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {jobs.map(job => (
          <li key={job.id} style={{ marginBottom: 16, padding: 16, background: '#f9f9f9', borderRadius: 6 }}>
            <div><b>{job.title}</b> <span style={{ color: '#888' }}>({job.location}, {job.type})</span></div>
            <div>Status: <span style={{ color: job.status === 'active' ? 'green' : 'red' }}>{job.status}</span></div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default JobPosting; 