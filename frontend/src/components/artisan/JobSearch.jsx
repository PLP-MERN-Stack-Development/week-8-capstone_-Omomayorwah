import React, { useState } from 'react';

const mockJobs = [
  { id: 'job-1', title: 'Experienced Plumber Needed', company: 'ABC Construction Ltd', location: 'Lagos', salary: 100000, type: 'full-time', applied: false },
  { id: 'job-2', title: 'Electrical Technician', company: 'Tech Solutions Inc', location: 'Abuja', salary: 120000, type: 'contract', applied: true },
];

const JobSearch = () => {
  const [jobs, setJobs] = useState(mockJobs);

  const handleApply = (id) => {
    setJobs(jobs.map(j => j.id === id ? { ...j, applied: true } : j));
  };

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto', background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #eee', padding: 32 }}>
      <h2>Job Search</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {jobs.map(job => (
          <li key={job.id} style={{ marginBottom: 16, padding: 16, background: '#f9f9f9', borderRadius: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <b>{job.title}</b> <span style={{ color: '#888' }}>({job.company}, {job.location}, {job.type})</span>
              <div style={{ color: '#555', marginTop: 4 }}>Salary: ₦{job.salary.toLocaleString()}</div>
            </div>
            <button onClick={() => handleApply(job.id)} disabled={job.applied} style={{ background: '#667eea', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 16px', fontWeight: 'bold' }}>
              {job.applied ? 'Applied' : 'Apply'}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default JobSearch; 