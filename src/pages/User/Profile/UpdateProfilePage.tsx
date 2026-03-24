import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState } from '../../../store';
import { setCredentials } from '../../../store/slices/authSlice';
import { userApi } from '../../../api/userApi';
import { ArrowLeft, Save } from 'lucide-react';

interface UpdateProfileFormData {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  address: string;
  birthdate: string;
}

export const UpdateProfilePage: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);
  const token = useSelector((state: RootState) => state.auth.accessToken);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<UpdateProfileFormData>();

  useEffect(() => {
    if (user) {
      setValue('firstName', user.firstName || '');
      setValue('lastName', user.lastName || '');
      // fallback
      setValue('phoneNumber', (user as any).phoneNumber || (user as any).phone || '');
      setValue('address', (user as any).address || '');
      // fallback
      setValue('birthdate', (user as any).birthdate || (user as any).dateOfBirth || (user as any).dob || '');
    }
  }, [user, setValue]);

  const onSubmit = async (data: UpdateProfileFormData) => {
    if (!user?.id) return;
    setLoading(true);
    setErrorMsg('');
    try {
      await userApi.updateUser(user.id, data);
      
      // Optimistically update the user in Redux
      const updatedUser = { ...user, ...data };
      dispatch(
        setCredentials({
          user: updatedUser,
          tokens: {
            accessToken: token!,
            refreshToken: localStorage.getItem('refreshToken') || '',
            tokenType: 'Bearer',
          },
        })
      );
      
      // Navigate back to profile
      navigate('/user/profile');
    } catch (error: any) {
      setErrorMsg(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật hồ sơ.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button 
          onClick={() => navigate('/user/profile')}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-slate-800">Cập nhật hồ sơ</h1>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Họ</label>
              <input
                {...register('firstName', { required: 'Họ không được để trống' })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#2e3d83]/20 focus:border-[#2e3d83] transition-all outline-none"
                placeholder="Ví dụ: Nguyễn Văn"
              />
              {errors.firstName && <span className="text-xs text-red-500 font-medium">{errors.firstName.message}</span>}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Tên</label>
              <input
                {...register('lastName', { required: 'Tên không được để trống' })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#2e3d83]/20 focus:border-[#2e3d83] transition-all outline-none"
                placeholder="Ví dụ: A"
              />
              {errors.lastName && <span className="text-xs text-red-500 font-medium">{errors.lastName.message}</span>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Số điện thoại</label>
              <input
                {...register('phoneNumber', { 
                  required: 'Số điện thoại không được để trống',
                  pattern: {
                    value: /^[0-9+]+$/,
                    message: 'Số điện thoại không hợp lệ'
                  }
                })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#2e3d83]/20 focus:border-[#2e3d83] transition-all outline-none"
                placeholder="0912345678"
              />
              {errors.phoneNumber && <span className="text-xs text-red-500 font-medium">{errors.phoneNumber.message}</span>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Ngày sinh</label>
              <input
                type="date"
                {...register('birthdate')}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#2e3d83]/20 focus:border-[#2e3d83] transition-all outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Địa chỉ</label>
            <input
              {...register('address')}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#2e3d83]/20 focus:border-[#2e3d83] transition-all outline-none"
              placeholder="Nhập địa chỉ của bạn"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => navigate('/user/profile')}
              className="px-6 py-2.5 rounded-xl text-slate-600 font-semibold hover:bg-slate-100 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#2e3d83] text-white font-semibold hover:bg-[#1e293b] active:scale-95 transition-all disabled:opacity-70 disabled:active:scale-100"
            >
              {loading ? 'Đang lưu...' : (
                <>
                  <Save size={18} /> Lưu thay đổi
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
