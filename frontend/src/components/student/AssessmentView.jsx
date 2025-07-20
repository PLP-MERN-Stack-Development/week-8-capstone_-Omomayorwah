import React, { useState } from 'react';

const mockAssessments = [
  { id: '1', title: 'Primary 1 Literacy Assessment', subject: 'literacy', level: 'primary1', completed: false },
  { id: '2', title: 'Primary 1 Numeracy Assessment', subject: 'numeracy', level: 'primary1', completed: true },
  { id: '3', title: 'Primary 2 Literacy Assessment', subject: 'literacy', level: 'primary2', completed: false },
];

const AssessmentView = () => {
  const [selected, setSelected] = useState(null);

  if (selected) {
    return (
      <div style={{ maxWidth: 600, margin: '2rem auto', background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #eee', padding: 32 }}>
        <h2>{selected.title}</h2>
        <p>Assessment in progress... (mock)</p>
        <button onClick={() => setSelected(null)} style={{ marginTop: 24 }}>Back to Assessments</button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto', background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #eee', padding: 32 }}>
      <h2>Assessments</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {mockAssessments.map(a => (
          <li key={a.id} style={{ marginBottom: 16, padding: 16, background: '#f9f9f9', borderRadius: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <b>{a.title}</b> <span style={{ color: '#888' }}>({a.subject}, {a.level})</span>
              {a.completed && <span style={{ color: 'green', marginLeft: 8 }}>(Completed)</span>}
            </div>
            <button onClick={() => setSelected(a)} disabled={a.completed} style={{ background: '#667eea', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 16px', fontWeight: 'bold' }}>
              {a.completed ? 'Done' : 'Start'}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AssessmentView; 