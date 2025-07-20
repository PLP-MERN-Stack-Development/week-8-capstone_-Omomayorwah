import { useEffect, useCallback } from 'react';

export const useKeyboardNavigation = () => {
  const handleKeyDown = useCallback((event) => {
    // Global keyboard shortcuts
    switch (event.key) {
      case 'h':
      case 'H':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          window.location.href = '/dashboard';
        }
        break;
      
      case 'n':
      case 'N':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          // Trigger notification panel
          const notificationBell = document.querySelector('.notification-bell');
          if (notificationBell) {
            notificationBell.click();
          }
        }
        break;
      
      case 'a':
      case 'A':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          // Trigger accessibility panel
          const accessibilityBtn = document.querySelector('.accessibility-btn');
          if (accessibilityBtn) {
            accessibilityBtn.click();
          }
        }
        break;
      
      case 'Escape':
        // Close any open modals or dropdowns
        const modals = document.querySelectorAll('.notification-overlay, .accessibility-overlay');
        modals.forEach(modal => {
          if (modal.style.display !== 'none') {
            const closeBtn = modal.querySelector('.close-btn, .btn-close');
            if (closeBtn) {
              closeBtn.click();
            }
          }
        });
        break;
      
      default:
        break;
    }
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return {
    handleKeyDown,
  };
};

export const useFocusManagement = () => {
  const trapFocus = useCallback((element) => {
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    const handleTabKey = (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };
    
    element.addEventListener('keydown', handleTabKey);
    
    return () => {
      element.removeEventListener('keydown', handleTabKey);
    };
  }, []);

  const focusFirstElement = useCallback((element) => {
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }
  }, []);

  return {
    trapFocus,
    focusFirstElement,
  };
};

export const useScreenReaderAnnouncement = () => {
  const announce = useCallback((message, priority = 'polite') => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    // Remove after announcement
    setTimeout(() => {
      if (document.body.contains(announcement)) {
        document.body.removeChild(announcement);
      }
    }, 1000);
  }, []);

  return { announce };
}; 