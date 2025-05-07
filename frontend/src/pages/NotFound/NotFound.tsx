import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/Button';
import styles from './NotFound.module.scss';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.notFoundContainer}>
      <div className={styles.notFoundContent}>
        <h1 className={styles.notFoundTitle}>404</h1>
        <h2 className={styles.notFoundSubtitle}>Страница не найдена</h2>
        <p className={styles.notFoundText}>
          К сожалению, запрашиваемая страница не существует или была перемещена.
        </p>
        <div className={styles.notFoundActions}>
          <Button variant="primary" onClick={() => navigate('/')}>На главную</Button>
          <Button variant="secondary" onClick={() => navigate(-1)}>Назад</Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound; 