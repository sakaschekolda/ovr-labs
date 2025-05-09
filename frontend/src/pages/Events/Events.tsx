import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { RootState } from '../../app/store';
import { fetchEvents, deleteEventThunk } from '../../features/events/eventsThunks';
import { logoutUser } from '../../features/auth/authThunks';
import EventCard from '../../components/EventCard/EventCard';
import ConfirmModal from '../../components/ConfirmModal/ConfirmModal';
import Button from '../../components/Button';
import styles from './Events.module.scss';
import ErrorNotification from '../../components/ErrorNotification';

const eventCategories = [
  { value: 'concert', label: 'Концерт' },
  { value: 'lecture', label: 'Лекция' },
  { value: 'exhibition', label: 'Выставка' },
  { value: 'master class', label: 'Мастер-класс' },
  { value: 'sport', label: 'Спорт' },
];

const Events: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { events, isLoading } = useAppSelector((state: RootState) => state.events);
  const { user, isAuthenticated } = useAppSelector((state: RootState) => state.auth);
  const [eventToDelete, setEventToDelete] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const isError = useAppSelector((state: RootState) => state.events.isError);
  const errorMessage = useAppSelector((state: RootState) => state.events.errorMessage);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth/login');
      return;
    }
    dispatch(fetchEvents());
  }, [dispatch, isAuthenticated, navigate]);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/');
  };

  const handleEditEvent = (id: number) => {
    navigate(`/events/${id}/edit`);
  };

  const handleDeleteEvent = async () => {
    if (eventToDelete) {
      try {
        await dispatch(deleteEventThunk(String(eventToDelete))).unwrap();
        setEventToDelete(null);
        dispatch(fetchEvents());
      } catch (error) {
        console.error('Ошибка при удалении:', error);
      }
    }
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
  };

  const categories = ['all', ...eventCategories.map(c => c.value)];
  const getCategoryLabel = (category: string) => {
    if (category === 'all') return 'Все категории';
    const found = eventCategories.find(c => c.value === category);
    return found ? found.label : category;
  };

  const filteredEvents = selectedCategory === 'all'
    ? events
    : events.filter(event => event.category === selectedCategory);

  if (isLoading) return <div className={styles.loading}>Загрузка...</div>;
  if (isError) {
    return (
      <>
        <ErrorNotification
          message={errorMessage || 'Неизвестная ошибка'}
          onClose={() => {}}
          duration={5000}
        />
        <div className={styles.eventsContainer}>
          <h1>Мероприятия</h1>
          <div className={styles.categoryFilter}>
            <select value={selectedCategory} onChange={handleCategoryChange}>
              {categories.map(category => (
                <option key={category} value={category}>
                  {getCategoryLabel(category)}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.eventsList}>
            {filteredEvents.map(event => (
              <EventCard
                key={event.id}
                {...event}
                userId={user?.id ? Number(user.id) : undefined}
                userRole={user?.role}
                onEdit={handleEditEvent}
                onDelete={(id: number) => setEventToDelete(id)}
              />
            ))}
          </div>
        </div>
      </>
    );
  }

  return (
    <div className={styles.eventsPage}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.logo} onClick={() => navigate('/')}>
            <h1>EventHub</h1>
          </div>
          <nav className={styles.authNav}>
            {isAuthenticated && user && (
              <div className={styles.userInfo}>
                <div className={styles.userWelcome}>
                  <span className={styles.userName}>
                    Добро пожаловать, {user.firstName} {user.lastName}
                  </span>
                  <span className={styles.userRole}>
                    {user.role === 'admin' ? 'Администратор' : 'Пользователь'}
                  </span>
                </div>
                <div className={styles.userActions}>
                  <Button variant="secondary" onClick={() => navigate('/profile', { state: { from: '/events' } })}>
                    Профиль
                  </Button>
                  <Button variant="secondary" onClick={handleLogout}>
                    Выйти
                  </Button>
                </div>
              </div>
            )}
          </nav>
        </div>
      </header>

      <div className={styles.eventsContent}>
        {user && (
          <div className={styles.createEventContainer}>
            <Button onClick={() => navigate('/events/create')}>
              Создать мероприятие
            </Button>
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
                {getCategoryLabel(category)}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.eventsGrid}>
          {filteredEvents.map(event => (
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
              onEdit={handleEditEvent}
              onDelete={() => setEventToDelete(Number(event.id))}
            />
          ))}
        </div>

        <ConfirmModal
          isOpen={!!eventToDelete}
          onConfirm={handleDeleteEvent}
          onCancel={() => setEventToDelete(null)}
          title="Подтверждение удаления"
          message="Вы уверены, что хотите удалить мероприятие?"
        />
      </div>
    </div>
  );
};

export default Events; 