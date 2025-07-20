import React from 'react';
import PropTypes from 'prop-types';

const Footer = ({ year }) => (
  <footer style={{ padding: '1rem', textAlign: 'center', background: '#f9f9f9', color: '#666', borderTop: '1px solid #eee', marginTop: '2rem' }}>
    <div>
      &copy; {year} LernBase Nigeria. All rights reserved.
    </div>
    <div style={{ marginTop: '0.5rem' }}>
      <a href="/privacy" style={{ color: '#667eea', margin: '0 0.5rem' }} aria-label="Privacy Policy">Privacy Policy</a>
      <a href="/terms" style={{ color: '#667eea', margin: '0 0.5rem' }} aria-label="Terms of Service">Terms of Service</a>
      <a href="/contact" style={{ color: '#667eea', margin: '0 0.5rem' }} aria-label="Contact">Contact</a>
    </div>
  </footer>
);

Footer.propTypes = {
  year: PropTypes.number,
};
Footer.defaultProps = {
  year: new Date().getFullYear(),
};

export default Footer; 