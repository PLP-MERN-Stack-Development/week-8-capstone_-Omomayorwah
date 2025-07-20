import React from 'react';

const mockCertificates = [
  { id: 'cert-1', skill: 'Plumbing', level: 'basic', issued: '2024-01-15', expiry: '2026-01-15', url: '#', code: 'LERNBASE-PLUMB-001' },
  { id: 'cert-2', skill: 'Electrical Wiring', level: 'intermediate', issued: '2024-02-20', expiry: '2027-02-20', url: '#', code: 'NABTEB-ELEC-002' },
];

const CertificateView = () => (
  <div style={{ maxWidth: 600, margin: '2rem auto', background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #eee', padding: 32 }}>
    <h2>Certificates</h2>
    <ul style={{ listStyle: 'none', padding: 0 }}>
      {mockCertificates.map(cert => (
        <li key={cert.id} style={{ marginBottom: 16, padding: 16, background: '#f9f9f9', borderRadius: 6 }}>
          <div><b>Skill:</b> {cert.skill} ({cert.level})</div>
          <div><b>Issued:</b> {cert.issued} <b>Expiry:</b> {cert.expiry}</div>
          <div><b>Verification Code:</b> {cert.code}</div>
          <a href={cert.url} download style={{ marginTop: 8, display: 'inline-block', background: '#667eea', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 16px', fontWeight: 'bold', textDecoration: 'none' }}>Download PDF</a>
        </li>
      ))}
    </ul>
  </div>
);

export default CertificateView; 