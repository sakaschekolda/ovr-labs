import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { logout } from '../../features/auth/authSlice';
import Button from '../Button';
import './Header.css';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const user = useAppSelector(state => state.auth.user);
  const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated);
  const dispatch = useAppDispatch();

  const handleLogout = () => {
    dispatch(logout());
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
                <span className="user-name">{user?.name}</span>
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