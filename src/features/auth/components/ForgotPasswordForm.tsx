import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link } from 'react-router-dom';
import axiosClient from '../../../api/axiosClient';
import { Button } from '../../../components/ui/Button/Button';
import styles from './AuthForm.module.css';

const schema = z.object({
  email: z.string().email('Invalid email address'),
});

type FormData = z.infer<typeof schema>;

export const ForgotPasswordForm: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      setError('');
      // In a real app, this would be in authService
      await axiosClient.post('/auth/forgot-password', data);
      setSuccess(true);
    } catch (err: unknown) {
      setError((err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <h2 className={styles.title}>Check your email</h2>
          <p className={styles.subtitle} style={{ marginBottom: '1rem' }}>
            We have sent a password reset link to your email address.
          </p>
          <div style={{ textAlign: 'center', marginTop: 'var(--space-xl)' }}>
            <Link to="/login">Return to login</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.title}>Forgot Password</h2>
        <p className={styles.subtitle}>Enter your email to receive a reset link.</p>
        
        {error && <div className={styles.errorText} style={{marginBottom: '1rem', textAlign: 'center'}}>{error}</div>}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="email">Email</label>
            <input 
              className={styles.input} 
              id="email" 
              type="email" 
              {...register('email')} 
              placeholder="name@example.com" 
            />
            {errors.email && <span className={styles.errorText}>{errors.email.message}</span>}
          </div>

          <Button type="submit" variant="primary" className={styles.submitBtn} isLoading={loading}>
            Send Reset Link
          </Button>
        </form>

        <p className={styles.linkText}>
          Remember your password? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
};
