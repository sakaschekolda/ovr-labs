import React from 'react';
import Button from '../Button';
import styles from './ConfirmModal.module.scss';

interface ConfirmModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  message: string;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onConfirm,
  onCancel,
  title,
  message,
}) => {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.message}>{message}</p>
        <div className={styles.actions}>
          <Button onClick={onCancel} variant="secondary">Отмена</Button>
          <Button onClick={onConfirm} variant="primary">Подтвердить</Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal; 