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

      // Extract user profile from token since /users/me doesn't exist
      const userProfile = authService.getCurrentUserFromToken(response.accessToken);

      dispatch(setCredentials({
        user: userProfile,
        tokens: response,
      }));

      // Redirect to origin or dashboard based on role
      const roleStr = (userProfile.role || 'USER').toUpperCase();
      const origin = location.state?.from?.pathname || (roleStr === 'ADMIN' ? '/admin/dashboard' : roleStr === 'SELLER' ? '/seller/dashboard' : '/user/dashboard');
      navigate(origin);
    } catch (err: unknown) {
      dispatch(setError(getErrorMessage(err, 'Failed to login')));
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.authShell}>
        <aside className={styles.promoPanel}>
          <p className={styles.promoEyebrow}>Vehicle Auction</p>
          <h2 className={styles.promoTitle}>Đăng nhập để tiếp tục các phiên đấu giá trực tiếp</h2>
          <p className={styles.promoText}>
            Theo dõi giá theo thời gian thực, nhận thông báo vượt giá và thanh toán xe thắng thầu trên một nền tảng thống nhất.
          </p>
          <div className={styles.promoTags}>
            <span>Live bidding</span>
            <span>Thông báo tức thì</span>
            <span>VNPay checkout</span>
          </div>
          <div className={styles.promoStats}>
            <div>
              <strong>12.5k+</strong>
              <p>active bidders</p>
            </div>
            <div>
              <strong>98%</strong>
              <p>trusted sellers</p>
            </div>
          </div>
        </aside>

        <div className={styles.card}>
          <h2 className={styles.title}>Welcome Back</h2>
          <p className={styles.subtitle}>Sign in to manage bids, orders and live auctions</p>

          {error && (
            <div className={styles.loginErrorBox}>{error}</div>
          )}

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

            <div className={styles.inlineRow}>
              <label className={styles.rememberOption}>
                <input type="checkbox" />
                <span>Remember me</span>
              </label>
              <Link to="/forgot-password" className={styles.forgotLink}>Forgot password?</Link>
            </div>

            <Button type="submit" variant="primary" className={styles.submitBtn} disabled={loading}>
              {loading ? 'Loading...' : 'Sign In'}
            </Button>
          </form>

          <div className={styles.divider}>or continue with</div>

          <div className={styles.socialActions}>
            <button type="button" className={styles.socialBtn}>Google</button>
            <button type="button" className={styles.socialBtn}>Facebook</button>
          </div>

          <p className={styles.linkText}>
            Don't have an account? <Link to="/register">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
};
