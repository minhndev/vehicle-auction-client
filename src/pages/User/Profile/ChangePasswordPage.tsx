import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState } from '../../../store';
import { userApi } from '../../../api/userApi';
import { ArrowLeft, Lock, KeyRound } from 'lucide-react';

export const ChangePasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<any>();

  const newPassword = watch('newPassword', '');

  const onSubmit = async (data: any) => {
    if (!user?.id) return;
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      // Calling PUT /users/{id} with the new password field attached.
      // If the backend has a different preferred method for change password, 
      // replace this with the appropriate API endpoint.
      await userApi.updateUser(user.id, {
        password: data.newPassword,
        confirmPassword: data.confirmPassword
      });
      
      setSuccessMsg('Đổi mật khẩu thành công. Vui lòng ghi nhớ mật khẩu mới của bạn.');
      reset();
      
      // Navigate back after a delay
      setTimeout(() => {
        navigate('/user/profile');
      }, 3000);
      
    } catch (error: any) {
      setErrorMsg(error.response?.data?.message || 'Có lỗi xảy ra khi đổi mật khẩu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button 
          onClick={() => navigate('/user/profile')}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-slate-800">Đổi mật khẩu</h1>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
        
        <div className="flex items-center gap-4 mb-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
          <div className="w-12 h-12 bg-[#2e3d83]/10 text-[#2e3d83] rounded-full flex items-center justify-center">
            <KeyRound size={24} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">Bảo vệ tài khoản</h3>
            <p className="text-sm text-slate-500">Nên sử dụng mật khẩu mạnh có chứa chữ số và ký tự đặc biệt.</p>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm font-medium">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Mật khẩu mới</label>
            <div className="relative">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                {...register('newPassword', { 
                  required: 'Mật khẩu mới không được để trống',
                  minLength: {
                    value: 6,
                    message: 'Mật khẩu phải dài ít nhất 6 ký tự'
                  }
                })}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#2e3d83]/20 focus:border-[#2e3d83] transition-all outline-none"
                placeholder="Nhập mật khẩu mới"
              />
            </div>
            {errors.newPassword && <span className="text-xs text-red-500 font-medium">{errors.newPassword?.message?.toString()}</span>}
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Xác nhận mật khẩu mới</label>
            <div className="relative">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                {...register('confirmPassword', { 
                  required: 'Bạn cần xác nhận mật khẩu',
                  validate: value => value === newPassword || 'Mật khẩu xác nhận không khớp'
                })}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#2e3d83]/20 focus:border-[#2e3d83] transition-all outline-none"
                placeholder="Nhập lại mật khẩu mới"
              />
            </div>
            {errors.confirmPassword && <span className="text-xs text-red-500 font-medium">{errors.confirmPassword?.message?.toString()}</span>}
          </div>

          <div className="pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#2e3d83] text-white font-bold hover:bg-[#1e293b] active:scale-[0.98] transition-all disabled:opacity-70 disabled:active:scale-100"
            >
              {loading ? 'Đang cập nhật...' : 'Đổi mật khẩu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
