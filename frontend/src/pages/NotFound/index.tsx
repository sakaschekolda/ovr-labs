import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/Button';
import './styles.css';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="not-found-container">
      <h1>404</h1>
      <h2>Страница не найдена</h2>
      <p>Извините, запрашиваемая страница не существует.</p>
      <Button onClick={() => navigate('/')}>Вернуться на главную</Button>
    </div>
  );
};

export default NotFound; 