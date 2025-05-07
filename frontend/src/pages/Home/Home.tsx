import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { logoutUser } from '../../features/auth/authThunks';
import Button from '../../components/Button';
import styles from './Home.module.scss';

export const Home = () => {
  const user = useAppSelector(state => state.auth.user);
  const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated);
  const dispatch = useAppDispatch();

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  return (
    <div className={styles.homeContainer}>
      {/* Header */}
      <header className={styles.homeHeader}>
        <div className={styles.logo}>
          <h1>Event Manager</h1>
        </div>
        <nav className={styles.authNav}>
          {isAuthenticated ? (
            <div className={styles.userInfo}>
              <span>Welcome, {user?.name}</span>
              <Link to="/events">
                <Button>Events</Button>
              </Link>
              <Button variant="secondary" onClick={handleLogout}>Выйти</Button>
            </div>
          ) : (
            <div className={styles.authButtons}>
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
      <main className={styles.homeContent}>
        <section className={styles.heroSection}>
          <h2>Welcome to Event Manager</h2>
          <p>
            Event Manager is your all-in-one solution for organizing and managing events.
            Create, join, and manage events with ease. Whether you're planning a small
            gathering or a large conference, our platform has you covered.
          </p>
          
          {!isAuthenticated && (
            <div className={styles.ctaButtons}>
              <Link to="/auth/register">
                <Button variant="primary">Get Started</Button>
              </Link>
              <Link to="/events">
                <Button>Browse Events</Button>
              </Link>
            </div>
          )}
        </section>

        <section className={styles.featuresSection}>
          <h3>Key Features</h3>
          <div className={styles.featuresGrid}>
            <div className={styles.featureCard}>
              <h4>Create Events</h4>
              <p>Easily create and manage your own events with our intuitive interface.</p>
            </div>
            <div className={styles.featureCard}>
              <h4>Join Events</h4>
              <p>Discover and join events that interest you with just a few clicks.</p>
            </div>
            <div className={styles.featureCard}>
              <h4>Manage Participants</h4>
              <p>Keep track of event participants and manage attendance efficiently.</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}; 