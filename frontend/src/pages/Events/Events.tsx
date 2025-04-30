import { useState, useEffect } from 'react';
import { useEvents } from '../../contexts/EventContext';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/Button';
import ErrorMessage from '../../components/ErrorMessage';

export const Events = () => {
  const { events, loading, error, createEvent, deleteEvent, joinEvent, leaveEvent } = useEvents();
  const { isAuthenticated, user } = useAuth();
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: '',
    location: ''
  });

  // Fetch events when component mounts and when authentication status changes
  useEffect(() => {
    if (isAuthenticated) {
      // Events are automatically fetched by the EventContext when authenticated
      console.log('Events loaded:', events);
    }
  }, [isAuthenticated, events]);

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createEvent(newEvent);
      setNewEvent({
        title: '',
        description: '',
        date: '',
        location: ''
      });
    } catch (err) {
      console.error('Failed to create event:', err);
    }
  };

  const handleJoinEvent = async (eventId: string) => {
    try {
      await joinEvent(eventId);
    } catch (err) {
      console.error('Failed to join event:', err);
    }
  };

  const handleLeaveEvent = async (eventId: string) => {
    try {
      await leaveEvent(eventId);
    } catch (err) {
      console.error('Failed to leave event:', err);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      await deleteEvent(eventId);
    } catch (err) {
      console.error('Failed to delete event:', err);
    }
  };

  if (!isAuthenticated) {
    return <ErrorMessage message="Please log in to view events" />;
  }

  if (loading) {
    return <div>Loading events...</div>;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div className="events-container">
      <h1>Events</h1>
      
      {/* Create Event Form */}
      <form onSubmit={handleCreateEvent} className="create-event-form">
        <input
          type="text"
          placeholder="Title"
          value={newEvent.title}
          onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
          required
        />
        <textarea
          placeholder="Description"
          value={newEvent.description}
          onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
          required
        />
        <input
          type="datetime-local"
          value={newEvent.date}
          onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="Location"
          value={newEvent.location}
          onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
          required
        />
        <Button type="submit">Create Event</Button>
      </form>

      {/* Events List */}
      <div className="events-list">
        {events.map((event) => (
          <div key={event.id} className="event-card">
            <h2>{event.title}</h2>
            <p>{event.description}</p>
            <p>Date: {new Date(event.date).toLocaleString()}</p>
            <p>Location: {event.location}</p>
            <p>Organizer: {event.organizer.username}</p>
            <p>Participants: {event.participants.length}</p>
            
            {/* Action Buttons */}
            <div className="event-actions">
              {event.organizer.id === user?.id ? (
                <Button onClick={() => handleDeleteEvent(event.id)}>Delete Event</Button>
              ) : event.participants.some(p => p.id === user?.id) ? (
                <Button onClick={() => handleLeaveEvent(event.id)}>Leave Event</Button>
              ) : (
                <Button onClick={() => handleJoinEvent(event.id)}>Join Event</Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 