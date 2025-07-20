import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useUser } from '../../context/UserContext';
import ProfileImageUpload from './ProfileImageUpload';
import { api } from '../../services/api';
import './Profile.css';

const Profile = () => {
  const { t } = useTranslation();
  const { user, updateUser } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    location: user?.location || '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage('');

    try {
      const response = await api.put('/users/profile', formData);
      
      if (response.data.success) {
        updateUser({ ...user, ...formData });
        setIsEditing(false);
        setMessage('Profile updated successfully!');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      console.error('Profile update failed:', error);
      setMessage(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUploadSuccess = (profileImage) => {
    setMessage('Profile image updated successfully!');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleUploadError = (error) => {
    setMessage(error || 'Failed to upload image');
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>{t('profile.title')}</h1>
        <p>{t('profile.subtitle')}</p>
      </div>

      {message && (
        <div className={`message ${message.includes('successfully') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      <div className="profile-content">
        <div className="profile-section">
          <h2>{t('profile.imageSection')}</h2>
          <ProfileImageUpload 
            onUploadSuccess={handleUploadSuccess}
            onUploadError={handleUploadError}
          />
        </div>

        <div className="profile-section">
          <div className="section-header">
            <h2>{t('profile.personalInfo')}</h2>
            <button
              type="button"
              className={`btn ${isEditing ? 'btn-secondary' : 'btn-primary'}`}
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? t('profile.cancel') : t('profile.edit')}
            </button>
          </div>

          <div className="profile-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName">{t('profile.firstName')}</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label htmlFor="lastName">{t('profile.lastName')}</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="form-control"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="email">{t('profile.email')}</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label htmlFor="phone">{t('profile.phone')}</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="form-control"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="location">{t('profile.location')}</label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label htmlFor="bio">{t('profile.bio')}</label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="form-control"
                rows="4"
                placeholder={t('profile.bioPlaceholder')}
              />
            </div>

            {isEditing && (
              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      {t('profile.saving')}
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save"></i>
                      {t('profile.save')}
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="profile-section">
          <h2>{t('profile.accountInfo')}</h2>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">{t('profile.role')}</span>
              <span className="info-value">{user?.role}</span>
            </div>
            <div className="info-item">
              <span className="info-label">{t('profile.memberSince')}</span>
              <span className="info-value">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">{t('profile.lastLogin')}</span>
              <span className="info-value">
                {user?.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 