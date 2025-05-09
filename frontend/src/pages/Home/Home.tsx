import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { logoutUser } from '../../features/auth/authThunks';
import Button from '../../components/Button';
import styles from './Home.module.scss';

export const Home = () => {
  const user = useAppSelector(state => state.auth.user);
  const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  const handleBrowseEvents = () => {
    if (isAuthenticated) {
      navigate('/events');
    } else {
      navigate('/auth/login', { state: { from: { pathname: '/events' } } });
    }
  };

  return (
    <div className={styles.homeContainer}>
      {/* Header */}
      <header className={styles.homeHeader}>
        <div className={styles.logo}>
          <h1>EventHub</h1>
        </div>
        <nav className={styles.authNav}>
          {isAuthenticated ? (
            <div className={styles.userInfo}>
              <span>Добро пожаловать, {user?.firstName} {user?.lastName}</span>
              <Button variant="secondary" onClick={() => navigate('/profile')}>
                Профиль
              </Button>
              <Button variant="secondary" onClick={handleLogout}>
                Выйти
              </Button>
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
          <h2>EventHub</h2>
          <p>
            EventHub - полноценное решение для организации и управления мероприятиями.
          </p>
          
          <div className={styles.ctaButtons}>
            <Button onClick={handleBrowseEvents}>Посмотреть мероприятия</Button>
          </div>
        </section>

        <section className={styles.featuresSection}>
          <h3>Ключевые функции</h3>
          <div className={styles.featuresGrid}>
            <div className={styles.featureCard}>
              <h4>Создание мероприятия</h4>
              <p>Легко создавайте и управляйте своими мероприятиями.</p>
            </div>
            <div className={styles.featureCard}>
              <h4>Присоединяйтесь к мероприятиям</h4>
              <p>Находите и присоединяйтесь к мероприятиям по вашим интересам в пару кликов.</p>
            </div>
            <div className={styles.featureCard}>
              <h4>Управляйте участниками</h4>
              <p>Отслеживайте участников мероприятия и эффективно управляйте посещаемостью.</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}; 