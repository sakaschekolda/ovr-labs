import React, { useState } from 'react';
import styles from './EventCard.module.scss';
import Button from '../Button';
import ErrorNotification from '../ErrorNotification';

interface Creator {
  id: number;
  firstName: string;
  lastName: string;
  role: string;
}

export interface EventCardProps {
  id: number;
  title: string;
  description: string;
  date: string;
  category: string;
  currentParticipants?: number;
  maxParticipants?: number;
  creator?: Creator;
  created_by: number;
  userId?: number;
  userRole?: string;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
  onJoin?: (id: number) => void;
  disableJoin?: boolean;
}

const getCategoryLabel = (category: string) => {
  switch (category) {
    case 'concert': return 'Концерт';
    case 'lecture': return 'Лекция';
    case 'exhibition': return 'Выставка';
    case 'master class': return 'Мастер-класс';
    case 'sport': return 'Спорт';
    default: return category;
  }
};

const formatDateTime = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC'
  });
};

const EventCard: React.FC<EventCardProps> = ({
  id, title, description, date, category,
  creator, created_by,
  userId, userRole, onEdit, onDelete
}) => {
  const [showError, setShowError] = useState(false);
  const isOwner = userId === created_by;
  const isAdmin = userRole === 'admin';

  const handleJoinClick = () => {
    setShowError(true);
    setTimeout(() => setShowError(false), 3000);
  };

  return (
    <div className={styles.eventCard}>
      <div className={styles.eventContent}>
        <h3>{title}</h3>
        <p className={styles.eventCategory}>{getCategoryLabel(category)}</p>
        <p className={styles.eventDate}>{formatDateTime(date)}</p>
        <p className={styles.eventDescription}>{description}</p>
        {creator && (
          <p className={styles.eventCreator}><b>Организатор:</b> {creator.firstName} {creator.lastName} ({creator.role})</p>
        )}
      </div>
      <div className={styles.eventActions}>
        {!isOwner && (
          <Button onClick={handleJoinClick} variant="primary">Присоединиться</Button>
        )}
        {(isOwner || isAdmin) && onEdit && (
          <Button onClick={() => onEdit(id)} variant="secondary">Редактировать</Button>
        )}
        {(isOwner || isAdmin) && onDelete && (
          <Button onClick={() => onDelete(id)} variant="secondary">Удалить</Button>
        )}
      </div>
      {showError && (
        <ErrorNotification message="Нельзя присоединиться к мероприятию" />
      )}
    </div>
  );
};

export default EventCard; 