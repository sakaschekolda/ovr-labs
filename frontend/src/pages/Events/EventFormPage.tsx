import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { RootState } from '../../app/store';
import { createEventThunk, updateEventThunk, fetchEvents, fetchUserEvents } from '../../features/events/eventsThunks';
import EventForm, { EventFormValues } from '../../components/EventForm/EventForm';

const EventFormPage = () => {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
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
      
      // Проверяем права на редактирование
      if (id && eventToEdit) {
        console.log('Editing event:', { id, eventToEdit, user });
        const eventCreatorId = Number(eventToEdit.created_by);
        const currentUserId = Number(user.id);
        if (eventCreatorId !== currentUserId && user.role !== 'admin') {
          throw new Error('У вас нет прав на редактирование этого мероприятия');
        }
      }

      // Преобразуем локальную дату в UTC
      const localDate = new Date(data.date);
      const utcDate = new Date(Date.UTC(
        localDate.getFullYear(),
        localDate.getMonth(),
        localDate.getDate(),
        localDate.getHours(),
        localDate.getMinutes()
      ));

      console.log('Submitting event data:', { ...data, date: utcDate.toISOString() });

      if (id) {
        const result = await dispatch(updateEventThunk({ id, ...data, date: utcDate.toISOString() })).unwrap();
        console.log('Event updated:', result);
        
        // Обновляем списки событий
        await Promise.all([
          dispatch(fetchEvents()),
          dispatch(fetchUserEvents())
        ]);
      } else {
        const result = await dispatch(createEventThunk({ ...data, date: utcDate.toISOString(), created_by: Number(user.id) })).unwrap();
        console.log('Event created:', result);
        
        // Обновляем списки событий
        await Promise.all([
          dispatch(fetchEvents()),
          dispatch(fetchUserEvents())
        ]);
      }

      // Определяем, откуда пришли
      const from = location.state?.from;
      if (from === '/profile') {
        navigate('/profile');
      } else {
        navigate('/events');
      }
    } catch (err: any) {
      console.error('Error saving event:', err);
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