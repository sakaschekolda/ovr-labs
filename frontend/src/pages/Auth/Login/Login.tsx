import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { RootState } from '../../../app/store';
import { loginUser } from '../../../features/auth/authThunks';
import Button from '../../../components/Button';
import ErrorNotification from '../../../components/ErrorNotification';
import styles from './Login.module.scss';

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

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showError, setShowError] = useState(false);
  const [customError, setCustomError] = useState('');
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLoading, isError, errorMessage } = useAppSelector((state: RootState) => state.auth);
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/events';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  useEffect(() => {
    if (isError && errorMessage) {
      setShowError(true);
      setCustomError('');
    }
  }, [isError, errorMessage]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidEmail(email)) {
      setShowError(true);
      setCustomError('Введите корректный email');
      return;
    }
    setCustomError('');
    dispatch(loginUser({ email, password }));
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
          <h1 className={styles.title}>Login</h1>
          <form onSubmit={handleSubmit} noValidate>
            <div className={styles.formGroup}>
              <label htmlFor="email" className={styles.label}>Email</label>
              <input
                type="text"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={styles.input}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="password" className={styles.label}>Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={styles.input}
              />
            </div>
            <Button type="submit" primary disabled={isLoading} className={styles.submitButton}>
              {isLoading ? <Spinner /> : 'Login'}
            </Button>
          </form>
          <div className={styles.registerLink}>
            Don't have an account? <Link to="/auth/register">Register</Link>
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