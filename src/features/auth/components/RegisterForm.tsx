import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { authService } from '../api/authService';
import { setCredentials, setLoading, setError } from '../../../store/slices/authSlice';
import type { RootState } from '../../../store';
import { Button } from '../../../components/ui/Button/Button';
import { useTranslation } from 'react-i18next';
import { getErrorMessage } from '../../../utils/errorHelpers';
import styles from './AuthForm.module.css';
import type { Gender } from '../../../types/auth.types';

export const RegisterForm: React.FC = () => {
  const { t } = useTranslation(['auth', 'validation', 'common']);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state: RootState) => state.auth);

  // Define schema inside the component so it has access to `t`
  const registerSchema = z.object({
    email: z.string().email(t('validation:email_invalid')),
    password: z.string().min(8, t('validation:password_min')),
    confirmPassword: z.string(),
    firstName: z.string().min(2, t('validation:first_name_required')),
    lastName: z.string().min(2, t('validation:last_name_required')),
    identityNumber: z.string().min(5, t('validation:identity_required')),
    birthdate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, t('validation:birthdate_invalid')),
    gender: z.enum(['MALE', 'FEMALE', 'OTHER'] as const),
    phoneNumber: z.string().min(10, t('validation:phone_required')).max(15, t('validation:phone_required')).regex(/^\+?[0-9.]+$/, t('validation:phone_invalid')),
    address: z.string().min(5, t('validation:address_required')),
    avatarURL: z.string().url(t('validation:avatar_url_invalid')).optional().or(z.literal('')),
  }).refine((data) => data.password === data.confirmPassword, {
    message: t('validation:passwords_dont_match'),
    path: ["confirmPassword"],
  });

  type RegisterFormValues = z.infer<typeof registerSchema>;

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      gender: 'OTHER',
    }
  });

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      dispatch(setLoading(true));
      const response = await authService.register({
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        identityNumber: data.identityNumber,
        birthdate: data.birthdate,
        gender: data.gender as Gender,
        phoneNumber: data.phoneNumber,
        address: data.address,
        avatarURL: data.avatarURL || undefined,
      });
      
      // Extract user profile from token since /users/me doesn't exist
      const userProfile = authService.getCurrentUserFromToken(response.accessToken);

      dispatch(setCredentials({
        user: userProfile,
        tokens: response,
      }));
      
      navigate(`/${(userProfile.role || 'user').toLowerCase()}/dashboard`);
    } catch (err: unknown) {
      dispatch(setError(getErrorMessage(err, t('errors:fallback'))));
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.title}>{t('auth:register.title')}</h2>
        <p className={styles.subtitle}>{t('auth:register.subtitle')}</p>
        
        {error && <div className={styles.errorText} style={{marginBottom: '1rem', textAlign: 'center'}}>{error}</div>}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="email">{t('auth:register.email_label')}</label>
            <input className={styles.input} id="email" type="email" {...register('email')} placeholder="name@example.com" />
            {errors.email && <span className={styles.errorText}>{errors.email.message}</span>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="firstName">{t('auth:register.first_name')}</label>
              <input className={styles.input} id="firstName" {...register('firstName')} />
              {errors.firstName && <span className={styles.errorText}>{errors.firstName.message}</span>}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="lastName">{t('auth:register.last_name')}</label>
              <input className={styles.input} id="lastName" {...register('lastName')} />
              {errors.lastName && <span className={styles.errorText}>{errors.lastName.message}</span>}
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="identityNumber">{t('auth:register.identity_number')}</label>
            <input className={styles.input} id="identityNumber" {...register('identityNumber')} />
            {errors.identityNumber && <span className={styles.errorText}>{errors.identityNumber.message}</span>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="birthdate">{t('auth:register.birthdate')}</label>
              <input className={styles.input} id="birthdate" type="date" {...register('birthdate')} />
              {errors.birthdate && <span className={styles.errorText}>{errors.birthdate.message}</span>}
            </div>

            <div className={styles.formGroup}>
               <label className={styles.label} htmlFor="gender">{t('auth:register.gender.label')}</label>
               <select className={styles.input} id="gender" {...register('gender')}>
                 <option value="MALE">{t('auth:register.gender.male')}</option>
                 <option value="FEMALE">{t('auth:register.gender.female')}</option>
                 <option value="OTHER">{t('auth:register.gender.other')}</option>
               </select>
               {errors.gender && <span className={styles.errorText}>{errors.gender.message}</span>}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="phoneNumber">{t('auth:register.phone')}</label>
              <input className={styles.input} id="phoneNumber" type="tel" {...register('phoneNumber')} />
              {errors.phoneNumber && <span className={styles.errorText}>{errors.phoneNumber.message}</span>}
            </div>
            
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="avatarURL">{t('auth:register.avatar')}</label>
              <input className={styles.input} id="avatarURL" type="url" {...register('avatarURL')} placeholder="https://..." />
              {errors.avatarURL && <span className={styles.errorText}>{errors.avatarURL.message}</span>}
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="address">{t('auth:register.address')}</label>
            <textarea className={styles.input} id="address" {...register('address')} rows={3}></textarea>
            {errors.address && <span className={styles.errorText}>{errors.address.message}</span>}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="password">{t('auth:register.password_label')}</label>
            <input className={styles.input} id="password" type="password" {...register('password')} placeholder="••••••••" />
            {errors.password && <span className={styles.errorText}>{errors.password.message}</span>}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="confirmPassword">{t('auth:register.confirm_password_label')}</label>
            <input className={styles.input} id="confirmPassword" type="password" {...register('confirmPassword')} placeholder="••••••••" />
            {errors.confirmPassword && <span className={styles.errorText}>{errors.confirmPassword.message}</span>}
          </div>

          <Button type="submit" variant="primary" className={styles.submitBtn} isLoading={loading}>
            {t('auth:register.submit_btn')}
          </Button>
        </form>

        <p className={styles.linkText}>
          {t('auth:register.already_have_account')} <Link to="/login">{t('auth:register.sign_in')}</Link>
        </p>
      </div>
    </div>
  );
};
