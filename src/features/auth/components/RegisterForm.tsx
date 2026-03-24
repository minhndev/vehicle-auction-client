import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { authService } from '../api/authService';
import { setLoading, setError } from '../../../store/slices/authSlice';
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
  const [registerSuccess, setRegisterSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!registerSuccess) return;

    const timer = window.setTimeout(() => {
      navigate('/login', {
        state: {
          registerNotice: 'Tài khoản đã được tạo. Vui lòng kiểm tra email và bấm link xác thực trước khi đăng nhập.',
        },
      });
    }, 3000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [registerSuccess, navigate]);

  // Define schema inside the component so it has access to `t`
  const registerSchema = z.object({
    email: z.string().email(t('validation:email_invalid')),
    password: z.string().min(8, t('validation:password_min')),
    confirmPassword: z.string(),
    firstName: z.string().min(2, t('validation:first_name_required')),
    lastName: z.string().min(2, t('validation:last_name_required')),
    birthdate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, t('validation:birthdate_invalid')),
    gender: z.enum(['MALE', 'FEMALE', 'OTHER'] as const),
    phoneNumber: z.string().min(10, t('validation:phone_required')).max(15, t('validation:phone_required')).regex(/^\+?[0-9.]+$/, t('validation:phone_invalid')),
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

  const buildFallbackIdentityNumber = () => {
    const now = `${Date.now()}`;
    const random = `${Math.floor(Math.random() * 1000000)}`.padStart(6, '0');
    const merged = `${now}${random}`;
    return merged.slice(-12);
  };

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(''));
      setRegisterSuccess(null);
      const normalizedEmail = data.email.trim().toLowerCase();
      await authService.register({
        email: normalizedEmail,
        password: data.password,
        confirmPassword: data.confirmPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        identityNumber: buildFallbackIdentityNumber(),
        birthdate: data.birthdate,
        gender: data.gender as Gender,
        phoneNumber: data.phoneNumber,
        address: 'Chua cap nhat',
      });

      setRegisterSuccess('Đăng ký thành công. Vui lòng kiểm tra email để xác thực tài khoản trước khi đăng nhập. Tự động chuyển sang trang đăng nhập sau 3 giây...');
    } catch (err: unknown) {
      dispatch(setError(getErrorMessage(err, t('errors:fallback'))));
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.authShell}>
        <div className={styles.promoPanel}>
          <p className={styles.promoEyebrow}>Seller Onboarding</p>
          <h2 className={styles.promoTitle}>Create your auction profile in under 2 minutes</h2>
          <p className={styles.promoText}>
            Complete the form to activate bidding access, sync your account across devices, and receive
            instant notifications when your target lots go live.
          </p>
          <div className={styles.promoTags}>
            <span>Identity verified</span>
            <span>Realtime bids</span>
            <span>Secure checkout</span>
          </div>
        </div>

        <div className={`${styles.card} ${styles.registerCard}`}>
          <h2 className={styles.title}>{t('auth:register.title')}</h2>
          <p className={styles.subtitle}>{t('auth:register.subtitle')}</p>

          {error && <div className={styles.formErrorBox}>{error}</div>}
          {registerSuccess && <div className={styles.formSuccessBox}>{registerSuccess}</div>}

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="email">{t('auth:register.email_label')}</label>
              <input className={styles.input} id="email" type="email" {...register('email')} placeholder="name@example.com" />
              {errors.email && <span className={styles.errorText}>{errors.email.message}</span>}
            </div>

            <div className={styles.formGridTwo}>
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

            <div className={styles.formGridTwo}>
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

            <div className={styles.formGridTwo}>
              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="phoneNumber">{t('auth:register.phone')}</label>
                <input className={styles.input} id="phoneNumber" type="tel" {...register('phoneNumber')} />
                {errors.phoneNumber && <span className={styles.errorText}>{errors.phoneNumber.message}</span>}
              </div>
            </div>

            <div className={styles.formGridTwo}>
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
            </div>

            <Button type="submit" variant="primary" className={styles.submitBtn} disabled={loading}>
              {loading ? t('common:loading') : t('auth:register.submit_btn')}
            </Button>

            {registerSuccess && (
              <Button
                type="button"
                variant="secondary"
                className={styles.submitBtn}
                onClick={() => navigate('/login', {
                  state: {
                    registerNotice: 'Tài khoản đã được tạo. Vui lòng kiểm tra email và bấm link xác thực trước khi đăng nhập.',
                  },
                })}
              >
                Đi tới đăng nhập
              </Button>
            )}
          </form>

          <p className={styles.linkText}>
            {t('auth:register.already_have_account')} <Link to="/login">{t('auth:register.sign_in')}</Link>
          </p>
        </div>
      </div>
    </div>
  );
};
