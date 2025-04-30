import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './styles.css';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="home">
      <header className="header">
        <div className="header-content">
          <Link to="/" className="logo">
            <h1>EventHub</h1>
          </Link>
          <div className="auth-buttons">
            {isAuthenticated ? (
              <div className="user-section">
                <div className="user-info">
                  <span className="user-greeting">Добро пожаловать, {user?.name}</span>
                  <span className="user-role">{user?.role}</span>
                </div>
                <button onClick={handleLogout} className="logout-button">Выйти</button>
              </div>
            ) : (
              <>
                <Link to="/auth/login" className="login-button">Войти</Link>
                <Link to="/auth/register" className="register-button">Регистрация</Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="main-content">
        <section className="hero">
          <div className="hero-content">
            <h2>Добро пожаловать в EventHub</h2>
            <p>Платформа для организации и участия в мероприятиях</p>
            <div className="hero-buttons">
              <Link to="/events" className="primary-button">Посмотреть мероприятия</Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home; 