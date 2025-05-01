import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import Button from '../../../components/Button';
import './styles.css';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password.length < 8) {
      setError('Пароль должен быть не менее 8 символов');
      return;
    }

    try {
      await login(formData.email, formData.password);
      navigate(from, { replace: true });
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Произошла ошибка при входе';
      if (errorMessage.includes('set a new password')) {
        navigate('/auth/reset-password', { 
          state: { email: formData.email },
          replace: true 
        });
      } else {
        setError(errorMessage);
      }
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-content">
          <Link to="/" className="auth-logo">
            <h1>EventHub</h1>
          </Link>
          <h2>Вход в аккаунт</h2>
          <p>Войдите в свой аккаунт, чтобы продолжить</p>
          
          {error && <div className="error-message">{error}</div>}
          
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                placeholder="Введите ваш email"
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Пароль</label>
              <input
                type="password"
                id="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                placeholder="Введите ваш пароль"
              />
            </div>
            <Button type="submit" className="auth-button">Войти</Button>
          </form>
          
          <div className="auth-footer">
            <p>Нет аккаунта?</p>
            <Button 
              variant="secondary" 
              onClick={() => navigate('/auth/register')}
              className="auth-link-button"
            >
              Зарегистрироваться
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 