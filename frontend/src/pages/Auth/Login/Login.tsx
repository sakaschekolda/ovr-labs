import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { loginUser } from '../../../features/auth/authThunks';
import Button from '../../../components/Button';
import ErrorMessage from '../../../components/ErrorMessage';
import styles from './Login.module.scss';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLoading, isError, errorMessage } = useAppSelector(state => state.auth);
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/events';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(loginUser({ email, password }));
  };

  if (isLoading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  return (
    <div className={styles.authContainer}>
      <div className={styles.form}>
        <h1 className={styles.title}>Login</h1>
        {isError && <ErrorMessage message={errorMessage || ''} />}
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>Email</label>
            <input
              type="email"
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
            {isLoading ? 'Logging in...' : 'Login'}
          </Button>
        </form>
        <div className={styles.registerLink}>
          Don't have an account? <Link to="/auth/register">Register</Link>
        </div>
      </div>
    </div>
  );
}; 