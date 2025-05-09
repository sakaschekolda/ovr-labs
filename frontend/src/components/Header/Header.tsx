import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { logoutUser } from '../../features/auth/authThunks';
import Button from '../Button';
import './Header.css';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const user = useAppSelector(state => state.auth.user);
  const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated);
  const dispatch = useAppDispatch();

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  return (
    <header className="header">
      <div className="header-content">
        <div className="logo" onClick={() => navigate('/')}>
          OVR Labs
        </div>
        <div className="user-section">
          {isAuthenticated ? (
            <>
              <div className="user-info">
                <div className="user-welcome">
                  <span className="user-name">Добро пожаловать, {user?.firstName}</span>
                  <span className="user-role">{user?.role === 'admin' ? 'Администратор' : 'Пользователь'}</span>
                </div>
                <Button variant="secondary" onClick={() => navigate('/profile')}>
                  Профиль
                </Button>
              </div>
              <Button variant="secondary" onClick={handleLogout}>
                Выйти
              </Button>
            </>
          ) : (
            <>
              <Button variant="secondary" onClick={() => navigate('/auth/login')}>
                Войти
              </Button>
              <Button onClick={() => navigate('/auth/register')}>
                Регистрация
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header; 