import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useUser } from '../../context/UserContext';
import CertificateUpload from '../common/CertificateUpload';
import { api } from '../../services/api';
import './ArtisanCertificates.css';

const ArtisanCertificates = () => {
  const { t } = useTranslation();
  const { user } = useUser();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [showUploadForm, setShowUploadForm] = useState(false);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      const response = await api.get('/skills/certificates');
      if (response.data.success) {
        setCertificates(response.data.certificates);
      }
    } catch (error) {
      console.error('Failed to fetch certificates:', error);
      setMessage('Failed to load certificates');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSuccess = (certificate) => {
    setCertificates(prev => [certificate, ...prev]);
    setMessage('Certificate uploaded successfully!');
    setShowUploadForm(false);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleUploadError = (error) => {
    setMessage(error || 'Failed to upload certificate');
    setTimeout(() => setMessage(''), 5000);
  };

  const handleDeleteCertificate = async (certificateId) => {
    if (!window.confirm('Are you sure you want to delete this certificate?')) return;

    try {
      const response = await api.delete(`/skills/certificates/${certificateId}`);
      if (response.data.success) {
        setCertificates(prev => prev.filter(cert => cert._id !== certificateId));
        setMessage('Certificate deleted successfully!');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      console.error('Failed to delete certificate:', error);
      setMessage('Failed to delete certificate');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const isExpired = (expiryDate) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  const isExpiringSoon = (expiryDate) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  };

  if (loading) {
    return (
      <div className="certificates-container">
        <div className="loading-spinner">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Loading certificates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="certificates-container">
      <div className="certificates-header">
        <h1>{t('certificates.title')}</h1>
        <p>{t('certificates.subtitle')}</p>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setShowUploadForm(!showUploadForm)}
        >
          <i className="fas fa-plus"></i>
          {showUploadForm ? t('certificates.cancel') : t('certificates.addCertificate')}
        </button>
      </div>

      {message && (
        <div className={`message ${message.includes('successfully') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      {/* Upload Form */}
      {showUploadForm && (
        <div className="upload-section">
          <h2>{t('certificates.uploadNew')}</h2>
          <CertificateUpload 
            onUploadSuccess={handleUploadSuccess}
            onUploadError={handleUploadError}
          />
        </div>
      )}

      {/* Certificates List */}
      <div className="certificates-list">
        <h2>{t('certificates.yourCertificates')}</h2>
        
        {certificates.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-certificate"></i>
            <h3>{t('certificates.noCertificates')}</h3>
            <p>{t('certificates.noCertificatesDesc')}</p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setShowUploadForm(true)}
            >
              <i className="fas fa-plus"></i>
              {t('certificates.addFirstCertificate')}
            </button>
          </div>
        ) : (
          <div className="certificates-grid">
            {certificates.map((certificate) => (
              <div key={certificate._id} className="certificate-card">
                <div className="certificate-header">
                  <div className="certificate-icon">
                    <i className="fas fa-certificate"></i>
                  </div>
                  <div className="certificate-status">
                    {isExpired(certificate.expiryDate) && (
                      <span className="status-badge expired">
                        <i className="fas fa-exclamation-triangle"></i>
                        {t('certificates.expired')}
                      </span>
                    )}
                    {isExpiringSoon(certificate.expiryDate) && !isExpired(certificate.expiryDate) && (
                      <span className="status-badge expiring">
                        <i className="fas fa-clock"></i>
                        {t('certificates.expiringSoon')}
                      </span>
                    )}
                    {!isExpired(certificate.expiryDate) && !isExpiringSoon(certificate.expiryDate) && (
                      <span className="status-badge valid">
                        <i className="fas fa-check-circle"></i>
                        {t('certificates.valid')}
                      </span>
                    )}
                  </div>
                </div>

                <div className="certificate-content">
                  <h3 className="certificate-title">{certificate.title}</h3>
                  <p className="certificate-organization">{certificate.issuingOrganization}</p>
                  
                  <div className="certificate-details">
                    <div className="detail-item">
                      <span className="detail-label">{t('certificates.issueDate')}</span>
                      <span className="detail-value">{formatDate(certificate.issueDate)}</span>
                    </div>
                    {certificate.expiryDate && (
                      <div className="detail-item">
                        <span className="detail-label">{t('certificates.expiryDate')}</span>
                        <span className={`detail-value ${isExpired(certificate.expiryDate) ? 'expired' : ''}`}>
                          {formatDate(certificate.expiryDate)}
                        </span>
                      </div>
                    )}
                    {certificate.certificateNumber && (
                      <div className="detail-item">
                        <span className="detail-label">{t('certificates.certificateNumber')}</span>
                        <span className="detail-value">{certificate.certificateNumber}</span>
                      </div>
                    )}
                  </div>

                  {certificate.description && (
                    <div className="certificate-description">
                      <p>{certificate.description}</p>
                    </div>
                  )}

                  {certificate.fileUrl && (
                    <div className="certificate-file">
                      <a 
                        href={certificate.fileUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="btn btn-secondary btn-sm"
                      >
                        <i className="fas fa-eye"></i>
                        {t('certificates.viewCertificate')}
                      </a>
                    </div>
                  )}
                </div>

                <div className="certificate-actions">
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDeleteCertificate(certificate._id)}
                  >
                    <i className="fas fa-trash"></i>
                    {t('certificates.delete')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ArtisanCertificates; 