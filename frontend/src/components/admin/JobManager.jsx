import React, { useState, useEffect } from 'react';

const allowedStatuses = ['active', 'closed', 'flagged'];

const JobManager = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusLoading, setStatusLoading] = useState({});
  const [statusError, setStatusError] = useState({});

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('accessToken');
        const res = await fetch('/api/jobs', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        const data = await res.json();
        if (data.success && data.data && Array.isArray(data.data.jobs)) {
          setJobs(data.data.jobs);
        } else if (Array.isArray(data)) {
          setJobs(data); // fallback for mock
        } else if (data.jobs) {
          setJobs(data.jobs);
        } else {
          setError(data.message || 'Failed to fetch jobs');
        }
      } catch (err) {
        setError('Network error');
      }
      setLoading(false);
    };
    fetchJobs();
  }, []);

  const handleStatusChange = async (jobId, newStatus) => {
    setStatusLoading(prev => ({ ...prev, [jobId]: true }));
    setStatusError(prev => ({ ...prev, [jobId]: null }));
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`/api/jobs/${jobId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setJobs(jobs => jobs.map(j => (j.id === jobId || j._id === jobId) ? { ...j, status: newStatus } : j));
      } else {
        setStatusError(prev => ({ ...prev, [jobId]: data.message || 'Failed to update status' }));
      }
    } catch (err) {
      setStatusError(prev => ({ ...prev, [jobId]: 'Network error' }));
    }
    setStatusLoading(prev => ({ ...prev, [jobId]: false }));
  };

  return (
    <div style={{ maxWidth: 700, margin: '2rem auto', background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #eee', padding: 32 }}>
      <h2>Job Management</h2>
      {loading ? (
        <div>Loading jobs...</div>
      ) : error ? (
        <div style={{ color: 'red' }}>{error}</div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f3f3f3' }}>
              <th style={{ padding: 8, textAlign: 'left' }}>Title</th>
              <th style={{ padding: 8, textAlign: 'left' }}>Employer</th>
              <th style={{ padding: 8, textAlign: 'left' }}>Status</th>
              <th style={{ padding: 8 }}></th>
            </tr>
          </thead>
          <tbody>
            {jobs.map(job => {
              const jobId = job.id || job._id;
              return (
                <tr key={jobId}>
                  <td style={{ padding: 8 }}>{job.title}</td>
                  <td style={{ padding: 8 }}>{job.employerName || job.employer || ''}</td>
                  <td style={{ padding: 8 }}>{job.status}</td>
                  <td style={{ padding: 8 }}>
                    <select
                      value={job.status}
                      onChange={e => handleStatusChange(jobId, e.target.value)}
                      disabled={statusLoading[jobId]}
                      style={{ padding: 4, borderRadius: 4 }}
                    >
                      {allowedStatuses.map(s => (
                        <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                      ))}
                    </select>
                    {statusLoading[jobId] && <span style={{ marginLeft: 8, color: '#888' }}>Updating...</span>}
                    {statusError[jobId] && <div style={{ color: 'red', fontSize: 12 }}>{statusError[jobId]}</div>}
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

export default JobManager; 