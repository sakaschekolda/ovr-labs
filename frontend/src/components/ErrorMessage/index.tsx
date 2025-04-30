import React from 'react';
import classNames from 'classnames';
import styles from './ErrorMessage.module.scss';

interface ErrorMessageProps {
  message: string;
  onClose?: () => void;
  className?: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onClose, className }) => {
  return (
    <div className={classNames(styles.errorContainer, className)}>
      <div className={styles.errorContent}>
        <span className={styles.errorMessage}>{message}</span>
        {onClose && (
          <button className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage; 