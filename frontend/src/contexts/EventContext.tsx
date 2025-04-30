import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { eventService, Event, CreateEventData, UpdateEventData } from '../api/eventService';
import { useAuth } from './AuthContext';

interface EventContextType {
  events: Event[];
  loading: boolean;
  error: string | null;
  createEvent: (data: CreateEventData) => Promise<void>;
  updateEvent: (id: string, data: UpdateEventData) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  joinEvent: (id: string) => Promise<void>;
  leaveEvent: (id: string) => Promise<void>;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export const EventProvider = ({ children }: { children: ReactNode }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      fetchEvents();
    }
  }, [isAuthenticated]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await eventService.getEvents();
      setEvents(data);
    } catch (err) {
      setError('Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  const createEvent = async (data: CreateEventData) => {
    try {
      const newEvent = await eventService.createEvent(data);
      setEvents([...events, newEvent]);
    } catch (err) {
      setError('Failed to create event');
    }
  };

  const updateEvent = async (id: string, data: UpdateEventData) => {
    try {
      const updatedEvent = await eventService.updateEvent(id, data);
      setEvents(events.map(event => event.id === id ? updatedEvent : event));
    } catch (err) {
      setError('Failed to update event');
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      await eventService.deleteEvent(id);
      setEvents(events.filter(event => event.id !== id));
    } catch (err) {
      setError('Failed to delete event');
    }
  };

  const joinEvent = async (id: string) => {
    try {
      const updatedEvent = await eventService.joinEvent(id);
      setEvents(events.map(event => event.id === id ? updatedEvent : event));
    } catch (err) {
      setError('Failed to join event');
    }
  };

  const leaveEvent = async (id: string) => {
    try {
      const updatedEvent = await eventService.leaveEvent(id);
      setEvents(events.map(event => event.id === id ? updatedEvent : event));
    } catch (err) {
      setError('Failed to leave event');
    }
  };

  return (
    <EventContext.Provider
      value={{
        events,
        loading,
        error,
        createEvent,
        updateEvent,
        deleteEvent,
        joinEvent,
        leaveEvent,
      }}
    >
      {children}
    </EventContext.Provider>
  );
};

export const useEvents = () => {
  const context = useContext(EventContext);
  if (context === undefined) {
    throw new Error('useEvents must be used within an EventProvider');
  }
  return context;
}; 