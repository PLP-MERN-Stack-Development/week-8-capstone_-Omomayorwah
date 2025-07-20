import React, { useState } from 'react';

const mockCandidates = [
  { id: 'cand-1', name: 'John Doe', skills: ['Plumbing'], location: 'Lagos', shortlisted: false },
  { id: 'cand-2', name: 'Jane Smith', skills: ['Electrical Wiring', 'Plumbing'], location: 'Abuja', shortlisted: true },
];

const CandidateSearch = () => {
  const [candidates, setCandidates] = useState(mockCandidates);

  const handleShortlist = (id) => {
    setCandidates(candidates.map(c => c.id === id ? { ...c, shortlisted: true } : c));
  };

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto', background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #eee', padding: 32 }}>
      <h2>Candidate Search</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {candidates.map(cand => (
          <li key={cand.id} style={{ marginBottom: 16, padding: 16, background: '#f9f9f9', borderRadius: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <b>{cand.name}</b> <span style={{ color: '#888' }}>({cand.location})</span>
              <div style={{ color: '#555', marginTop: 4 }}>Skills: {cand.skills.join(', ')}</div>
            </div>
            <button onClick={() => handleShortlist(cand.id)} disabled={cand.shortlisted} style={{ background: '#667eea', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 16px', fontWeight: 'bold' }}>
              {cand.shortlisted ? 'Shortlisted' : 'Shortlist'}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CandidateSearch; 