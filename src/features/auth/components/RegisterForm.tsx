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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 py-12 font-sans">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
        
        {/* Left Side: Promo Blue Card */}
        <div className="hidden md:flex flex-col justify-center bg-[#2e3d83] text-white p-12 lg:p-16 w-1/2 relative bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]">
          <div className="absolute inset-0 bg-blue-900/80 backdrop-blur-sm pointer-events-none"></div>
          <div className="relative z-10 w-full max-w-md mx-auto">
            <p className="text-blue-300 font-bold text-xs tracking-widest uppercase mb-4">Seller Onboarding</p>
            <h2 className="text-white text-4xl lg:text-5xl font-extrabold mb-6 leading-tight">
              Create your auction profile in under 2 minutes
            </h2>
            <p className="text-blue-100 text-lg mb-10 leading-relaxed font-medium">
              Complete the form to activate bidding access, sync your account across devices, and receive instant notifications when your target lots go live.
            </p>
            
            <div className="flex flex-wrap gap-3">
              <span className="px-4 py-2 bg-white/10 rounded-full text-sm font-semibold border border-white/20 backdrop-blur-md">Identity verified</span>
              <span className="px-4 py-2 bg-white/10 rounded-full text-sm font-semibold border border-white/20 backdrop-blur-md">Realtime bids</span>
              <span className="px-4 py-2 bg-white/10 rounded-full text-sm font-semibold border border-white/20 backdrop-blur-md">Secure checkout</span>
            </div>
          </div>
        </div>

        {/* Right Side: Register Form */}
        <div className="w-full md:w-1/2 p-8 sm:p-12 lg:p-16 flex flex-col justify-center bg-white">
          <div className="max-w-md w-full mx-auto">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-2">{t('auth:register.title')}</h2>
            <p className="text-slate-500 font-medium mb-8">{t('auth:register.subtitle')}</p>

            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3.5 rounded-xl text-sm font-semibold flex items-center">
                <svg className="w-5 h-5 mr-3 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path></svg>
                {error}
              </div>
            )}
            
            {registerSuccess && (
              <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3.5 rounded-xl text-sm font-semibold flex items-start leading-snug">
                <svg className="w-5 h-5 mr-3 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                {registerSuccess}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5" htmlFor="email">{t('auth:register.email_label')}</label>
                <input 
                  className={`w-full px-4 py-3 rounded-xl border ${errors.email ? 'border-red-300 focus:ring-red-200 focus:border-red-400' : 'border-slate-200 focus:ring-[#2e3d83]/20 focus:border-[#2e3d83]'} outline-none transition-all duration-200 bg-slate-50 focus:bg-white font-medium text-slate-900`} 
                  id="email" 
                  type="email" 
                  {...register('email')} 
                  placeholder="name@example.com" 
                />
                {errors.email && <span className="text-red-500 text-xs mt-1.5 block font-bold">{errors.email.message}</span>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5" htmlFor="firstName">{t('auth:register.first_name')}</label>
                  <input 
                    className={`w-full px-4 py-3 rounded-xl border ${errors.firstName ? 'border-red-300 focus:border-red-400' : 'border-slate-200 focus:border-[#2e3d83]'} outline-none transition-all duration-200 bg-slate-50 focus:bg-white font-medium text-slate-900`} 
                    id="firstName" 
                    {...register('firstName')} 
                  />
                  {errors.firstName && <span className="text-red-500 text-xs mt-1.5 block font-bold">{errors.firstName.message}</span>}
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5" htmlFor="lastName">{t('auth:register.last_name')}</label>
                  <input 
                    className={`w-full px-4 py-3 rounded-xl border ${errors.lastName ? 'border-red-300 focus:border-red-400' : 'border-slate-200 focus:border-[#2e3d83]'} outline-none transition-all duration-200 bg-slate-50 focus:bg-white font-medium text-slate-900`} 
                    id="lastName" 
                    {...register('lastName')} 
                  />
                  {errors.lastName && <span className="text-red-500 text-xs mt-1.5 block font-bold">{errors.lastName.message}</span>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5" htmlFor="birthdate">{t('auth:register.birthdate')}</label>
                  <input 
                    className={`w-full px-4 py-3 rounded-xl border ${errors.birthdate ? 'border-red-300 focus:border-red-400' : 'border-slate-200 focus:border-[#2e3d83]'} outline-none transition-all duration-200 bg-slate-50 focus:bg-white font-medium text-slate-900`} 
                    id="birthdate" 
                    type="date" 
                    {...register('birthdate')} 
                  />
                  {errors.birthdate && <span className="text-red-500 text-xs mt-1.5 block font-bold">{errors.birthdate.message}</span>}
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5" htmlFor="gender">{t('auth:register.gender.label')}</label>
                  <select 
                    className={`w-full px-4 py-3 rounded-xl border ${errors.gender ? 'border-red-300 focus:border-red-400' : 'border-slate-200 focus:border-[#2e3d83]'} outline-none transition-all duration-200 bg-slate-50 focus:bg-white font-medium text-slate-900 cursor-pointer`} 
                    id="gender" 
                    {...register('gender')}
                  >
                    <option value="MALE">{t('auth:register.gender.male')}</option>
                    <option value="FEMALE">{t('auth:register.gender.female')}</option>
                    <option value="OTHER">{t('auth:register.gender.other')}</option>
                  </select>
                  {errors.gender && <span className="text-red-500 text-xs mt-1.5 block font-bold">{errors.gender.message}</span>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5" htmlFor="phoneNumber">{t('auth:register.phone')}</label>
                <input 
                  className={`w-full px-4 py-3 rounded-xl border ${errors.phoneNumber ? 'border-red-300 focus:border-red-400' : 'border-slate-200 focus:border-[#2e3d83]'} outline-none transition-all duration-200 bg-slate-50 focus:bg-white font-medium text-slate-900`} 
                  id="phoneNumber" 
                  type="tel" 
                  {...register('phoneNumber')} 
                />
                {errors.phoneNumber && <span className="text-red-500 text-xs mt-1.5 block font-bold">{errors.phoneNumber.message}</span>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5" htmlFor="password">{t('auth:register.password_label')}</label>
                  <input 
                    className={`w-full px-4 py-3 rounded-xl border ${errors.password ? 'border-red-300 focus:border-red-400' : 'border-slate-200 focus:border-[#2e3d83]'} outline-none transition-all duration-200 bg-slate-50 focus:bg-white font-medium text-slate-900 tracking-wider`} 
                    id="password" 
                    type="password" 
                    {...register('password')} 
                    placeholder="••••••••" 
                  />
                  {errors.password && <span className="text-red-500 text-xs mt-1.5 block font-bold">{errors.password.message}</span>}
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5" htmlFor="confirmPassword">{t('auth:register.confirm_password_label')}</label>
                  <input 
                    className={`w-full px-4 py-3 rounded-xl border ${errors.confirmPassword ? 'border-red-300 focus:border-red-400' : 'border-slate-200 focus:border-[#2e3d83]'} outline-none transition-all duration-200 bg-slate-50 focus:bg-white font-medium text-slate-900 tracking-wider`} 
                    id="confirmPassword" 
                    type="password" 
                    {...register('confirmPassword')} 
                    placeholder="••••••••" 
                  />
                  {errors.confirmPassword && <span className="text-red-500 text-xs mt-1.5 block font-bold">{errors.confirmPassword.message}</span>}
                </div>
              </div>

              <div className="pt-4">
                <Button type="submit" variant="primary" className="w-full py-4 rounded-xl text-base font-bold bg-[#2e3d83] hover:bg-[#202b5e] transition-all shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed" disabled={loading}>
                  {loading ? t('common:loading') : t('auth:register.submit_btn')}
                </Button>
              </div>

              {registerSuccess && (
                <div className="pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full py-3.5 rounded-xl text-sm font-bold border-2 border-[#2e3d83] text-[#2e3d83] hover:bg-slate-50 transition-colors"
                    onClick={() => navigate('/login', {
                      state: {
                        registerNotice: 'Tài khoản đã được tạo. Vui lòng kiểm tra email và bấm link xác thực trước khi đăng nhập.',
                      },
                    })}
                  >
                    Đi tới Đăng nhập
                  </Button>
                </div>
              )}
            </form>

            <p className="mt-8 text-center text-sm font-semibold text-slate-500">
              {t('auth:register.already_have_account')} <Link to="/login" className="ml-1 text-[#2e3d83] font-bold hover:underline hover:text-blue-800 transition-colors">{t('auth:register.sign_in')}</Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
