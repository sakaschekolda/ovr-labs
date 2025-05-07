import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { registerUser } from '../../../features/auth/authThunks';
import Button from '../../../components/Button';
import ErrorMessage from '../../../components/ErrorMessage';
import styles from './Register.module.scss';

export const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLoading, errorMessage } = useAppSelector(state => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/events');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    try {
      dispatch(registerUser(formData));
      navigate('/auth/login');
    } catch (err) {
      console.error('Registration failed:', err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  if (isLoading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  const errorMessageToDisplay = error || errorMessage || '';

  return (
    <div className={styles.authContainer}>
      <div className={styles.form}>
        <h1 className={styles.title}>Create Account</h1>
        {errorMessageToDisplay && <ErrorMessage message={errorMessageToDisplay} />}
        <form onSubmit={handleSubmit}>
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
              type="email"
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
              minLength={6}
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
            {isLoading ? 'Creating Account...' : 'Register'}
          </Button>
        </form>
        <div className={styles.loginLink}>
          Already have an account? <Link to="/auth/login">Login</Link>
        </div>
      </div>
    </div>
  );
}; 