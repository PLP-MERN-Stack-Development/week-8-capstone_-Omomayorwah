import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

const Sidebar = ({ role }) => {
  const { t } = useTranslation();
  let links = [
    { to: '/', label: t('dashboard') },
  ];
  if (role === 'student') {
    links.push(
      { to: '/assessments', label: t('assessments') },
      { to: '/content', label: t('content') },
      { to: '/progress', label: t('progress') },
    );
  } else if (role === 'artisan') {
    links.push(
      { to: '/skills', label: t('skills') },
      { to: '/certificates', label: t('certificates') },
      { to: '/portfolio', label: t('portfolio') },
      { to: '/jobs', label: t('jobs') },
    );
  } else if (role === 'employer') {
    links.push(
      { to: '/jobs', label: t('jobs') },
      { to: '/candidates', label: t('candidates') },
      { to: '/applications', label: t('applications') },
    );
  } else if (role === 'admin') {
    links.push(
      { to: '/admin/users', label: t('users') },
      { to: '/admin/jobs', label: t('jobManagement') },
      { to: '/admin/payments', label: t('payments') },
    );
  }
  return (
    <aside style={{ width: '220px', background: '#f4f4f4', padding: '1rem', minHeight: '100vh' }} aria-label="Sidebar navigation">
      <nav>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {links.map(link => (
            <li key={link.to} style={{ margin: '1rem 0' }}>
              <a href={link.to} style={{ color: '#667eea', textDecoration: 'none', fontWeight: 'bold' }} aria-label={link.label}>{link.label}</a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

Sidebar.propTypes = {
  role: PropTypes.string,
};
Sidebar.defaultProps = {
  role: 'student',
};

export default Sidebar; 