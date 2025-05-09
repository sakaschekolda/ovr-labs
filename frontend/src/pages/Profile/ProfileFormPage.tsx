import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { RootState } from '../../app/store';
import { updateProfile } from '../../features/auth/authThunks';
import ProfileForm from '../../components/ProfileForm/ProfileForm';
import ErrorNotification from '../../components/ErrorNotification';

interface ProfileFormData {
  firstName: string;
  lastName: string;
  middleName: string;
  gender: 'male' | 'female' | 'other';
  birthDate: string;
}

const ProfileFormPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, isLoading } = useAppSelector((state: RootState) => state.auth);
  const [error, setError] = useState<string | null>(null);
  const [showError, setShowError] = useState(false);

  const handleSubmit = async (data: ProfileFormData) => {
    setError(null);
    setShowError(false);
    try {
      if (!user) throw new Error('Не авторизован');
      await dispatch(updateProfile(data)).unwrap();
      navigate('/profile');
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err?.message || 'Ошибка обновления профиля');
      setShowError(true);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div style={{ padding: '32px 0' }}>
      {showError && (
        <ErrorNotification
          message={error || 'Неизвестная ошибка'}
          onClose={() => { setShowError(false); setError(null); }}
          duration={5000}
        />
      )}
      <h1 style={{ textAlign: 'center', marginBottom: 24 }}>Редактирование профиля</h1>
      <ProfileForm
        user={user}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        error={error}
      />
    </div>
  );
};

export default ProfileFormPage; 