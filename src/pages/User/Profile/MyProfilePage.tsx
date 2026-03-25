import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { usePageI18n } from '../../../i18n/usePageI18n';
import type { RootState } from '../../../store';
import { setCredentials } from '../../../store/slices/authSlice';
import { userApi } from '../../../api/userApi';
import { Mail, Phone, MapPin, Calendar, ShieldCheck } from 'lucide-react';

export const MyProfilePage: React.FC = () => {
  const { tp } = usePageI18n();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const token = useSelector((state: RootState) => state.auth.accessToken);

  useEffect(() => {
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
      }).catch(console.error);
    }
  }, [dispatch, token]);

  const fullName = `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim() || tp('myProfile.defaultName');
  const initials = `${user?.firstName?.[0] ?? 'A'}${user?.lastName?.[0] ?? 'M'}`.toUpperCase();
  
  // Custom Role Display
  const roleDisplay = user?.role === 'USER' ? 'Thành viên' : 
                      user?.role === 'SELLER' ? 'Người bán' : 
                      (user?.role || 'Thành viên');

  // Provide fallback for completion (mock value)
  const completionPercentage = '75%';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Header Profile Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full -translate-y-1/2 translate-x-1/3 opacity-50 pointer-events-none"></div>
        
        <div className="w-24 h-24 rounded-full bg-slate-100 overflow-hidden flex-shrink-0 flex items-center justify-center border-4 border-white shadow-lg z-10">
          {user?.avatarURL ? (
            <img src={user.avatarURL} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#2e3d83] to-[#1e293b] flex items-center justify-center text-white text-3xl font-bold">
              {initials}
            </div>
          )}
        </div>
        
        <div className="flex-1 text-center sm:text-left z-10">
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">{fullName}</h1>
          <p className="text-slate-500 mt-1 flex items-center justify-center sm:justify-start gap-2">
            <Mail size={16} /> 
            {user?.email || tp('myProfile.noEmail')}
          </p>
          
          <div className="mt-4 flex flex-wrap items-center justify-center sm:justify-start gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 text-sm font-semibold rounded-full border border-green-200">
              <ShieldCheck size={16} />
              {roleDisplay}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 text-sm font-semibold rounded-full border border-blue-200">
              Trạng thái: Hoạt động
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Personal Details (Col-span 2) */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h2 className="text-lg font-bold text-slate-800">Thông tin cá nhân</h2>
            <Link to="/user/profile/edit" className="text-sm font-bold text-[#2e3d83] hover:text-[#ffcb23] transition-colors px-3 py-1.5 hover:bg-slate-100 rounded-lg">
              Chỉnh sửa
            </Link>
          </div>
          <div className="p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-12">
              <div className="flex flex-col gap-1.5">
                <span className="text-sm text-slate-400 font-medium">Họ và tên</span>
                <strong className="text-slate-800 font-bold text-[15px]">{fullName}</strong>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-sm text-slate-400 font-medium">Địa chỉ Email</span>
                <strong className="text-slate-800 font-bold text-[15px]">{user?.email || '—'}</strong>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-sm text-slate-400 font-medium flex items-center gap-1.5">
                  <Phone size={14} /> Số điện thoại
                </span>
                <strong className="text-slate-800 font-bold text-[15px]">
                  {/* @ts-expect-error fallback property */}
                  {user?.phone || user?.phoneNumber || <span className="text-slate-300 italic">Chưa cập nhật</span>}
                </strong>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-sm text-slate-400 font-medium flex items-center gap-1.5">
                  <Calendar size={14} /> Ngày sinh
                </span>
                <strong className="text-slate-800 font-bold text-[15px]">
                  {/* @ts-expect-error fallback property */}
                  {user?.birthdate || user?.dob || user?.dateOfBirth || <span className="text-slate-300 italic">Chưa cập nhật</span>}
                </strong>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-sm text-slate-400 font-medium font-bold text-[#2e3d83]">Số căn cước công dân</span>
                <strong className="text-slate-800 font-bold text-[15px]">
                  {/* @ts-expect-error fallback property */}
                  {user?.identityNumber || <span className="text-slate-300 italic">Chưa xác thực</span>}
                </strong>
              </div>
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <span className="text-sm text-slate-400 font-medium flex items-center gap-1.5">
                  <MapPin size={14} /> Địa chỉ liên lạc
                </span>
                <strong className="text-slate-800 font-bold text-[15px]">
                  {/* @ts-expect-error fallback property */}
                  {user?.address || <span className="text-slate-300 italic">Chưa cập nhật</span>}
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Completion / Security Widget */}
        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h3 className="text-base font-bold text-slate-800 mb-4">{tp('myProfile.completionTitle', 'Độ hoàn thiện hồ sơ')}</h3>
            
            <div className="flex items-end justify-between mb-2">
              <span className="text-2xl font-black text-[#2e3d83]">{completionPercentage}</span>
            </div>
            
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden mb-4">
              <div 
                className="h-full bg-gradient-to-r from-[#2e3d83] to-[#4f6bcd] rounded-full"
                style={{ width: completionPercentage }}
              />
            </div>
            
            <p className="text-sm font-medium text-slate-500 leading-relaxed">
              Cập nhật thêm số điện thoại và địa chỉ để tham gia đấu giá nhanh chóng hơn.
            </p>
          </div>

          <div className="bg-slate-800 rounded-2xl p-6 text-white relative overflow-hidden shadow-lg shadow-slate-900/20">
            <div className="relative z-10">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center mb-4">
                <ShieldCheck size={20} className="text-[#ffcb23]" />
              </div>
              <h3 className="text-base font-bold mb-2">Bảo mật tài khoản</h3>
              <p className="text-sm text-slate-300 mb-4">
                Đổi mật khẩu định kỳ giúp tài khoản của bạn an toàn hơn trên hệ thống.
              </p>
              <Link to="/user/profile/change-password" className="block w-full py-2 bg-white/10 hover:bg-white/20 transition-colors font-semibold text-sm rounded-lg text-white text-center">
                Đổi mật khẩu
              </Link>
            </div>
            {/* Absolute decorative circle */}
            <div className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full border-4 border-white/5 pointer-events-none"></div>
          </div>
        </div>

      </div>
    </div>
  );
};
