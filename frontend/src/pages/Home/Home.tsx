import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/Button';
import './Home.css';

export const Home = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="home-container">
      {/* Header */}
      <header className="home-header">
        <div className="logo">
          <h1>Event Manager</h1>
        </div>
        <nav className="auth-nav">
          {isAuthenticated ? (
            <div className="user-info">
              <span>Welcome, {user?.username}</span>
              <Link to="/events">
                <Button>Events</Button>
              </Link>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/auth/login">
                <Button>Login</Button>
              </Link>
              <Link to="/auth/register">
                <Button>Register</Button>
              </Link>
            </div>
          )}
        </nav>
      </header>

      {/* Main Content */}
      <main className="home-content">
        <section className="hero-section">
          <h2>Welcome to Event Manager</h2>
          <p>
            Event Manager is your all-in-one solution for organizing and managing events.
            Create, join, and manage events with ease. Whether you're planning a small
            gathering or a large conference, our platform has you covered.
          </p>
          
          {!isAuthenticated && (
            <div className="cta-buttons">
              <Link to="/auth/register">
                <Button variant="primary">Get Started</Button>
              </Link>
              <Link to="/events">
                <Button>Browse Events</Button>
              </Link>
            </div>
          )}
        </section>

        <section className="features-section">
          <h3>Key Features</h3>
          <div className="features-grid">
            <div className="feature-card">
              <h4>Create Events</h4>
              <p>Easily create and manage your own events with our intuitive interface.</p>
            </div>
            <div className="feature-card">
              <h4>Join Events</h4>
              <p>Discover and join events that interest you with just a few clicks.</p>
            </div>
            <div className="feature-card">
              <h4>Manage Participants</h4>
              <p>Keep track of event participants and manage attendance efficiently.</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}; 