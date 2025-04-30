import React from 'react';
import Button from '../../../../../components/Button';
import styles from './AuthForm.module.scss';

interface AuthFormProps {
  onSubmit: (e: React.FormEvent) => void;
  onNavigate: () => void;
  formData: {
    email: string;
    password: string;
  };
  onFormDataChange: (field: string, value: string) => void;
}

const AuthForm: React.FC<AuthFormProps> = ({
  onSubmit,
  onNavigate,
  formData,
  onFormDataChange,
}) => {
  return (
    <form onSubmit={onSubmit} className={styles.form}>
      <div className={styles.formGroup}>
        <label htmlFor="email" className={styles.label}>Email</label>
        <input
          type="email"
          id="email"
          value={formData.email}
          onChange={(e) => onFormDataChange('email', e.target.value)}
          className={styles.input}
          required
        />
      </div>
      <div className={styles.formGroup}>
        <label htmlFor="password" className={styles.label}>Пароль</label>
        <input
          type="password"
          id="password"
          value={formData.password}
          onChange={(e) => onFormDataChange('password', e.target.value)}
          className={styles.input}
          required
        />
      </div>
      <Button type="submit" className={styles.submitButton}>Войти</Button>
      <p className={styles.registerLink}>
        Нет аккаунта?{' '}
        <Button variant="secondary" onClick={onNavigate}>
          Зарегистрироваться
        </Button>
      </p>
    </form>
  );
};

export default AuthForm; 