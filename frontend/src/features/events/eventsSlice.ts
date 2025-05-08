import { createSlice } from '@reduxjs/toolkit';
import { fetchEvents, fetchUserEvents, joinEventThunk, deleteEventThunk, createEventThunk, updateEventThunk } from './eventsThunks';

export interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  category: string;
  created_by: number;
  created_at: string;
  creator?: {
    id: number;
    name: string;
    role: string;
  };
}

interface EventsState {
  events: Event[];
  userEvents: Event[];
  isLoading: boolean;
  isError: boolean;
  errorMessage: string | null;
}

const initialState: EventsState = {
  events: [],
  userEvents: [],
  isLoading: false,
  isError: false,
  errorMessage: null,
};

const eventsSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchEvents.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.errorMessage = null;
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.isLoading = false;
        state.events = Array.isArray(action.payload) ? action.payload : [];
        state.isError = false;
        state.errorMessage = null;
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload as string || 'Ошибка загрузки событий';
      })
      .addCase(fetchUserEvents.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.errorMessage = null;
      })
      .addCase(fetchUserEvents.fulfilled, (state, action) => {
        console.log('eventsSlice: fetchUserEvents.fulfilled, payload:', action.payload);
        state.isLoading = false;
        state.userEvents = Array.isArray(action.payload) ? action.payload : [];
        console.log('eventsSlice: state.userEvents after update:', state.userEvents);
        state.isError = false;
        state.errorMessage = null;
      })
      .addCase(fetchUserEvents.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload as string || 'Ошибка загрузки событий пользователя';
      })
      .addCase(joinEventThunk.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.errorMessage = null;
      })
      .addCase(joinEventThunk.fulfilled, (state) => {
        state.isLoading = false;
        state.isError = false;
        state.errorMessage = null;
      })
      .addCase(joinEventThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload as string || 'Ошибка при присоединении к мероприятию';
      })
      .addCase(deleteEventThunk.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.errorMessage = null;
      })
      .addCase(deleteEventThunk.fulfilled, (state) => {
        state.isLoading = false;
        state.isError = false;
        state.errorMessage = null;
      })
      .addCase(deleteEventThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload as string || 'Ошибка при удалении мероприятия';
      })
      .addCase(createEventThunk.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.errorMessage = null;
      })
      .addCase(createEventThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.events = [...state.events, action.payload];
        state.userEvents = [...state.userEvents, action.payload];
        state.isError = false;
        state.errorMessage = null;
      })
      .addCase(createEventThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload as string || 'Ошибка создания мероприятия';
      })
      .addCase(updateEventThunk.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.errorMessage = null;
      })
      .addCase(updateEventThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          state.events = state.events.map(event => 
            event.id === action.payload.id ? action.payload : event
          );
          state.userEvents = state.userEvents.map(event => 
            event.id === action.payload.id ? action.payload : event
          );
        }
        state.isError = false;
        state.errorMessage = null;
      })
      .addCase(updateEventThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload as string || 'Ошибка обновления мероприятия';
      });
  },
});

export default eventsSlice.reducer; 