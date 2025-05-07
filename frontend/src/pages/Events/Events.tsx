import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { logoutUser } from '../../features/auth/authThunks';
import { fetchEvents, joinEventThunk, deleteEventThunk } from '../../features/events/eventsThunks';
import styles from './Events.module.scss';

const Events: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector(state => state.auth.user);
  const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated);
  const events = useAppSelector(state => state.events.events);
  const isLoading = useAppSelector(state => state.events.isLoading);
  const isError = useAppSelector(state => state.events.isError);
  const errorMessage = useAppSelector(state => state.events.errorMessage);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = ['all', 'concert', 'lecture', 'exhibition', 'master class', 'sport'];

  React.useEffect(() => {
    dispatch(fetchEvents());
  }, [dispatch]);

  const filteredEvents = React.useMemo(() => {
    if (selectedCategory === 'all') return events;
    return events.filter(event => event.category === selectedCategory);
  }, [selectedCategory, events]);

  const handleJoinEvent = (eventId: string) => {
    dispatch(joinEventThunk(eventId));
  };

  const handleDeleteEvent = (eventId: string) => {
    dispatch(deleteEventThunk(eventId));
  };

  const handleLogout = () => {
    dispatch(logoutUser());
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
  if (isError) return <div className={styles.error}>{errorMessage}</div>;

  return (
    <div className={styles.eventsPage}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <Link to="/" className={styles.logo}>
            <h1>EventHub</h1>
          </Link>
          <div className={styles.authButtons}>
            {isAuthenticated ? (
              <div className={styles.userSection}>
                <div className={styles.userInfo}>
                  <span className={styles.userGreeting}>Добро пожаловать, {user?.name}</span>
                  <span className={styles.userRole}>{user?.role}</span>
                </div>
                <button onClick={handleLogout} className={styles.logoutButton}>Выйти</button>
              </div>
            ) : (
              <>
                <Link to="/auth/login" className={styles.loginButton}>Войти</Link>
                <Link to="/auth/register" className={styles.registerButton}>Регистрация</Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className={styles.mainContent}>
        <div className={styles.eventsHeader}>
          <h2 className={styles.eventsTitle}>Мероприятия</h2>
          {user?.role === 'admin' && (
            <div className={styles.createEventContainer}>
              <Link to="/events/create" className={styles.createButton}>Создать мероприятие</Link>
            </div>
          )}
        </div>

        <div className={styles.categoryFilter}>
          <label htmlFor="category-select">Категория:</label>
          <select
            id="category-select"
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
              <div className={styles.eventContent}>
                <h3>{event.title}</h3>
                <p className={styles.eventCategory}>{getCategoryLabel(event.category)}</p>
                <p className={styles.eventDate}>{new Date(event.date).toLocaleDateString()}</p>
                <p className={styles.eventLocation}>{event.location}</p>
                <p className={styles.eventParticipants}>
                  Участников: {event.currentParticipants} / {event.maxParticipants}
                </p>
              </div>
              <div className={styles.eventActions}>
                {isAuthenticated && (
                  <button
                    onClick={() => handleJoinEvent(event.id)}
                    className={styles.joinButton}
                    disabled={event.currentParticipants >= event.maxParticipants}
                  >
                    Присоединиться
                  </button>
                )}
                {user?.role === 'admin' && (
                  <div className={styles.adminActions}>
                    <button
                      onClick={() => navigate(`/events/${event.id}/edit`)}
                      className={styles.updateButton}
                    >
                      Редактировать
                    </button>
                    <button
                      onClick={() => handleDeleteEvent(event.id)}
                      className={styles.deleteButton}
                    >
                      Удалить
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Events; 