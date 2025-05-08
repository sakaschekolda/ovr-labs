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
  location: string;
  maxParticipants: number;
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
  location: yup.string().required('Локация обязательна').max(200, 'Максимум 200 символов'),
  maxParticipants: yup.number().required('Укажите максимальное число участников').min(1, 'Минимум 1').max(10000, 'Максимум 10000'),
  // image: yup.mixed().notRequired(),
});

interface Props {
  event?: Partial<EventFormValues>;
  onSubmit: (data: EventFormValues) => void;
  isLoading?: boolean;
  error?: string | null;
}

const EventForm = ({ event, onSubmit, isLoading, error }: Props) => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<EventFormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      title: '',
      description: '',
      date: new Date().toISOString().slice(0, 16),
      category: '',
      location: '',
      maxParticipants: 1,
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
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
      <div className={styles.formGroup}>
        <label>Название</label>
        <input {...register('title')} />
        {errors.title && <span className={styles.error}>{errors.title.message}</span>}
      </div>
      <div className={styles.formGroup}>
        <label>Описание</label>
        <textarea {...register('description')} />
        {errors.description && <span className={styles.error}>{errors.description.message}</span>}
      </div>
      <div className={styles.formGroup}>
        <label>Дата</label>
        <input type="datetime-local" {...register('date')} />
        {errors.date && <span className={styles.error}>{errors.date.message}</span>}
      </div>
      <div className={styles.formGroup}>
        <label>Категория</label>
        <select {...register('category')}>
          <option value="">Выберите категорию</option>
          {categories.map(cat => (
            <option key={cat.value} value={cat.value}>{cat.label}</option>
          ))}
        </select>
        {errors.category && <span className={styles.error}>{errors.category.message}</span>}
      </div>
      <div className={styles.formGroup}>
        <label>Локация</label>
        <input {...register('location')} />
        {errors.location && <span className={styles.error}>{errors.location.message}</span>}
      </div>
      <div className={styles.formGroup}>
        <label>Максимальное число участников</label>
        <input type="number" {...register('maxParticipants')} min={1} max={10000} />
        {errors.maxParticipants && <span className={styles.error}>{errors.maxParticipants.message}</span>}
      </div>
      {/* <div className={styles.formGroup}>
        <label>Картинка (опционально)</label>
        <input type="file" {...register('image')} />
      </div> */}
      {error && <div className={styles.error}>{error}</div>}
      <button type="submit" disabled={isLoading}>{isLoading ? 'Сохраняем...' : 'Сохранить'}</button>
    </form>
  );
};

export default EventForm; 