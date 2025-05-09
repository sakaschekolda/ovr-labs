import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { RootState } from '../../../app/store';
import { registerUser, loginUser } from '../../../features/auth/authThunks';
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

export const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    middleName: '',
    email: '',
    password: '',
    confirmPassword: '',
    gender: 'other' as 'male' | 'female' | 'other',
    birthDate: ''
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
    if (!formData.firstName || !formData.lastName || !formData.middleName) {
      setShowError(true);
      setCustomError('Все поля имени обязательны для заполнения');
      return;
    }
    if (!formData.birthDate) {
      setShowError(true);
      setCustomError('Дата рождения обязательна для заполнения');
      return;
    }
    setCustomError('');
    try {
      await dispatch(registerUser(formData)).unwrap();
      await dispatch(loginUser({
        email: formData.email,
        password: formData.password
      })).unwrap();
      navigate(from, { replace: true });
    } catch (error) {
      console.error('Registration or login failed:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
              <label htmlFor="firstName" className={styles.label}>First Name</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                minLength={2}
                className={styles.input}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="lastName" className={styles.label}>Last Name</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                minLength={2}
                className={styles.input}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="middleName" className={styles.label}>Middle Name</label>
              <input
                type="text"
                id="middleName"
                name="middleName"
                value={formData.middleName}
                onChange={handleChange}
                required
                minLength={2}
                className={styles.input}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="gender" className={styles.label}>Gender</label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
                className={styles.input}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="birthDate" className={styles.label}>Birth Date</label>
              <input
                type="date"
                id="birthDate"
                name="birthDate"
                value={formData.birthDate}
                onChange={handleChange}
                required
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

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}; 