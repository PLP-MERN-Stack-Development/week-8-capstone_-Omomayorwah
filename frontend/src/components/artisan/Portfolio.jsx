import React, { useState } from 'react';

const mockProjects = [
  { id: 'proj-1', title: 'Residential Plumbing Installation', skills: ['Plumbing'], completed: '2024-03-15', rating: 5, images: [] },
  { id: 'proj-2', title: 'Commercial Electrical Work', skills: ['Electrical Wiring'], completed: '2024-02-10', rating: 4, images: [] },
];

const Portfolio = () => {
  const [projects, setProjects] = useState(mockProjects);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ title: '', skills: '', completed: '', rating: 0 });

  const handleAdd = (e) => {
    e.preventDefault();
    setProjects([
      ...projects,
      { ...form, id: `proj-${Date.now()}`, skills: form.skills.split(','), images: [] },
    ]);
    setForm({ title: '', skills: '', completed: '', rating: 0 });
    setAdding(false);
  };

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto', background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #eee', padding: 32 }}>
      <h2>Portfolio</h2>
      <button onClick={() => setAdding(!adding)} style={{ marginBottom: 16, background: '#667eea', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 16px', fontWeight: 'bold' }}>{adding ? 'Cancel' : 'Add Project'}</button>
      {adding && (
        <form onSubmit={handleAdd} style={{ marginBottom: 24 }}>
          <input placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} style={{ width: '100%', marginBottom: 8 }} />
          <input placeholder="Skills (comma separated)" value={form.skills} onChange={e => setForm({ ...form, skills: e.target.value })} style={{ width: '100%', marginBottom: 8 }} />
          <input type="date" placeholder="Completed Date" value={form.completed} onChange={e => setForm({ ...form, completed: e.target.value })} style={{ width: '100%', marginBottom: 8 }} />
          <input type="number" placeholder="Rating" min={1} max={5} value={form.rating} onChange={e => setForm({ ...form, rating: e.target.value })} style={{ width: '100%', marginBottom: 8 }} />
          <button type="submit" style={{ background: '#667eea', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 16px', fontWeight: 'bold', width: '100%' }}>Add</button>
        </form>
      )}
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {projects.map(proj => (
          <li key={proj.id} style={{ marginBottom: 16, padding: 16, background: '#f9f9f9', borderRadius: 6 }}>
            <div><b>{proj.title}</b></div>
            <div><b>Skills:</b> {proj.skills.join(', ')}</div>
            <div><b>Completed:</b> {proj.completed}</div>
            <div><b>Rating:</b> {proj.rating} / 5</div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Portfolio; 