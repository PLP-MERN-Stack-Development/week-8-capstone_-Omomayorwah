import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccessibility } from './AccessibilityProvider';
import './AccessibilityPanel.css';

const AccessibilityPanel = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const {
    highContrast,
    reducedMotion,
    fontSize,
    toggleHighContrast,
    toggleReducedMotion,
    changeFontSize,
  } = useAccessibility();

  const [activeTab, setActiveTab] = useState('visual');

  const fontSizes = [
    { value: 'small', label: t('accessibility.small'), size: '0.875rem' },
    { value: 'medium', label: t('accessibility.medium'), size: '1rem' },
    { value: 'large', label: t('accessibility.large'), size: '1.125rem' },
    { value: 'xlarge', label: t('accessibility.xlarge'), size: '1.25rem' },
  ];

  if (!isOpen) return null;

  return (
    <div className="accessibility-overlay">
      <div className="accessibility-panel">
        <div className="accessibility-header">
          <h2>{t('accessibility.title')}</h2>
          <button
            type="button"
            className="close-btn"
            onClick={onClose}
            aria-label={t('accessibility.close')}
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="accessibility-tabs">
          <button
            type="button"
            className={`tab ${activeTab === 'visual' ? 'active' : ''}`}
            onClick={() => setActiveTab('visual')}
          >
            <i className="fas fa-eye"></i>
            {t('accessibility.visual')}
          </button>
          <button
            type="button"
            className={`tab ${activeTab === 'navigation' ? 'active' : ''}`}
            onClick={() => setActiveTab('navigation')}
          >
            <i className="fas fa-keyboard"></i>
            {t('accessibility.navigation')}
          </button>
        </div>

        <div className="accessibility-content">
          {activeTab === 'visual' && (
            <div className="visual-settings">
              <div className="setting-group">
                <h3>{t('accessibility.fontSize')}</h3>
                <div className="font-size-controls">
                  {fontSizes.map((size) => (
                    <button
                      key={size.value}
                      type="button"
                      className={`font-size-btn ${fontSize === size.value ? 'active' : ''}`}
                      onClick={() => changeFontSize(size.value)}
                      style={{ fontSize: size.size }}
                      aria-label={`${t('accessibility.setFontSize')} ${size.label}`}
                    >
                      Aa
                    </button>
                  ))}
                </div>
              </div>

              <div className="setting-group">
                <h3>{t('accessibility.contrast')}</h3>
                <div className="toggle-control">
                  <label className="toggle-label">
                    <input
                      type="checkbox"
                      checked={highContrast}
                      onChange={toggleHighContrast}
                      className="toggle-input"
                    />
                    <span className="toggle-slider"></span>
                    <span className="toggle-text">{t('accessibility.highContrast')}</span>
                  </label>
                  <p className="setting-description">
                    {t('accessibility.highContrastDesc')}
                  </p>
                </div>
              </div>

              <div className="setting-group">
                <h3>{t('accessibility.motion')}</h3>
                <div className="toggle-control">
                  <label className="toggle-label">
                    <input
                      type="checkbox"
                      checked={reducedMotion}
                      onChange={toggleReducedMotion}
                      className="toggle-input"
                    />
                    <span className="toggle-slider"></span>
                    <span className="toggle-text">{t('accessibility.reducedMotion')}</span>
                  </label>
                  <p className="setting-description">
                    {t('accessibility.reducedMotionDesc')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'navigation' && (
            <div className="navigation-settings">
              <div className="setting-group">
                <h3>{t('accessibility.keyboardShortcuts')}</h3>
                <div className="shortcuts-list">
                  <div className="shortcut-item">
                    <kbd>Tab</kbd>
                    <span>{t('accessibility.navigateElements')}</span>
                  </div>
                  <div className="shortcut-item">
                    <kbd>Enter</kbd>
                    <span>{t('accessibility.activateElement')}</span>
                  </div>
                  <div className="shortcut-item">
                    <kbd>Space</kbd>
                    <span>{t('accessibility.toggleElement')}</span>
                  </div>
                  <div className="shortcut-item">
                    <kbd>Escape</kbd>
                    <span>{t('accessibility.closeModal')}</span>
                  </div>
                  <div className="shortcut-item">
                    <kbd>H</kbd>
                    <span>{t('accessibility.goToHome')}</span>
                  </div>
                  <div className="shortcut-item">
                    <kbd>N</kbd>
                    <span>{t('accessibility.openNotifications')}</span>
                  </div>
                </div>
              </div>

              <div className="setting-group">
                <h3>{t('accessibility.screenReader')}</h3>
                <div className="sr-info">
                  <p>{t('accessibility.srDescription')}</p>
                  <ul className="sr-features">
                    <li>{t('accessibility.srFeature1')}</li>
                    <li>{t('accessibility.srFeature2')}</li>
                    <li>{t('accessibility.srFeature3')}</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="accessibility-footer">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              // Reset all settings to default
              changeFontSize('medium');
              if (highContrast) toggleHighContrast();
              if (reducedMotion) toggleReducedMotion();
            }}
          >
            {t('accessibility.resetToDefault')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccessibilityPanel; 