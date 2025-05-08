import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import styles from './EventForm.module.scss';
import { useEffect } from 'react';

export interface EventFormValues {
  title: string;
  description: string;
  date: string;
  category: string;
  // image?: FileList;
}

const categories = [
  { value: 'concert', label: 'Концерт' },
  { value: 'lecture', label: 'Лекция' },
  { value: 'exhibition', label: 'Выставка' },
  { value: 'master class', label: 'Мастер-класс' },
  { value: 'sport', label: 'Спорт' },
];

const schema = yup.object({
  title: yup.string().required('Название обязательно').min(3, 'Минимум 3 символа').max(100, 'Максимум 100 символов'),
  description: yup.string().required('Описание обязательно').max(2000, 'Максимум 2000 символов'),
  date: yup.string()
    .required('Дата обязательна')
    .test('is-future', 'Дата не может быть в прошлом', (value: string | undefined) => {
      if (!value) return false;
      return new Date(value) >= new Date(new Date().toDateString());
    }),
  category: yup.string().required('Категория обязательна'),
  // image: yup.mixed().notRequired(),
});

interface Props {
  event?: Partial<EventFormValues>;
  onSubmit: (data: EventFormValues) => void;
  isLoading?: boolean;
  error?: string | null;
}

const EventForm: React.FC<Props> = ({ event, onSubmit, isLoading, error }) => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<EventFormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      title: '',
      description: '',
      date: new Date().toISOString().slice(0, 16),
      category: '',
      ...event,
    },
  });

  useEffect(() => {
    if (event) {
      reset({
        ...event,
        date: event.date ? event.date.slice(0, 16) : new Date().toISOString().slice(0, 16),
      });
    }
  }, [event, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
      <div className={styles.formGroup}>
        <label htmlFor="title">Название</label>
        <input
          id="title"
          type="text"
          {...register('title', { required: 'Обязательное поле' })}
        />
        {errors.title && <span className={styles.error}>{errors.title.message}</span>}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="description">Описание</label>
        <textarea
          id="description"
          {...register('description', { required: 'Обязательное поле' })}
        />
        {errors.description && <span className={styles.error}>{errors.description.message}</span>}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="date">Дата и время</label>
        <input
          id="date"
          type="datetime-local"
          {...register('date', { required: 'Обязательное поле' })}
        />
        {errors.date && <span className={styles.error}>{errors.date.message}</span>}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="category">Категория</label>
        <select
          id="category"
          {...register('category', { required: 'Обязательное поле' })}
        >
          <option value="">Выберите категорию</option>
          {categories.map(cat => (
            <option key={cat.value} value={cat.value}>{cat.label}</option>
          ))}
        </select>
        {errors.category && <span className={styles.error}>{errors.category.message}</span>}
      </div>

      {error && <div className={styles.error}>{error}</div>}
      <button type="submit" disabled={isLoading}>{isLoading ? 'Сохранение...' : 'Сохранить'}</button>
    </form>
  );
};

export default EventForm; 