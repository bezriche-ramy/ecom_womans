import React from 'react';
import { FaExclamationTriangle, FaTimes, FaTrash, FaCheck, FaInfoCircle } from 'react-icons/fa';
import styles from './ConfirmModal.module.css';

const ConfirmModal = ({ 
  isOpen = true, 
  onClose, 
  onConfirm, 
  title = "Confirm Action",
  message = "Are you sure you want to perform this action?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "default", // default, danger, warning, success, delete
  loading = false,
  children,
  // Legacy props support
  onCancel
}) => {
  // Support legacy onCancel prop
  const handleClose = onClose || onCancel;

  if (!isOpen) return null;

  const getTypeConfig = () => {
    const configs = {
      default: {
        icon: FaInfoCircle,
        iconColor: '#3b82f6',
        confirmButtonClass: styles.confirmButton,
        iconBg: '#dbeafe'
      },
      danger: {
        icon: FaExclamationTriangle,
        iconColor: '#ef4444',
        confirmButtonClass: styles.dangerButton,
        iconBg: '#fee2e2'
      },
      delete: {
        icon: FaTrash,
        iconColor: '#ef4444',
        confirmButtonClass: styles.dangerButton,
        iconBg: '#fee2e2'
      },
      warning: {
        icon: FaExclamationTriangle,
        iconColor: '#f59e0b',
        confirmButtonClass: styles.warningButton,
        iconBg: '#fef3c7'
      },
      success: {
        icon: FaCheck,
        iconColor: '#10b981',
        confirmButtonClass: styles.successButton,
        iconBg: '#d1fae5'
      }
    };
    return configs[type] || configs.default;
  };

  const typeConfig = getTypeConfig();
  const IconComponent = typeConfig.icon;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !loading) {
      handleClose();
    }
  };

  const handleConfirm = () => {
    if (!loading && onConfirm) {
      onConfirm();
    }
  };

  const handleCancel = () => {
    if (!loading && handleClose) {
      handleClose();
    }
  };

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <div className={styles.iconContainer} style={{ backgroundColor: typeConfig.iconBg }}>
            <IconComponent style={{ color: typeConfig.iconColor }} />
          </div>
          <button 
            className={styles.closeButton} 
            onClick={handleCancel}
            disabled={loading}
            aria-label="Close modal"
          >
            <FaTimes />
          </button>
        </div>

        <div className={styles.content}>
          <h3 className={styles.title}>{title}</h3>
          <p className={styles.message}>{message}</p>
          {children && (
            <div className={styles.extraContent}>
              {children}
            </div>
          )}
        </div>

        <div className={styles.actions}>
          <button 
            className={styles.cancelButton} 
            onClick={handleCancel}
            disabled={loading}
          >
            {cancelText}
          </button>
          <button 
            className={`${styles.actionButton} ${typeConfig.confirmButtonClass}`}
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? (
              <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
                <span>Processing...</span>
              </div>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
