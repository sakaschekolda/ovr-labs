import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { RootState } from '../../app/store';
import { createEventThunk, updateEventThunk, fetchEvents } from '../../features/events/eventsThunks';
import EventForm, { EventFormValues } from '../../components/EventForm/EventForm';

const EventFormPage = () => {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { events, isLoading } = useAppSelector((state: RootState) => state.events);
  const { user, isAuthenticated } = useAppSelector((state: RootState) => state.auth);
  const [error, setError] = useState<string | null>(null);

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
      // Если не найдено событие для редактирования
      navigate('/events');
    }
  }, [id, eventToEdit, events.length, navigate]);

  const handleSubmit = async (data: EventFormValues) => {
    setError(null);
    try {
      if (!user) throw new Error('Не авторизован');
      if (id) {
        await dispatch(updateEventThunk({ id, ...data })).unwrap();
      } else {
        await dispatch(createEventThunk({ ...data, created_by: user.id })).unwrap();
      }
      navigate('/events');
    } catch (err: any) {
      setError(err?.message || 'Ошибка сохранения');
    }
  };

  return (
    <div style={{ padding: '32px 0' }}>
      <h1 style={{ textAlign: 'center', marginBottom: 24 }}>{id ? 'Редактирование' : 'Создание'} мероприятия</h1>
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