import { api } from './config';

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  maxParticipants: number;
  currentParticipants: number;
}

interface ApiResponse<T> {
  data: T;
}

export interface CreateEventData {
  title: string;
  description: string;
  date: string;
  location: string;
  maxParticipants: number;
}

export interface UpdateEventData extends Partial<CreateEventData> {}

export const eventService = {
  async getAllEvents(): Promise<Event[]> {
    try {
      const response = await api.get<ApiResponse<Event[]>>('/api/events');
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching events:', error);
      throw new Error('Не удалось загрузить мероприятия');
    }
  },

  async getEventById(id: string): Promise<Event> {
    try {
      const response = await api.get<ApiResponse<Event>>(`/api/events/${id}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching event ${id}:`, error);
      throw new Error('Не удалось загрузить мероприятие');
    }
  },

  async createEvent(data: CreateEventData): Promise<Event> {
    try {
      const response = await api.post<ApiResponse<Event>>('/api/events', data);
      return response.data.data;
    } catch (error) {
      console.error('Error creating event:', error);
      throw new Error('Не удалось создать мероприятие');
    }
  },

  async updateEvent(id: string, data: UpdateEventData): Promise<Event> {
    try {
      const response = await api.put<ApiResponse<Event>>(`/api/events/${id}`, data);
      return response.data.data;
    } catch (error) {
      console.error(`Error updating event ${id}:`, error);
      throw new Error('Не удалось обновить мероприятие');
    }
  },

  async deleteEvent(id: string): Promise<void> {
    try {
      await api.delete(`/api/events/${id}`);
    } catch (error) {
      console.error(`Error deleting event ${id}:`, error);
      throw new Error('Не удалось удалить мероприятие');
    }
  },

  async joinEvent(eventId: string): Promise<void> {
    try {
      await api.post(`/api/events/${eventId}/join`);
    } catch (error) {
      console.error(`Error joining event ${eventId}:`, error);
      throw new Error('Не удалось записаться на мероприятие');
    }
  },

  async leaveEvent(id: string): Promise<Event> {
    try {
      const response = await api.post<ApiResponse<Event>>(`/api/events/${id}/leave`);
      return response.data.data;
    } catch (error) {
      console.error(`Error leaving event ${id}:`, error);
      throw new Error('Не удалось отменить запись на мероприятие');
    }
  },
}; 