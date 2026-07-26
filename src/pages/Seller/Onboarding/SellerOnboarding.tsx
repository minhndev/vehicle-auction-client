import React, { useState } from 'react';
import { Briefcase, FileCheck, DollarSign, Send } from 'lucide-react';

const BENEFITS = [
  {
    id: 1,
    title: 'Gửi Yêu Cầu Đăng Ký',
    description: 'Điền thông tin doanh nghiệp hoặc cá nhân để chúng tôi xác thực hồ sơ năng lực.',
    icon: Briefcase,
  },
  {
    id: 2,
    title: 'Admin Xác Thực & Duyệt',
    description: 'Quy trình xét duyệt nhanh chóng 24h để đảm bảo các đối tác đều uy tín và chất lượng.',
    icon: FileCheck,
  },
  {
    id: 3,
    title: 'Bắt Đầu Đăng Xe',
    description: 'Truy cập bảng điều khiển Seller để tổ chức các phiên đấu giá và quản lý tài sản.',
    icon: DollarSign,
  },
];

export const SellerOnboarding: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API request to admin/request-seller
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 1500);
  };

  return (
    <div className="w-full min-h-screen bg-slate-50 overflow-x-hidden">
      
      {/* 1. HERO BANNER */}
      <section className="relative w-full pt-28 pb-32 px-4 flex flex-col items-center justify-center text-center bg-gradient-to-br from-[#1e293b] to-[#2e3d83] text-white">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-mamba.png')] opacity-10 mix-blend-overlay"></div>
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>

        <div className="relative z-10 w-full max-w-4xl flex flex-col items-center">
          <div className="inline-flex items-center justify-center h-10 px-5 rounded-full mb-6 bg-white/10 backdrop-blur-md border border-white/20 text-[#f4c23d] text-sm font-black tracking-widest uppercase">
            Hợp Tác Kinh Doanh
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.2] tracking-tight mb-8 drop-shadow-lg">
            Trở Thành <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-200">Đối Tác Bán Xe</span>
          </h1>
          <p className="text-blue-100/90 text-[17px] sm:text-lg max-w-2xl font-medium leading-relaxed">
            Tiếp cận hàng triệu khách hàng tiềm năng. Để đảm bảo chất lượng sàn đấu giá, mọi cá nhân/tổ chức cần được Admin cấp quyền Seller trước khi bắt đầu.
          </p>
        </div>
      </section>

      {/* 2. BENEFITS ROW */}
      <section className="max-w-7xl mx-auto px-4 -mt-16 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-10">
          {BENEFITS.map((item) => (
            <div key={item.id} className="bg-white p-10 rounded-3xl shadow-xl shadow-[#2e3d83]/10 border border-slate-100 flex flex-col items-center text-center group hover:-translate-y-2 transition-transform duration-300">
              <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mb-6 border border-slate-100 group-hover:bg-[#2e3d83] transition-colors duration-300">
                <item.icon size={28} className="text-[#2e3d83] group-hover:text-white transition-colors duration-300" strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">{item.title}</h3>
              <p className="text-slate-500 font-medium leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. REQUEST FORM */}
      <section className="max-w-4xl mx-auto px-4 py-24 pb-32">
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-[#2e3d83]/5 border border-slate-100 p-8 sm:p-14">
          
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold text-[#2e3d83] mb-4">Gửi Yêu Cầu Cấp Quyền</h2>
            <p className="text-slate-500 font-medium">Ban quản trị sẽ xem xét hồ sơ năng lực của bạn dựa trên thông tin dưới đây.</p>
          </div>

          {isSuccess ? (
             <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-10 text-center">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-600">
                  <FileCheck size={40} />
                </div>
                <h3 className="text-2xl font-bold text-emerald-800 mb-3">Gửi Yêu Cầu Thành Công!</h3>
                <p className="text-emerald-700 font-medium">Hồ sơ của bạn đã được gửi. Quản trị viên sẽ liên hệ lại qua số điện thoại/email đăng ký trong vòng 24h làm việc.</p>
             </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col">
                  <label className="text-slate-500 font-bold text-[13px] uppercase mb-2 ml-1">Loại hình</label>
                  <select required className="bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 font-semibold text-slate-800 focus:outline-none focus:ring-4 focus:ring-[#2e3d83]/10 focus:border-[#2e3d83]">
                    <option value="PERSONAL">Cá nhân (Cò xe, Môi giới)</option>
                    <option value="BUSINESS">Doanh nghiệp (Showroom, Đại lý)</option>
                  </select>
                </div>
                <div className="flex flex-col">
                  <label className="text-slate-500 font-bold text-[13px] uppercase mb-2 ml-1">Số CCCD / MST</label>
                  <input type="text" required placeholder="Nhập số CCCD hoặc Mã Số Thuế..." className="bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 font-semibold text-slate-800 focus:outline-none focus:ring-4 focus:ring-[#2e3d83]/10 focus:border-[#2e3d83]" />
                </div>
              </div>

              <div className="flex flex-col">
                <label className="text-slate-500 font-bold text-[13px] uppercase mb-2 ml-1">Lý do & Kinh nghiệm</label>
                <textarea 
                  required 
                  rows={4} 
                  placeholder="Mô tả sơ lược về kho xe, quy mô doanh nghiệp và kinh nghiệm bán xe của bạn để giúp Admin duyệt nhanh hơn..."
                  className="bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 font-semibold text-slate-800 focus:outline-none focus:ring-4 focus:ring-[#2e3d83]/10 focus:border-[#2e3d83] resize-none"
                />
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-[#f4c23d] hover:bg-[#ffcf4c] text-slate-900 py-4 sm:py-5 rounded-2xl font-black text-lg uppercase tracking-wide transition-all duration-300 flex items-center justify-center gap-3 shadow-lg shadow-[#f4c23d]/20 hover:shadow-2xl hover:-translate-y-1 active:scale-95 disabled:opacity-70"
              >
                {isSubmitting ? 'ĐANG GỬI HỒ SƠ...' : 'GỬI YÊU CẦU CẤP QUYỀN'} 
                <Send size={20} strokeWidth={2.5} />
              </button>
            </form>
          )}

        </div>
      </section>

    </div>
  );
};
