import React, { useState } from 'react';

const mockSkills = [
  { id: '1', name: 'Plumbing', level: 'basic', status: 'not started' },
  { id: '2', name: 'Electrical Wiring', level: 'intermediate', status: 'completed' },
  { id: '3', name: 'Carpentry', level: 'basic', status: 'in progress' },
];

const SkillAssessment = () => {
  const [selected, setSelected] = useState(null);

  if (selected) {
    return (
      <div style={{ maxWidth: 600, margin: '2rem auto', background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #eee', padding: 32 }}>
        <h2>{selected.name} Assessment</h2>
        <p>Skill assessment in progress... (mock)</p>
        <button onClick={() => setSelected(null)} style={{ marginTop: 24 }}>Back to Skills</button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto', background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #eee', padding: 32 }}>
      <h2>Skill Assessments</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {mockSkills.map(skill => (
          <li key={skill.id} style={{ marginBottom: 16, padding: 16, background: '#f9f9f9', borderRadius: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <b>{skill.name}</b> <span style={{ color: '#888' }}>({skill.level})</span>
              <span style={{ marginLeft: 8, color: skill.status === 'completed' ? 'green' : skill.status === 'in progress' ? 'orange' : '#888' }}>({skill.status})</span>
            </div>
            <button onClick={() => setSelected(skill)} disabled={skill.status === 'completed'} style={{ background: '#667eea', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 16px', fontWeight: 'bold' }}>
              {skill.status === 'completed' ? 'Done' : 'Start'}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SkillAssessment; 