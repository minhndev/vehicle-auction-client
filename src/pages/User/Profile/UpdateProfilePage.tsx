import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState } from '../../../store';
import { setCredentials } from '../../../store/slices/authSlice';
import { userApi } from '../../../api/userApi';
import { ArrowLeft, Save, Camera, User, Loader2 } from 'lucide-react';
import { sellerApi } from '../../../features/seller/api/sellerApi';

interface UpdateProfileFormData {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  address: string;
  birthdate: string;
  identityNumber: string;
  avatarURL: string;
}

export const UpdateProfilePage: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);
  const token = useSelector((state: RootState) => state.auth.accessToken);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<UpdateProfileFormData>();

  useEffect(() => {
    // Initial populate from Redux
    if (user) {
      setValue('firstName', user.firstName || '');
      setValue('lastName', user.lastName || '');
      setValue('phoneNumber', (user as any).phoneNumber || (user as any).phone || '');
      setValue('address', (user as any).address || '');
      setValue('birthdate', (user as any).birthdate || (user as any).dateOfBirth || (user as any).dob || '');
    }

    // Fetch latest from API
    if (token) {
      userApi.getMe().then(data => {
        dispatch(setCredentials({
          user: { ...user, ...data } as any,
          tokens: {
             accessToken: token,
             refreshToken: localStorage.getItem('refreshToken') || '',
             tokenType: 'Bearer'
          }
        }));
        // Update form with real latest data
        setValue('firstName', data.firstName || user?.firstName || '');
        setValue('lastName', data.lastName || user?.lastName || '');
        setValue('phoneNumber', data.phoneNumber || (data as any).phone || (user as any)?.phoneNumber || '');
        setValue('address', data.address || (user as any)?.address || '');
        setValue('birthdate', (data as any).birthdate || (data as any).dateOfBirth || (user as any)?.birthdate || '');
        // @ts-ignore
        setValue('identityNumber', data.identityNumber || (user as any)?.identityNumber || '');
        setValue('avatarURL', data.avatarURL || user?.avatarURL || '');
        setAvatarPreview(data.avatarURL || user?.avatarURL || null);
      }).catch(console.error);
    }
  }, [dispatch, token, setValue]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);

    // Upload immediately or wait for submit? 
    // Usually immediate is better for UX if we show a loader
    try {
      setUploading(true);
      const url = await sellerApi.uploadImage(file);
      setValue('avatarURL', url);
    } catch (err) {
      setErrorMsg('Không thể tải ảnh lên.');
    } finally {
      setUploading(false);
    }
  };

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
          {/* Avatar Selection */}
          <div className="flex flex-col items-center gap-4 mb-8">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-slate-100 border-4 border-white shadow-lg flex items-center justify-center relative">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <User size={64} className="text-slate-300" />
                )}
                {uploading && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <Loader2 size={32} className="text-white animate-spin" />
                  </div>
                )}
              </div>
              <label className="absolute bottom-0 right-0 w-10 h-10 bg-[#2e3d83] text-white rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:bg-[#1e293b] transition-colors border-2 border-white">
                <Camera size={18} />
                <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} disabled={uploading} />
              </label>
            </div>
            <p className="text-sm font-medium text-slate-500">Nhấn vào biểu tượng camera để thay đổi ảnh</p>
          </div>

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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Số định danh/CCCD</label>
              <input
                {...register('identityNumber')}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#2e3d83]/20 focus:border-[#2e3d83] transition-all outline-none"
                placeholder="Số căn cước công dân"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Địa chỉ</label>
              <input
                {...register('address')}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#2e3d83]/20 focus:border-[#2e3d83] transition-all outline-none"
                placeholder="Nhập địa chỉ của bạn"
              />
            </div>
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
