import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { RootState } from '../../app/store';
import { createEventThunk, updateEventThunk, fetchEvents, fetchUserEvents } from '../../features/events/eventsThunks';
import EventForm, { EventFormValues } from '../../components/EventForm/EventForm';
import ErrorNotification from '../../components/ErrorNotification';
import styles from './EventFormPage.module.scss';

const EventFormPage = () => {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { events, isLoading } = useAppSelector((state: RootState) => state.events);
  const { user, isAuthenticated } = useAppSelector((state: RootState) => state.auth);
  const [error, setError] = useState<string | null>(null);
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth/login');
      return;
    }
    if (events.length === 0) {
      dispatch(fetchEvents());
    }
  }, [isAuthenticated, navigate, dispatch, events.length]);

  const eventToEdit = useMemo(() => {
    if (!id) return undefined;
    return events.find(e => String(e.id) === String(id));
  }, [id, events]);

  useEffect(() => {
    if (id && !eventToEdit && events.length > 0) {
      navigate('/events');
    }
  }, [id, eventToEdit, events.length, navigate]);

  const handleSubmit = async (data: EventFormValues) => {
    setError(null);
    setShowError(false);
    try {
      if (!user) throw new Error('Не авторизован');
      
      if (id && eventToEdit) {
        const eventCreatorId = Number(eventToEdit.created_by);
        const currentUserId = Number(user.id);
        if (eventCreatorId !== currentUserId && user.role !== 'admin') {
          throw new Error('У вас нет прав на редактирование этого мероприятия');
        }
      }

      const localDate = new Date(data.date);
      const utcDate = new Date(Date.UTC(
        localDate.getFullYear(),
        localDate.getMonth(),
        localDate.getDate(),
        localDate.getHours(),
        localDate.getMinutes()
      ));

      if (id) {
        await dispatch(updateEventThunk({ id, ...data, date: utcDate.toISOString() })).unwrap();
        await Promise.all([
          dispatch(fetchEvents()),
          dispatch(fetchUserEvents())
        ]);
      } else {
        await dispatch(createEventThunk({ ...data, date: utcDate.toISOString(), created_by: Number(user.id) })).unwrap();
        await Promise.all([
          dispatch(fetchEvents()),
          dispatch(fetchUserEvents())
        ]);
      }

      const from = location.state?.from;
      if (from === '/profile') {
        navigate('/profile');
      } else {
        navigate('/events');
      }
    } catch (err: any) {
      console.error('Error saving event:', err);
      setError(err?.message || 'Ошибка сохранения');
      setShowError(true);
    }
  };

  return (
    <div className={styles.container}>
      {showError && (
        <ErrorNotification
          message={error || 'Неизвестная ошибка'}
          onClose={() => { setShowError(false); setError(null); }}
          duration={5000}
        />
      )}
      <h1 className={styles.title}>{id ? 'Редактирование' : 'Создание'} мероприятия</h1>
      <EventForm
        event={eventToEdit}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        error={error}
      />
    </div>
  );
};

export default EventFormPage; 