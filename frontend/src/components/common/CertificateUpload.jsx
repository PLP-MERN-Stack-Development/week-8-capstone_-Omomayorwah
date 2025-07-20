import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../../services/api';
import './CertificateUpload.css';

const CertificateUpload = ({ onUploadSuccess, onUploadError }) => {
  const { t } = useTranslation();
  const { user } = useUser();
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [certificateData, setCertificateData] = useState({
    title: '',
    issuingOrganization: '',
    issueDate: '',
    expiryDate: '',
    certificateNumber: '',
    description: ''
  });
  const fileInputRef = useRef(null);

  const handleFileSelect = (file) => {
    if (file && (file.type.startsWith('image/') || file.type === 'application/pdf')) {
      setSelectedFile(file);
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => setPreview(e.target.result);
        reader.readAsDataURL(file);
      } else {
        setPreview(null);
      }
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCertificateData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('certificate', selectedFile);
    formData.append('title', certificateData.title);
    formData.append('issuingOrganization', certificateData.issuingOrganization);
    formData.append('issueDate', certificateData.issueDate);
    formData.append('expiryDate', certificateData.expiryDate);
    formData.append('certificateNumber', certificateData.certificateNumber);
    formData.append('description', certificateData.description);

    try {
      const response = await api.post('/skills/certificates', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        setSelectedFile(null);
        setPreview(null);
        setCertificateData({
          title: '',
          issuingOrganization: '',
          issueDate: '',
          expiryDate: '',
          certificateNumber: '',
          description: ''
        });
        onUploadSuccess?.(response.data.certificate);
      }
    } catch (error) {
      console.error('Certificate upload failed:', error);
      onUploadError?.(error.response?.data?.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setPreview(null);
    setCertificateData({
      title: '',
      issuingOrganization: '',
      issueDate: '',
      expiryDate: '',
      certificateNumber: '',
      description: ''
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const isValidForm = () => {
    return selectedFile && 
           certificateData.title.trim() && 
           certificateData.issuingOrganization.trim() && 
           certificateData.issueDate;
  };

  return (
    <div className="certificate-upload">
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
            <i className="fas fa-certificate"></i>
            <p>{t('certificate.dragDropText')}</p>
            <p className="file-types">{t('certificate.acceptedFormats')}</p>
            <p className="or-text">{t('certificate.or')}</p>
            <button 
              type="button" 
              className="browse-btn"
              onClick={(e) => e.stopPropagation()}
            >
              {t('certificate.browseFiles')}
            </button>
          </div>
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.pdf"
          onChange={handleFileInput}
          style={{ display: 'none' }}
        />

        {/* Certificate Details Form */}
        {selectedFile && (
          <div className="certificate-form">
            <h4>{t('certificate.certificateDetails')}</h4>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="title">{t('certificate.title')} *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={certificateData.title}
                  onChange={handleInputChange}
                  className="form-control"
                  placeholder={t('certificate.titlePlaceholder')}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="issuingOrganization">{t('certificate.issuingOrganization')} *</label>
                <input
                  type="text"
                  id="issuingOrganization"
                  name="issuingOrganization"
                  value={certificateData.issuingOrganization}
                  onChange={handleInputChange}
                  className="form-control"
                  placeholder={t('certificate.organizationPlaceholder')}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="issueDate">{t('certificate.issueDate')} *</label>
                <input
                  type="date"
                  id="issueDate"
                  name="issueDate"
                  value={certificateData.issueDate}
                  onChange={handleInputChange}
                  className="form-control"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="expiryDate">{t('certificate.expiryDate')}</label>
                <input
                  type="date"
                  id="expiryDate"
                  name="expiryDate"
                  value={certificateData.expiryDate}
                  onChange={handleInputChange}
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label htmlFor="certificateNumber">{t('certificate.certificateNumber')}</label>
                <input
                  type="text"
                  id="certificateNumber"
                  name="certificateNumber"
                  value={certificateData.certificateNumber}
                  onChange={handleInputChange}
                  className="form-control"
                  placeholder={t('certificate.numberPlaceholder')}
                />
              </div>
              <div className="form-group full-width">
                <label htmlFor="description">{t('certificate.description')}</label>
                <textarea
                  id="description"
                  name="description"
                  value={certificateData.description}
                  onChange={handleInputChange}
                  className="form-control"
                  rows="3"
                  placeholder={t('certificate.descriptionPlaceholder')}
                />
              </div>
            </div>
          </div>
        )}

        {/* Preview Section */}
        {preview && (
          <div className="preview-section">
            <h4>{t('certificate.preview')}</h4>
            <div className="preview-container">
              <img src={preview} alt="Preview" className="preview-image" />
            </div>
          </div>
        )}

        {/* Upload Actions */}
        {selectedFile && (
          <div className="upload-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleUpload}
              disabled={isUploading || !isValidForm()}
            >
              {isUploading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  {t('certificate.uploading')}
                </>
              ) : (
                <>
                  <i className="fas fa-upload"></i>
                  {t('certificate.uploadCertificate')}
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
              {t('certificate.clear')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CertificateUpload; 