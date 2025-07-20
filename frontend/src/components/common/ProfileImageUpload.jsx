import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../../services/api';
import './ProfileImageUpload.css';

const ProfileImageUpload = ({ onUploadSuccess, onUploadError }) => {
  const { t } = useTranslation();
  const { user, updateUser } = useUser();
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (file) => {
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('profileImage', selectedFile);

    try {
      const response = await api.post('/users/profile-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        // Update user context with new profile image
        updateUser({ ...user, profileImage: response.data.profileImage });
        setSelectedFile(null);
        setPreview(null);
        onUploadSuccess?.(response.data.profileImage);
      }
    } catch (error) {
      console.error('Upload failed:', error);
      onUploadError?.(error.response?.data?.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="profile-image-upload">
      <div className="upload-section">
        {/* Drag and Drop Area */}
        <div
          className={`drag-drop-area ${dragActive ? 'drag-active' : ''} ${selectedFile ? 'has-file' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="drag-content">
            <i className="fas fa-cloud-upload-alt"></i>
            <p>{t('profile.dragDropText')}</p>
            <p className="or-text">{t('profile.or')}</p>
            <button 
              type="button" 
              className="browse-btn"
              onClick={(e) => e.stopPropagation()}
            >
              {t('profile.browseFiles')}
            </button>
          </div>
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInput}
          style={{ display: 'none' }}
        />

        {/* Preview Section */}
        {preview && (
          <div className="preview-section">
            <h4>{t('profile.preview')}</h4>
            <div className="preview-container">
              <img src={preview} alt="Preview" className="preview-image" />
              <div className="preview-actions">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleUpload}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      {t('profile.uploading')}
                    </>
                  ) : (
                    <>
                      <i className="fas fa-upload"></i>
                      {t('profile.uploadImage')}
                    </>
                  )}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={clearSelection}
                  disabled={isUploading}
                >
                  <i className="fas fa-times"></i>
                  {t('profile.clear')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Current Profile Image */}
        {user?.profileImage && !preview && (
          <div className="current-image-section">
            <h4>{t('profile.currentImage')}</h4>
            <div className="current-image-container">
              <img 
                src={user.profileImage} 
                alt="Current Profile" 
                className="current-profile-image" 
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileImageUpload; 