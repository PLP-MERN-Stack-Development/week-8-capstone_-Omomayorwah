import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useUser } from '../../context/UserContext';
import { api } from '../../services/api';
import './NotificationCenter.css';

const NotificationCenter = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const { user } = useUser();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeTab, setActiveTab] = useState('all');
  const notificationRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications');
      if (response.data.success) {
        setNotifications(response.data.notifications);
        setUnreadCount(response.data.notifications.filter(n => !n.read).length);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const response = await api.put(`/notifications/${notificationId}/read`);
      if (response.data.success) {
        setNotifications(prev => 
          prev.map(n => 
            n._id === notificationId ? { ...n, read: true } : n
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await api.put('/notifications/mark-all-read');
      if (response.data.success) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      const response = await api.delete(`/notifications/${notificationId}`);
      if (response.data.success) {
        setNotifications(prev => prev.filter(n => n._id !== notificationId));
        const deletedNotification = notifications.find(n => n._id === notificationId);
        if (deletedNotification && !deletedNotification.read) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      }
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'job':
        return 'fas fa-briefcase';
      case 'certificate':
        return 'fas fa-certificate';
      case 'payment':
        return 'fas fa-credit-card';
      case 'assessment':
        return 'fas fa-clipboard-check';
      case 'message':
        return 'fas fa-envelope';
      case 'system':
        return 'fas fa-cog';
      default:
        return 'fas fa-bell';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'job':
        return '#3182ce';
      case 'certificate':
        return '#38a169';
      case 'payment':
        return '#d69e2e';
      case 'assessment':
        return '#805ad5';
      case 'message':
        return '#e53e3e';
      case 'system':
        return '#718096';
      default:
        return '#4a5568';
    }
  };

  const formatNotificationTime = (timestamp) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - notificationTime) / (1000 * 60));
    
    if (diffInMinutes < 1) return t('notifications.justNow');
    if (diffInMinutes < 60) return t('notifications.minutesAgo', { minutes: diffInMinutes });
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return t('notifications.hoursAgo', { hours: diffInHours });
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return t('notifications.daysAgo', { days: diffInDays });
    
    return notificationTime.toLocaleDateString();
  };

  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unread') return !notification.read;
    return notification.type === activeTab;
  });

  if (!isOpen) return null;

  return (
    <div className="notification-overlay">
      <div className="notification-center" ref={notificationRef}>
        <div className="notification-header">
          <h3>{t('notifications.title')}</h3>
          <div className="notification-actions">
            {unreadCount > 0 && (
              <button
                type="button"
                className="btn btn-sm btn-secondary"
                onClick={markAllAsRead}
              >
                {t('notifications.markAllRead')}
              </button>
            )}
            <button
              type="button"
              className="btn btn-sm btn-close"
              onClick={onClose}
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>

        {/* Notification Tabs */}
        <div className="notification-tabs">
          <button
            type="button"
            className={`tab ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            {t('notifications.all')}
          </button>
          <button
            type="button"
            className={`tab ${activeTab === 'unread' ? 'active' : ''}`}
            onClick={() => setActiveTab('unread')}
          >
            {t('notifications.unread')}
            {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
          </button>
          <button
            type="button"
            className={`tab ${activeTab === 'job' ? 'active' : ''}`}
            onClick={() => setActiveTab('job')}
          >
            {t('notifications.jobs')}
          </button>
          <button
            type="button"
            className={`tab ${activeTab === 'certificate' ? 'active' : ''}`}
            onClick={() => setActiveTab('certificate')}
          >
            {t('notifications.certificates')}
          </button>
        </div>

        {/* Notifications List */}
        <div className="notifications-list">
          {loading ? (
            <div className="loading-spinner">
              <i className="fas fa-spinner fa-spin"></i>
              <p>{t('notifications.loading')}</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-bell-slash"></i>
              <h4>{t('notifications.noNotifications')}</h4>
              <p>{t('notifications.noNotificationsDesc')}</p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification._id}
                className={`notification-item ${!notification.read ? 'unread' : ''}`}
                onClick={() => markAsRead(notification._id)}
              >
                <div className="notification-icon" style={{ color: getNotificationColor(notification.type) }}>
                  <i className={getNotificationIcon(notification.type)}></i>
                </div>
                <div className="notification-content">
                  <div className="notification-header">
                    <h4 className="notification-title">{notification.title}</h4>
                    <span className="notification-time">
                      {formatNotificationTime(notification.createdAt)}
                    </span>
                  </div>
                  <p className="notification-message">{notification.message}</p>
                  {notification.actionUrl && (
                    <a
                      href={notification.actionUrl}
                      className="notification-action"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {t('notifications.viewDetails')}
                    </a>
                  )}
                </div>
                <div className="notification-actions">
                  <button
                    type="button"
                    className="btn btn-sm btn-danger"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(notification._id);
                    }}
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter; 