import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { RootState } from '../../app/store';
import { fetchUserEvents, deleteEventThunk } from '../../features/events/eventsThunks';
import ErrorNotification from '../../components/ErrorNotification';
import EventCard from '../../components/EventCard/EventCard';
import ConfirmModal from '../../components/ConfirmModal/ConfirmModal';
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
  const [eventToDelete, setEventToDelete] = useState<number | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth/login');
      return;
    }
    console.log('Profile: Fetching user events...');
    dispatch(fetchUserEvents());
  }, [dispatch, isAuthenticated, navigate]);

  useEffect(() => {
    console.log('Profile: userEvents updated:', userEvents);
  }, [userEvents]);

  const handleDeleteEvent = async () => {
    if (eventToDelete) {
      try {
        await dispatch(deleteEventThunk(String(eventToDelete))).unwrap();
        setEventToDelete(null);
        dispatch(fetchUserEvents());
      } catch (error) {
        console.error('Ошибка при удалении:', error);
      }
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
              <EventCard
                key={Number(event.id)}
                id={Number(event.id)}
                title={event.title}
                description={event.description}
                date={event.date}
                category={event.category}
                creator={event.creator ? { ...event.creator, id: Number(event.creator.id) } : undefined}
                created_by={Number(event.created_by)}
                userId={user?.id ? Number(user.id) : undefined}
                userRole={user?.role}
                onEdit={() => navigate(`/events/${event.id}/edit`, { state: { from: '/profile' } })}
                onDelete={() => setEventToDelete(Number(event.id))}
              />
            ))}
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={!!eventToDelete}
        onConfirm={handleDeleteEvent}
        onCancel={() => setEventToDelete(null)}
        title="Подтверждение удаления"
        message="Вы уверены, что хотите удалить мероприятие?"
      />
    </div>
  );
};

export default Profile; 