import { createSlice } from '@reduxjs/toolkit';
import { fetchEvents, joinEventThunk, deleteEventThunk } from './eventsThunks';

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  category: string;
  location: string;
  currentParticipants: number;
  maxParticipants: number;
}

interface EventsState {
  events: Event[];
  isLoading: boolean;
  isError: boolean;
  errorMessage: string | null;
}

const initialState: EventsState = {
  events: [],
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
        state.events = action.payload;
        state.isError = false;
        state.errorMessage = null;
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload as string || 'Ошибка загрузки событий';
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
      });
  },
});

export default eventsSlice.reducer; 