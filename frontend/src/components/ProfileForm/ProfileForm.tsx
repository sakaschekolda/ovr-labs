import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { User } from '../../types';
import styles from './ProfileForm.module.scss';

interface ProfileFormValues {
  firstName: string;
  lastName: string;
  middleName: string;
  gender: 'male' | 'female' | 'other';
  birthDate: string;
}

interface Props {
  user: User;
  onSubmit: (data: ProfileFormValues) => void;
  isLoading: boolean;
  error: string | null;
}

const schema = yup.object().shape({
  firstName: yup.string().required('Имя обязательно'),
  lastName: yup.string().required('Фамилия обязательна'),
  middleName: yup.string().required('Отчество обязательно'),
  gender: yup.string().oneOf(['male', 'female', 'other'], 'Выберите пол').required('Пол обязателен'),
  birthDate: yup.string().required('Дата рождения обязательна')
});

const ProfileForm: React.FC<Props> = ({ user, onSubmit, isLoading, error }) => {
  const { register, handleSubmit, formState: { errors } } = useForm<ProfileFormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      firstName: user.firstName,
      lastName: user.lastName,
      middleName: user.middleName,
      gender: user.gender,
      birthDate: user.birthDate
    }
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
      {error && <div className={styles.error}>{error}</div>}
      
      <div className={styles.formGroup}>
        <label htmlFor="firstName">Имя</label>
        <input
          id="firstName"
          type="text"
          {...register('firstName')}
        />
        {errors.firstName && <span className={styles.error}>{errors.firstName.message}</span>}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="lastName">Фамилия</label>
        <input
          id="lastName"
          type="text"
          {...register('lastName')}
        />
        {errors.lastName && <span className={styles.error}>{errors.lastName.message}</span>}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="middleName">Отчество</label>
        <input
          id="middleName"
          type="text"
          {...register('middleName')}
        />
        {errors.middleName && <span className={styles.error}>{errors.middleName.message}</span>}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="gender">Пол</label>
        <select
          id="gender"
          {...register('gender')}
        >
          <option value="male">Мужской</option>
          <option value="female">Женский</option>
          <option value="other">Другой</option>
        </select>
        {errors.gender && <span className={styles.error}>{errors.gender.message}</span>}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="birthDate">Дата рождения</label>
        <input
          id="birthDate"
          type="date"
          {...register('birthDate')}
        />
        {errors.birthDate && <span className={styles.error}>{errors.birthDate.message}</span>}
      </div>

      <button type="submit" className={styles.submitButton} disabled={isLoading}>
        {isLoading ? 'Сохранение...' : 'Сохранить'}
      </button>
    </form>
  );
};

export default ProfileForm; 