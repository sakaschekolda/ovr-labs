import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { RootState } from '../../../app/store';
import { registerUser } from '../../../features/auth/authThunks';
import Button from '../../../components/Button';
import ErrorNotification from '../../../components/ErrorNotification';
import styles from './Register.module.scss';

const Spinner = () => (
  <span style={{
    display: 'inline-block',
    width: 18,
    height: 18,
    border: '2px solid #b71c1c',
    borderTop: '2px solid transparent',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    verticalAlign: 'middle',
    marginRight: 8
  }} />
);

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showError, setShowError] = useState(false);
  const [customError, setCustomError] = useState('');
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLoading, errorMessage } = useAppSelector((state: RootState) => state.auth);
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname === '/events' ? '/events' : '/';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  useEffect(() => {
    if (errorMessage) {
      setShowError(true);
      setCustomError('');
    }
  }, [errorMessage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidEmail(formData.email)) {
      setShowError(true);
      setCustomError('Введите корректный email');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setShowError(true);
      setCustomError('Пароли не совпадают');
      return;
    }
    if (formData.password.length < 8) {
      setShowError(true);
      setCustomError('Пароль должен быть не менее 8 символов');
      return;
    }
    setCustomError('');
    dispatch(registerUser(formData));
    // Не делаем navigate сразу, только после успешной регистрации
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setCustomError('');
  };

  return (
    <>
      {showError && (
        <ErrorNotification
          message={customError || errorMessage || ''}
          onClose={() => { setShowError(false); setCustomError(''); }}
          duration={5000}
        />
      )}
      <div className={styles.authContainer}>
        <div className={styles.form}>
          <h1 className={styles.title}>Create Account</h1>
          <form onSubmit={handleSubmit} noValidate>
            <div className={styles.formGroup}>
              <label htmlFor="name" className={styles.label}>Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                minLength={3}
                className={styles.input}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="email" className={styles.label}>Email</label>
              <input
                type="text"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className={styles.input}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="password" className={styles.label}>Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={8}
                className={styles.input}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="confirmPassword" className={styles.label}>Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className={styles.input}
              />
            </div>
            <Button type="submit" primary disabled={isLoading} className={styles.submitButton}>
              {isLoading ? <Spinner /> : 'Register'}
            </Button>
          </form>
          <div className={styles.loginLink}>
            Already have an account? <Link to="/auth/login">Login</Link>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}; 