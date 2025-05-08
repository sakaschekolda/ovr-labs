import { createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../api/axios';
import { EventFormValues } from '../../components/EventForm/EventForm';

export const fetchEvents = createAsyncThunk(
  'events/fetchEvents',
  async (_, thunkAPI) => {
    try {
      const response = await api.get('/api/events');
      console.log('Events response:', response.data);
      return response.data.data;
    } catch (error: any) {
      console.error('Error fetching events:', error);
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Ошибка загрузки событий');
    }
  }
);

export const fetchUserEvents = createAsyncThunk(
  'events/fetchUserEvents',
  async (_, thunkAPI) => {
    try {
      console.log('Fetching user events...');
      const response = await api.get(`/api/profile/events`);
      console.log('User events response:', response.data);
      // Ответ приходит в виде массива, а не объекта с полем data
      const result = Array.isArray(response.data) ? response.data : [];
      console.log('Returning result:', result);
      return result;
    } catch (error: any) {
      console.error('Error fetching user events:', error.response?.data || error);
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Ошибка загрузки событий пользователя');
    }
  }
);

export const joinEventThunk = createAsyncThunk(
  'events/joinEvent',
  async (eventId: string, thunkAPI) => {
    try {
      await api.post(`/api/events/${eventId}/join`);
      thunkAPI.dispatch(fetchEvents());
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Ошибка при присоединении к мероприятию');
    }
  }
);

export const deleteEventThunk = createAsyncThunk(
  'events/deleteEvent',
  async (eventId: string, thunkAPI) => {
    try {
      await api.delete(`/api/events/${eventId}`);
      // Обновляем оба списка событий
      await Promise.all([
        thunkAPI.dispatch(fetchEvents()),
        thunkAPI.dispatch(fetchUserEvents())
      ]);
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Ошибка при удалении мероприятия');
    }
  }
);

export const createEventThunk = createAsyncThunk(
  'events/createEvent',
  async (eventData: EventFormValues & { created_by: number }, thunkAPI) => {
    try {
      const response = await api.post('/api/events', eventData);
      // Обновляем оба списка событий
      await Promise.all([
        thunkAPI.dispatch(fetchEvents()),
        thunkAPI.dispatch(fetchUserEvents())
      ]);
      return response.data.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Ошибка создания мероприятия');
    }
  }
);

export const updateEventThunk = createAsyncThunk(
  'events/updateEvent',
  async (payload: { id: string; } & EventFormValues, thunkAPI) => {
    const { id, ...eventData } = payload;
    try {
      console.log('Updating event with data:', { id, ...eventData });
      const response = await api.put(`/api/events/${id}`, eventData);
      console.log('Update response:', response.data);
      
      // Обновляем оба списка событий
      await Promise.all([
        thunkAPI.dispatch(fetchEvents()),
        thunkAPI.dispatch(fetchUserEvents())
      ]);
      
      // Возвращаем обновленное событие
      return response.data.data;
    } catch (error: any) {
      console.error('Error updating event:', error.response?.data || error);
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Ошибка обновления мероприятия'
      );
    }
  }
); 