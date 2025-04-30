import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { eventService, Event } from '../../api/eventService';
import './styles.css';

const Events: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const data = await eventService.getAllEvents();
      setEvents(data);
    } catch (err) {
      setError('Ошибка при загрузке мероприятий');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinEvent = async (eventId: string) => {
    try {
      await eventService.joinEvent(eventId);
      fetchEvents();
    } catch (err) {
      setError('Ошибка при присоединении к мероприятию');
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      await eventService.deleteEvent(eventId);
      fetchEvents();
    } catch (err) {
      setError('Ошибка при удалении мероприятия');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (loading) return <div className="loading">Загрузка...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="events-page">
      <header className="header">
        <div className="header-content">
          <Link to="/" className="logo">
            <h1>EventHub</h1>
          </Link>
          <div className="auth-buttons">
            {isAuthenticated ? (
              <div className="user-section">
                <div className="user-info">
                  <span className="user-greeting">Добро пожаловать, {user?.name}</span>
                  <span className="user-role">{user?.role}</span>
                </div>
                <button onClick={handleLogout} className="logout-button">Выйти</button>
              </div>
            ) : (
              <>
                <Link to="/auth/login" className="login-button">Войти</Link>
                <Link to="/auth/register" className="register-button">Регистрация</Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="main-content">
        <div className="events-header">
          <h2 className="events-title">Мероприятия</h2>
          {user?.role === 'admin' && (
            <div className="create-event-container">
              <Link to="/events/create" className="create-button">Создать мероприятие</Link>
            </div>
          )}
        </div>

        <div className="events-grid">
          {events.map(event => (
            <div key={event.id} className="event-card">
              <div className="event-content">
                <h3>{event.title}</h3>
                <p className="event-date">{new Date(event.date).toLocaleDateString()}</p>
                <p className="event-description">{event.description}</p>
                <p className="event-location">{event.location}</p>
                <p className="event-participants">
                  Участников: {event.currentParticipants} / {event.maxParticipants}
                </p>
              </div>
              <div className="event-actions">
                {isAuthenticated && (
                  <button
                    onClick={() => handleJoinEvent(event.id)}
                    className="join-button"
                    disabled={event.currentParticipants >= event.maxParticipants}
                  >
                    Присоединиться
                  </button>
                )}
                {user?.role === 'admin' && (
                  <div className="admin-actions">
                    <button
                      onClick={() => navigate(`/events/${event.id}/edit`)}
                      className="update-button"
                    >
                      Редактировать
                    </button>
                    <button
                      onClick={() => handleDeleteEvent(event.id)}
                      className="delete-button"
                    >
                      Удалить
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Events; 