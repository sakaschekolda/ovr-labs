import React, { useEffect } from 'react';
import styles from './ErrorNotification.module.scss';

interface ErrorNotificationProps {
  message: string;
  code?: string | number;
  onClose?: () => void;
  duration?: number; // в миллисекундах
}

const ErrorNotification: React.FC<ErrorNotificationProps> = ({ message, code, onClose, duration = 5000 }) => {
  useEffect(() => {
    if (!onClose) return;
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  if (!message) return null;
  return (
    <div className={styles.errorNotification}>
      <div>
        {code && <span className={styles.errorCode}>[{code}] </span>}
        <span>{message}</span>
      </div>
      {onClose && (
        <button className={styles.closeButton} onClick={onClose} aria-label="Закрыть">
          ×
        </button>
      )}
    </div>
  );
};

export default ErrorNotification; 