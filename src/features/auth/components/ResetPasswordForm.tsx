import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import axiosClient from '../../../api/axiosClient';
import { Button } from '../../../components/ui/Button/Button';
import styles from './AuthForm.module.css';

const schema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type FormData = z.infer<typeof schema>;

export const ResetPasswordForm: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token'); // E.g., /reset-password?token=abc

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    if (!token) {
      setError('Invalid or expired reset token');
      return;
    }

    try {
      setLoading(true);
      setError('');
      // In a real app, this would be in authService
      await axiosClient.post('/auth/reset-password', {
        token,
        password: data.password,
      });
      // Redirect to login after successful reset
      navigate('/login?reset=success');
    } catch (err: unknown) {
      setError((err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.title}>Reset Password</h2>
        <p className={styles.subtitle}>Enter your new password below.</p>
        
        {error && <div className={styles.errorText} style={{marginBottom: '1rem', textAlign: 'center'}}>{error}</div>}
        {!token && <div className={styles.errorText} style={{marginBottom: '1rem', textAlign: 'center'}}>Missing reset token</div>}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="password">New Password</label>
            <input 
              className={styles.input} 
              id="password" 
              type="password" 
              {...register('password')} 
              placeholder="••••••••" 
            />
            {errors.password && <span className={styles.errorText}>{errors.password.message}</span>}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="confirmPassword">Confirm New Password</label>
            <input 
              className={styles.input} 
              id="confirmPassword" 
              type="password" 
              {...register('confirmPassword')} 
              placeholder="••••••••" 
            />
            {errors.confirmPassword && <span className={styles.errorText}>{errors.confirmPassword.message}</span>}
          </div>

          <Button type="submit" variant="primary" className={styles.submitBtn} isLoading={loading} disabled={!token}>
            Update Password
          </Button>
        </form>

        <p className={styles.linkText}>
          Remembered your password? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
};
