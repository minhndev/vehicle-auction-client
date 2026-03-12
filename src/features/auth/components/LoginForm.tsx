import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { authService } from '../api/authService';
import { setCredentials, setLoading, setError } from '../../../store/slices/authSlice';
import type { RootState } from '../../../store';
import { Button } from '../../../components/ui/Button/Button';
import { getErrorMessage } from '../../../utils/errorHelpers';
import styles from './AuthForm.module.css';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginForm: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, error } = useSelector((state: RootState) => state.auth);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      dispatch(setLoading(true));
      const response = await authService.login(data);
      
      // Fetch user profile after successful token retrieval
      const userProfile = await authService.getCurrentUser();
      
      dispatch(setCredentials({
        user: userProfile,
        tokens: response,
      }));
      
      // Redirect to origin or dashboard based on role
      const origin = location.state?.from?.pathname || `/${userProfile.role.toLowerCase()}/dashboard`;
      navigate(origin);
    } catch (err: unknown) {
      dispatch(setError(getErrorMessage(err, 'Failed to login')));
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.title}>Welcome Back</h2>
        <p className={styles.subtitle}>Log in to access your account</p>
        
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

          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="password">Password</label>
            <input 
              className={styles.input} 
              id="password" 
              type="password" 
              {...register('password')} 
              placeholder="••••••••" 
            />
            {errors.password && <span className={styles.errorText}>{errors.password.message}</span>}
          </div>

          <div style={{ textAlign: 'right', marginBottom: '1rem' }}>
            <Link to="/forgot-password" style={{ fontSize: 'var(--font-size-small)' }}>Forgot password?</Link>
          </div>

          <Button type="submit" variant="primary" className={styles.submitBtn} isLoading={loading}>
            Sign In
          </Button>
        </form>

        <p className={styles.linkText}>
          Don't have an account? <Link to="/register">Create one</Link>
        </p>
      </div>
    </div>
  );
};
