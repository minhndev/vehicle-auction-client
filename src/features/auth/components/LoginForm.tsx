import React, { useEffect, useState } from 'react';
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
import { GoogleLogin } from '@react-oauth/google';

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
  const [registerNotice, setRegisterNotice] = useState('');

  useEffect(() => {
    const routeState = (location.state || {}) as Record<string, unknown>;
    const notice = typeof routeState.registerNotice === 'string' ? routeState.registerNotice : '';
    if (!notice) {
      return;
    }

    setRegisterNotice(notice);

    const { registerNotice: _ignored, ...restState } = routeState;
    navigate(location.pathname, { replace: true, state: restState });
  }, [location.pathname, location.state, navigate]);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const handleAuthSuccess = (response: any) => {
    const userProfile = authService.getCurrentUserFromToken(response.accessToken);

    dispatch(setCredentials({
      user: userProfile,
      tokens: response,
    }));

    const roleStr = (userProfile.role || 'USER').toUpperCase();
    const origin = location.state?.from?.pathname ||
      (roleStr === 'ADMIN' ? '/admin/dashboard' :
        roleStr === 'SELLER' ? '/seller/dashboard' : '/user/dashboard');
    navigate(origin);
  };

  const onSubmit = async (data: LoginFormValues) => {
    try {
      dispatch(setLoading(true));
      const response = await authService.login(data);
      handleAuthSuccess(response);
    } catch (err: unknown) {
      dispatch(setError(getErrorMessage(err, 'Failed to login')));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      dispatch(setLoading(true));
      const idToken = credentialResponse.credential;
      if (!idToken) throw new Error("No ID Token found");

      const response = await authService.loginWithGoogle(idToken);
      handleAuthSuccess(response);
    } catch (err: unknown) {
      dispatch(setError(getErrorMessage(err, 'Google login failed')));
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 py-12 font-sans">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
        
        {/* Left Side: Promo Blue Card */}
        <div className="hidden md:flex flex-col justify-center bg-[#2e3d83] text-white p-12 lg:p-16 w-1/2 relative">
          <div className="absolute inset-0 bg-blue-900/20 backdrop-blur-sm pointer-events-none"></div>
          <div className="relative z-10 w-full max-w-md mx-auto">
            <p className="text-blue-300 font-bold text-xs tracking-widest uppercase mb-4">Vehicle Auction</p>
            <h2 className="text-white text-4xl lg:text-5xl font-extrabold mb-6 leading-tight">
              Đăng nhập để tiếp tục các phiên đấu giá trực tiếp
            </h2>
            <p className="text-blue-100 text-lg mb-10 leading-relaxed font-medium">
              Theo dõi giá theo thời gian thực, nhận thông báo vượt giá và thanh toán xe thắng thầu trên nền tảng thống nhất.
            </p>
            
            <div className="flex flex-wrap gap-3 mb-12">
              <span className="px-4 py-2 bg-white/10 rounded-full text-sm font-semibold border border-white/20 backdrop-blur-md">Live bidding</span>
              <span className="px-4 py-2 bg-white/10 rounded-full text-sm font-semibold border border-white/20 backdrop-blur-md">Thông báo tức thì</span>
              <span className="px-4 py-2 bg-white/10 rounded-full text-sm font-semibold border border-white/20 backdrop-blur-md">VNPay checkout</span>
            </div>
            
            <div className="flex gap-12 border-t border-white/20 pt-8">
              <div>
                <strong className="block text-3xl lg:text-4xl font-black mb-1 tracking-tight">12.5k+</strong>
                <p className="text-blue-200 text-sm font-semibold">active bidders</p>
              </div>
              <div>
                <strong className="block text-3xl lg:text-4xl font-black mb-1 tracking-tight">98%</strong>
                <p className="text-blue-200 text-sm font-semibold">trusted sellers</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="w-full md:w-1/2 p-8 sm:p-12 lg:p-16 flex flex-col justify-center bg-white">
          <div className="max-w-md w-full mx-auto">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Welcome Back</h2>
            <p className="text-slate-500 font-medium mb-8">Sign in to manage bids, orders and live auctions.</p>

            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3.5 rounded-xl text-sm font-semibold flex items-center">
                <svg className="w-5 h-5 mr-3 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path></svg>
                {error}
              </div>
            )}

            {registerNotice && (
              <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3.5 rounded-xl text-sm font-semibold flex items-center">
                <svg className="w-5 h-5 mr-3 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                {registerNotice}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2" htmlFor="email">Email Address</label>
                <div className="relative">
                  <input
                    className={`w-full px-4 py-3.5 rounded-xl border ${errors.email ? 'border-red-300 focus:ring-red-200 focus:border-red-400' : 'border-slate-200 focus:ring-[#2e3d83]/20 focus:border-[#2e3d83]'} outline-none transition-all duration-200 bg-slate-50 focus:bg-white font-medium text-slate-900`}
                    id="email"
                    type="email"
                    {...register('email')}
                    placeholder="name@example.com"
                  />
                  {errors.email && <span className="text-red-500 text-xs mt-1.5 block font-bold">{errors.email.message}</span>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2" htmlFor="password">Password</label>
                <div className="relative">
                  <input
                    className={`w-full px-4 py-3.5 rounded-xl border ${errors.password ? 'border-red-300 focus:ring-red-200 focus:border-red-400' : 'border-slate-200 focus:ring-[#2e3d83]/20 focus:border-[#2e3d83]'} outline-none transition-all duration-200 bg-slate-50 focus:bg-white font-medium text-slate-900 tracking-wider`}
                    id="password"
                    type="password"
                    {...register('password')}
                    placeholder="••••••••"
                  />
                  {errors.password && <span className="text-red-500 text-xs mt-1.5 block font-bold">{errors.password.message}</span>}
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2.5 cursor-pointer group">
                  <input type="checkbox" className="w-4.5 h-4.5 rounded border-slate-300 text-[#2e3d83] focus:ring-[#2e3d83] transition-colors" />
                  <span className="text-sm font-semibold text-slate-600 group-hover:text-slate-900 transition-colors">Remember me</span>
                </label>
                <Link to="/forgot-password" className="text-sm font-bold text-[#2e3d83] hover:text-blue-800 transition-colors">
                  Forgot password?
                </Link>
              </div>

              <div className="pt-2">
                <Button type="submit" variant="primary" className="w-full py-4 rounded-xl text-base font-bold bg-[#2e3d83] hover:bg-[#202b5e] transition-all shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed" disabled={loading}>
                  {loading ? 'Processing...' : 'Sign In To Account'}
                </Button>
              </div>
            </form>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-slate-400 font-bold uppercase tracking-wider text-xs">or sign in with</span>
              </div>
            </div>

            <div className="flex justify-center w-full relative z-10 hover:shadow-md transition-shadow rounded-md overflow-hidden">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => dispatch(setError('Google login was cancelled or failed.'))}
                theme="outline"
                size="large"
                shape="rectangular"
                width="100%"
                logo_alignment="center"
              />
            </div>

            <p className="mt-8 text-center text-sm font-semibold text-slate-500">
              Don't have an account? <Link to="/register" className="ml-1 text-[#2e3d83] font-bold hover:underline hover:text-blue-800 transition-colors">Create one here</Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
