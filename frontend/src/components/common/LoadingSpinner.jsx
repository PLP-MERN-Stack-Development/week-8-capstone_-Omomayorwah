import React from 'react';
import PropTypes from 'prop-types';

const LoadingSpinner = ({ message }) => (
  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100px' }} aria-busy="true" aria-live="polite">
    <div className="lds-ring" style={{ display: 'inline-block', position: 'relative', width: '64px', height: '64px' }}>
      <div style={{ boxSizing: 'border-box', display: 'block', position: 'absolute', width: '51px', height: '51px', margin: '6px', border: '6px solid #667eea', borderRadius: '50%', animation: 'lds-ring 1.2s linear infinite', borderColor: '#667eea transparent transparent transparent' }}></div>
      <div style={{ boxSizing: 'border-box', display: 'block', position: 'absolute', width: '51px', height: '51px', margin: '6px', border: '6px solid #667eea', borderRadius: '50%', animation: 'lds-ring 1.2s linear infinite', borderColor: '#667eea transparent transparent transparent', animationDelay: '-0.45s' }}></div>
      <div style={{ boxSizing: 'border-box', display: 'block', position: 'absolute', width: '51px', height: '51px', margin: '6px', border: '6px solid #667eea', borderRadius: '50%', animation: 'lds-ring 1.2s linear infinite', borderColor: '#667eea transparent transparent transparent', animationDelay: '-0.3s' }}></div>
      <div style={{ boxSizing: 'border-box', display: 'block', position: 'absolute', width: '51px', height: '51px', margin: '6px', border: '6px solid #667eea', borderRadius: '50%', animation: 'lds-ring 1.2s linear infinite', borderColor: '#667eea transparent transparent transparent', animationDelay: '-0.15s' }}></div>
    </div>
    {message && <div style={{ marginTop: 12, color: '#667eea', fontWeight: 'bold' }}>{message}</div>}
    <style>{`
      @keyframes lds-ring {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

LoadingSpinner.propTypes = {
  message: PropTypes.string,
};
LoadingSpinner.defaultProps = {
  message: '',
};

export default LoadingSpinner; 