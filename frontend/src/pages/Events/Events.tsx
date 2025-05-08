import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { RootState } from '../../app/store';
import { fetchEvents, deleteEventThunk } from '../../features/events/eventsThunks';
import styles from './Events.module.scss';
import ErrorNotification from '../../components/ErrorNotification';
import { useNavigate } from 'react-router-dom';
import EventCard from '../../components/EventCard/EventCard';
import ConfirmModal from '../../components/ConfirmModal/ConfirmModal';

const Events: React.FC = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state: RootState) => state.auth.user);
  const events = useAppSelector((state: RootState) => state.events.events) || [];
  const isLoading = useAppSelector((state: RootState) => state.events.isLoading);
  const isError = useAppSelector((state: RootState) => state.events.isError);
  const errorMessage = useAppSelector((state: RootState) => state.events.errorMessage);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const navigate = useNavigate();
  const [eventToDelete, setEventToDelete] = useState<number | null>(null);

  const categories = ['all', 'concert', 'lecture', 'exhibition', 'master class', 'sport'];

  React.useEffect(() => {
    dispatch(fetchEvents());
  }, [dispatch]);

  const filteredEvents = React.useMemo(() => {
    if (!Array.isArray(events)) return [];
    if (selectedCategory === 'all') return events;
    return events.filter(event => event.category === selectedCategory);
  }, [selectedCategory, events]);

  const handleDeleteEvent = async () => {
    if (eventToDelete) {
      try {
        await dispatch(deleteEventThunk(String(eventToDelete))).unwrap();
        setEventToDelete(null);
      } catch (error) {
        console.error('Ошибка при удалении:', error);
      }
    }
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

  const handleEditEvent = (eventId: number) => {
    console.log('Editing event:', eventId);
    navigate(`/events/${eventId}/edit`, { state: { from: '/events' } });
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