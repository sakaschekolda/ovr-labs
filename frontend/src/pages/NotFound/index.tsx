import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/Button';
import './styles.css';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <h1 className="not-found-title">404</h1>
        <h2 className="not-found-subtitle">Страница не найдена</h2>
        <p className="not-found-text">
          К сожалению, запрашиваемая страница не существует или была перемещена.
        </p>
        <div className="not-found-actions">
          <Button variant="primary" onClick={() => navigate('/')}>
            На главную
          </Button>
          <Button variant="secondary" onClick={() => navigate(-1)}>
            Назад
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound; 