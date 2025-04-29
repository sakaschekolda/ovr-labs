import React, { useEffect, useState } from 'react';
import { api } from '../../api/config';
import Button from '../../components/Button';
import './styles.css';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
}

const Events: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await api.get('/events');
        setEvents(response.data);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (loading) {
    return <div>Загрузка...</div>;
  }

  return (
    <div className="events-container">
      <h1>Мероприятия</h1>
      <div className="events-grid">
        {events.map((event) => (
          <div key={event.id} className="event-card">
            <h2>{event.title}</h2>
            <p>{event.description}</p>
            <div className="event-details">
              <span>Дата: {new Date(event.date).toLocaleDateString()}</span>
              <span>Место: {event.location}</span>
            </div>
            <Button>Подробнее</Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Events; 