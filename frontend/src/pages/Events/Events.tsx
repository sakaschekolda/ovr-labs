import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { RootState } from '../../app/store';
import { fetchEvents, joinEventThunk, deleteEventThunk } from '../../features/events/eventsThunks';
import styles from './Events.module.scss';
import ErrorNotification from '../../components/ErrorNotification';
import { useNavigate } from 'react-router-dom';

const Events: React.FC = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state: RootState) => state.auth.user);
  const events = useAppSelector((state: RootState) => state.events.events) || [];
  const isLoading = useAppSelector((state: RootState) => state.events.isLoading);
  const isError = useAppSelector((state: RootState) => state.events.isError);
  const errorMessage = useAppSelector((state: RootState) => state.events.errorMessage);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const navigate = useNavigate();

  const categories = ['all', 'concert', 'lecture', 'exhibition', 'master class', 'sport'];

  React.useEffect(() => {
    dispatch(fetchEvents());
  }, [dispatch]);

  const filteredEvents = React.useMemo(() => {
    if (!Array.isArray(events)) return [];
    if (selectedCategory === 'all') return events;
    return events.filter(event => event.category === selectedCategory);
  }, [selectedCategory, events]);

  const handleJoinEvent = (eventId: string) => {
    dispatch(joinEventThunk(eventId));
  };

  const handleDeleteEvent = (eventId: string) => {
    dispatch(deleteEventThunk(eventId));
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
  };

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

  if (isLoading) return <div className={styles.loading}>Загрузка...</div>;
  if (isError) return <ErrorNotification message={errorMessage || 'Неизвестная ошибка'} />;

  return (
    <div className={styles.eventsPage}>
      <div className={styles.eventsContent}>
        {user && (
          <div className={styles.createEventContainer}>
            <button
              className={styles.createButton}
              onClick={() => navigate('/events/create')}
            >
              Создать мероприятие
            </button>
          </div>
        )}
        <div className={styles.filters}>
          <select
            value={selectedCategory}
            onChange={handleCategoryChange}
            className={styles.categorySelect}
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'Все категории' : getCategoryLabel(category)}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.eventsGrid}>
          {filteredEvents.map(event => (
            <div key={event.id} className={styles.eventCard}>
              <h3>{event.title}</h3>
              <p className={styles.category}>{getCategoryLabel(event.category)}</p>
              <p className={styles.date}>{new Date(event.date).toLocaleDateString()}</p>
              <p className={styles.location}>{event.location}</p>
              <p className={styles.participants}>
                Участники: {event.currentParticipants} / {event.maxParticipants}
              </p>
              <div className={styles.actions}>
                <button
                  onClick={() => handleJoinEvent(event.id)}
                  className={styles.joinButton}
                  disabled={event.currentParticipants >= event.maxParticipants}
                >
                  Присоединиться
                </button>
                {(user && (user.id === event.created_by || user.role === 'admin')) && (
                  <button
                    onClick={() => navigate(`/events/${event.id}/edit`)}
                    className={styles.updateButton}
                  >
                    Редактировать
                  </button>
                )}
                {user?.id === event.created_by && (
                  <button
                    onClick={() => handleDeleteEvent(event.id)}
                    className={styles.deleteButton}
                  >
                    Удалить
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Events; 