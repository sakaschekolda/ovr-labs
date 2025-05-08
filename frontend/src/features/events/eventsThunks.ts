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
      const response = await api.get(`/api/profile/events`);
      return response.data.data;
    } catch (error: any) {
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
      thunkAPI.dispatch(fetchEvents());
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Ошибка при удалении мероприятия');
    }
  }
);

export const createEventThunk = createAsyncThunk(
  'events/createEvent',
  async (eventData: EventFormValues & { created_by: string }, thunkAPI) => {
    try {
      const response = await api.post('/api/events', eventData);
      thunkAPI.dispatch(fetchEvents());
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
      const response = await api.put(`/api/events/${id}`, eventData);
      thunkAPI.dispatch(fetchEvents());
      return response.data.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Ошибка обновления мероприятия');
    }
  }
); 