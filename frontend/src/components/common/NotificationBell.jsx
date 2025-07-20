import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useUser } from '../../context/UserContext';
import { api } from '../../services/api';
import NotificationCenter from './NotificationCenter';
import './NotificationBell.css';

const NotificationBell = () => {
  const { t } = useTranslation();
  const { user } = useUser();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUnreadCount();
    
    // Set up polling for new notifications
    const interval = setInterval(fetchUnreadCount, 30000); // Check every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const response = await api.get('/notifications/unread-count');
      if (response.data.success) {
        setUnreadCount(response.data.count);
      }
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  const handleNotificationClick = () => {
    setIsNotificationOpen(true);
  };

  const handleNotificationClose = () => {
    setIsNotificationOpen(false);
    // Refresh unread count when notification center is closed
    fetchUnreadCount();
  };

  return (
    <>
      <div className="notification-bell" onClick={handleNotificationClick}>
        <div className="bell-icon">
          <i className="fas fa-bell"></i>
          {unreadCount > 0 && (
            <span className="notification-badge">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </div>
        <span className="bell-label">{t('notifications.notifications')}</span>
      </div>

      <NotificationCenter 
        isOpen={isNotificationOpen}
        onClose={handleNotificationClose}
      />
    </>
  );
};

export default NotificationBell; 