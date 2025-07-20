import React from 'react';

const mockContent = [
  { id: '1', title: 'Basic Reading Skills', subject: 'literacy', level: 'primary1', type: 'video', duration: 15 },
  { id: '2', title: 'Basic Mathematics', subject: 'numeracy', level: 'primary1', type: 'interactive', duration: 20 },
  { id: '3', title: 'Advanced Reading', subject: 'literacy', level: 'primary2', type: 'text', duration: 30 },
];

const LearningContent = () => (
  <div style={{ maxWidth: 600, margin: '2rem auto', background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #eee', padding: 32 }}>
    <h2>Learning Content</h2>
    <ul style={{ listStyle: 'none', padding: 0 }}>
      {mockContent.map(c => (
        <li key={c.id} style={{ marginBottom: 16, padding: 16, background: '#f9f9f9', borderRadius: 6 }}>
          <b>{c.title}</b> <span style={{ color: '#888' }}>({c.subject}, {c.level}, {c.type})</span>
          <div style={{ color: '#555', marginTop: 4 }}>Duration: {c.duration} min</div>
          <button style={{ marginTop: 8, background: '#667eea', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 16px', fontWeight: 'bold' }}>View</button>
        </li>
      ))}
    </ul>
  </div>
);

export default LearningContent; 