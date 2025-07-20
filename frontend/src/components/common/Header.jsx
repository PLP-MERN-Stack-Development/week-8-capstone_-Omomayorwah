import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useUser } from '../../context/UserContext';
import NotificationBell from './NotificationBell';
import ErrorBoundary from './ErrorBoundary';
import AccessibilityPanel from './AccessibilityPanel';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Button from 'react-bootstrap/Button';

const Header = () => {
  const { t } = useTranslation();
  const { user, logout } = useUser();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showAccessibilityPanel, setShowAccessibilityPanel] = useState(false);

  const handleLogout = () => {
    logout();
  };

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
  };

  const toggleAccessibilityPanel = () => {
    setShowAccessibilityPanel(!showAccessibilityPanel);
  };

  return (
    <Container fluid className="w-full">

      <Navbar fluid variant="primary" data-bs-theme="primary" expand="lg" className="bg-body-tertiary">
      <Container>
        <Navbar.Brand href="#home">
          <i className="fas fa-graduation-cap"></i>
          <span className="logo-text">LearnBase</span>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link href="/dashboard" aria-label={t('dashboard')}>
              <i className="fas fa-home"></i>
              <span>{t('dashboard')}</span>
            </Nav.Link>
            <Nav.Link href="/content" aria-label={t('content')}>
              <i className="fas fa-book"></i>
                <span>{t('content')}</span>
            </Nav.Link>
            <Nav.Link href="/portfolio" aria-label={t('portfolio')}>
              <i className="fas fa-clipboard-check"></i>
                <span>{t('portfolio')}</span>
            </Nav.Link>
            <Nav.Link href="/jobs" aria-label={t('jobs')}>
              <i className="fas fa-briefcase"></i>
                <span>{t('jobs')}</span>
            </Nav.Link>
          </Nav>
          <Button variant="link" onClick={toggleUserMenu}>
               <div className="user-avatar">
                    {user?.profileImage ? (
                      <img 
                        src={user.profileImage} 
                        alt="Profile" 
                        className="avatar-image"
                      />
                    ) : (
                      <i className="fas fa-user"></i>
                    )}
                  </div>
                  <span className="user-name">{user?.firstName || ''}</span>
                  <i className="fas fa-chevron-down"></i>
             </Button>
              {showUserMenu && (
                  <div className="user-dropdown">
                    <div className="dropdown-header">
                      <div className="user-info">
                        <div className="user-avatar">
                          {user?.profileImage ? (
                            <img 
                              src={user.profileImage} 
                              alt="Profile" 
                              className="avatar-image"
                            />
                          ) : (
                            <i className="fas fa-user"></i>
                          )}
                        </div>
                        <div className="user-details">
                          <h4>{user?.firstName} {user?.lastName}</h4>
                          <p>{user?.email}</p>
                          <span className="user-role">{user?.role}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="dropdown-menu">
                      <a href="/profile" className="dropdown-item">
                        <i className="fas fa-user"></i>
                        <span>{t('profile.title')}</span>
                      </a>
                      <a href="/settings" className="dropdown-item">
                        <i className="fas fa-cog"></i>
                        <span>Settings</span>
                      </a>
                      <div className="dropdown-divider"></div>
                      <button className="dropdown-item logout-btn" onClick={handleLogout}>
                        <i className="fas fa-sign-out-alt"></i>
                        <span>{t('logout')}</span>
                      </button>
                    </div>
                  </div>
                )}

              {/* Accessibility Button */}
              <Button
                className="accessibility-btn"
                onClick={toggleAccessibilityPanel}
                aria-label={t('accessibility.openPanel')}
              >
                <i className="fas fa-universal-access"></i>
                <span className="accessibility-label">{t('accessibility.accessibility')}</span>
              </Button>
        </Navbar.Collapse>
         {/* Notification Bell */}
          <NotificationBell />
      </Container>
    </Navbar>

      <ErrorBoundary>
        <AccessibilityPanel 
          isOpen={showAccessibilityPanel}
          onClose={() => setShowAccessibilityPanel(false)}
        />
      </ErrorBoundary>
    </Container>
  );
};

export default Header;