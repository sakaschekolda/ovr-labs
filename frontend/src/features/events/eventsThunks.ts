import { createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../api/axios';

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