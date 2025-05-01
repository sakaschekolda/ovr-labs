import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import Button from '../../../components/Button';
import './styles.css';

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { resetPassword } = useAuth();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState<string | null>(null);

  const email = location.state?.email;

  if (!email) {
    navigate('/auth/login');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    if (formData.password.length < 8) {
      setError('Пароль должен быть не менее 8 символов');
      return;
    }

    try {
      await resetPassword(email, formData.password);
      navigate('/auth/login', { 
        state: { message: 'Пароль успешно обновлен. Теперь вы можете войти.' }
      });
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Ошибка при обновлении пароля';
      setError(errorMessage);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-content">
          <h2>Установка нового пароля</h2>
          <p>Пожалуйста, установите новый пароль для вашего аккаунта</p>
          
          {error && <div className="error-message">{error}</div>}
          
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="password">Новый пароль</label>
              <input
                type="password"
                id="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                placeholder="Введите новый пароль"
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">Подтвердите пароль</label>
              <input
                type="password"
                id="confirmPassword"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
                placeholder="Подтвердите новый пароль"
              />
            </div>
            <Button type="submit" className="auth-button">Установить пароль</Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword; 