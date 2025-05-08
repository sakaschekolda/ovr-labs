import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { RootState } from '../../app/store';
import { fetchUserEvents } from '../../features/events/eventsThunks';
import Button from '../../components/Button';
import ErrorNotification from '../../components/ErrorNotification';
import styles from './Profile.module.scss';

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

const Profile = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAppSelector((state: RootState) => state.auth);
  const { userEvents, isLoading, isError, errorMessage } = useAppSelector((state: RootState) => state.events);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth/login');
      return;
    }
    dispatch(fetchUserEvents());
  }, [dispatch, isAuthenticated, navigate]);

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'concert':
        return 'Концерт';
      case 'lecture':
        return 'Лекция';
      case 'exhibition':
        return 'Выставка';
      case 'master class':
        return 'Мастер-класс';
      case 'sport':
        return 'Спорт';
      default:
        return category;
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return (
      <div className={styles.profileContainer}>
        <div className={styles.loading}>
          <Spinner /> Loading...
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className={styles.profileContainer}>
        <ErrorNotification message={errorMessage || 'Произошла ошибка при загрузке данных'} />
      </div>
    );
  }

  return (
    <div className={styles.profileContainer}>
      <div className={styles.profileHeader}>
        <h1>Профиль</h1>
        <div className={styles.userInfo}>
          <div className={styles.infoItem}>
            <span className={styles.label}>Имя:</span>
            <span className={styles.value}>{user?.name}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.label}>Email:</span>
            <span className={styles.value}>{user?.email}</span>
          </div>
        </div>
      </div>

      <div className={styles.eventsSection}>
        <h2>Мои мероприятия</h2>
        {userEvents.length === 0 ? (
          <p className={styles.noEvents}>Вы еще не создали ни одного мероприятия.</p>
        ) : (
          <div className={styles.eventsGrid}>
            {userEvents.map(event => (
              <div key={event.id} className={styles.eventCard}>
                <div className={styles.eventContent}>
                  <h3>{event.title}</h3>
                  <p className={styles.eventCategory}>{getCategoryLabel(event.category)}</p>
                  <p className={styles.eventDate}>{new Date(event.date).toLocaleDateString()}</p>
                  <p className={styles.eventLocation}>{event.location}</p>
                  <p className={styles.eventParticipants}>
                    Участники: {event.currentParticipants} / {event.maxParticipants}
                  </p>
                </div>
                <div className={styles.eventActions}>
                  <Button onClick={() => navigate(`/events/${event.id}/edit`)}>
                    Редактировать
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile; 