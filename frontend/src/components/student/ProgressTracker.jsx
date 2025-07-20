import React from 'react';

const mockProgress = {
  overall: 65,
  subjects: {
    literacy: { progress: 70, completed: 14, total: 20, avgScore: 85 },
    numeracy: { progress: 60, completed: 12, total: 20, avgScore: 78 },
  },
  recommendations: [
    'Focus on improving numeracy skills',
    'Try more advanced literacy exercises',
    'Complete the remaining assessments',
  ],
};

const ProgressTracker = () => (
  <div style={{ maxWidth: 600, margin: '2rem auto', background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #eee', padding: 32 }}>
    <h2>Progress Tracker</h2>
    <div style={{ marginBottom: 16 }}>
      <b>Overall Progress:</b> {mockProgress.overall}%
    </div>
    <div style={{ marginBottom: 16 }}>
      <b>Subjects:</b>
      <ul style={{ paddingLeft: 20 }}>
        {Object.entries(mockProgress.subjects).map(([subject, data]) => (
          <li key={subject}>
            <b>{subject.charAt(0).toUpperCase() + subject.slice(1)}:</b> {data.progress}% complete, {data.completed}/{data.total} lessons, Avg Score: {data.avgScore}
          </li>
        ))}
      </ul>
    </div>
    <div>
      <b>Recommendations:</b>
      <ul style={{ paddingLeft: 20 }}>
        {mockProgress.recommendations.map((rec, i) => (
          <li key={i}>{rec}</li>
        ))}
      </ul>
    </div>
  </div>
);

export default ProgressTracker; 