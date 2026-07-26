import React, { useState } from 'react';
import { MapPin, Phone, Mail, Send, ChevronDown } from 'lucide-react';

// MOCK DATA FOR THE CONTACT INFO CARDS
const CONTACT_INFO = [
  {
    id: 1,
    icon: MapPin,
    title: 'Trụ Sở Chính',
    details: '123 Đường Ngọc Khánh, Ba Đình, Hà Nội, Việt Nam',
    color: 'text-rose-500',
    bgHover: 'group-hover:bg-rose-50',
    iconBg: 'bg-rose-100',
  },
  {
    id: 2,
    icon: Phone,
    title: 'Đường Dây Nóng',
    details: '+84 (024) 1234 5678 \n +84 987 654 321',
    color: 'text-blue-500',
    bgHover: 'group-hover:bg-blue-50',
    iconBg: 'bg-blue-100',
  },
  {
    id: 3,
    icon: Mail,
    title: 'Hỗ Trợ',
    details: 'support@vehicle-auction.vnn \n contact@vehicle-auction.vn',
    color: 'text-amber-500',
    bgHover: 'group-hover:bg-amber-50',
    iconBg: 'bg-amber-100',
  },
];

export const Contact: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      alert('Yêu cầu của bạn đã được gửi thành công! Đội ngũ của chúng tôi sẽ liên hệ lại sớm nhất.');
    }, 1500);
  };

  return (
    <div className="w-full min-h-screen bg-slate-50 overflow-x-hidden pb-32">
      
      {/* 1. HERO SECTION */}
      <section className="relative w-full min-h-[400px] flex flex-col justify-center items-center pt-24 pb-20 px-4 bg-gradient-to-br from-[#1e293b] to-[#2e3d83] overflow-visible text-center">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-mamba.png')] opacity-20 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-50 to-transparent bottom-0"></div>
        
        <div className="relative z-10 w-full max-w-4xl mx-auto flex flex-col items-center">
          <div className="inline-flex items-center justify-center h-10 px-5 rounded-full mb-6 bg-white/20 backdrop-blur-md border border-white/20 text-[#f4c23d] text-sm font-black tracking-widest uppercase shadow-lg">
            Hỗ Trợ 24/7
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] tracking-tight drop-shadow-xl mb-6">
            Liên Hệ Với <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-200">Chúng Tôi</span>
          </h1>
          <p className="text-blue-100/90 text-[17px] sm:text-lg max-w-2xl leading-relaxed font-medium drop-shadow-md">
            Bạn có câu hỏi, đề xuất hay cần hỗ trợ về phiên đấu giá? Đội ngũ chuyên gia của chúng tôi luôn sẵn sàng hỗ trợ bạn bất cứ lúc nào.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 lg:px-8 mt-12">
        {/* 2. CONTACT INFO CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-10 -mt-24 mb-20 relative z-20">
          {CONTACT_INFO.map((item) => (
            <div key={item.id} className={`flex flex-col items-center text-center bg-white p-10 rounded-3xl shadow-xl shadow-[#2e3d83]/10 border border-slate-100 transition-all duration-300 transform hover:-translate-y-2 group ${item.bgHover}`}>
              <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-6 shadow-inner transition-colors duration-300 ${item.iconBg} group-hover:bg-white`}>
                <item.icon size={36} strokeWidth={1.5} className={item.color} />
              </div>
              <h3 className="text-xl font-extrabold text-slate-800 mb-4">{item.title}</h3>
              <p className="text-slate-500 font-medium whitespace-pre-line leading-relaxed">
                {item.details}
              </p>
            </div>
          ))}
        </div>

        {/* 3. SUBMIT REQUEST FORM SECTION */}
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-[#2e3d83]/10 border border-slate-100 overflow-hidden flex flex-col lg:flex-row">
          
          {/* Left: Illustration / Fancy Block */}
          <div className="w-full lg:w-5/12 bg-[#2e3d83] p-10 lg:p-14 relative flex flex-col justify-between overflow-hidden text-white min-h-[400px]">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80')] opacity-10 mix-blend-overlay object-cover"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-[#1e293b]/50 to-[#2e3d83]/90"></div>
            
            <div className="relative z-10 mb-10">
              <h2 className="text-3xl lg:text-4xl font-black mb-4">Gửi Yêu Cầu Cho Chúng Tôi!</h2>
              <p className="text-blue-100/90 text-lg leading-relaxed font-medium">
                Vui lòng điền đầy đủ thông tin vào biểu mẫu. Chúng tôi cam kết sẽ phản hồi bạn trong vòng 24 giờ làm việc.
              </p>
            </div>

            <div className="relative z-10 flex flex-col gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full border border-blue-400 flex items-center justify-center bg-white/10 backdrop-blur-sm">
                  <span className="text-xl">🏆</span>
                </div>
                <div>
                  <h4 className="font-bold text-white text-lg">Uy Tín & Chất Lượng</h4>
                  <p className="text-blue-200 text-sm">Top 1 Sàn Đấu Giá Xe</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full border border-blue-400 flex items-center justify-center bg-white/10 backdrop-blur-sm">
                  <span className="text-xl">🛡️</span>
                </div>
                <div>
                  <h4 className="font-bold text-white text-lg">Bảo Mật An Toàn</h4>
                  <p className="text-blue-200 text-sm">Hệ Thống Tiêu Chuẩn</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: The Form Component */}
          <div className="w-full lg:w-7/12 p-10 lg:p-14 bg-white/95 backdrop-blur-3xl min-h-[600px] flex flex-col justify-center">
            
            <form onSubmit={handleSubmit} className="w-full space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col">
                  <label className="text-slate-500 font-bold text-[13px] tracking-wider uppercase mb-2 ml-1">Họ và Tên</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="VD: Nguyễn Văn A..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-900 font-semibold focus:outline-none focus:ring-4 focus:ring-[#2e3d83]/10 focus:border-[#2e3d83] transition-all"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-slate-500 font-bold text-[13px] tracking-wider uppercase mb-2 ml-1">Số điện thoại</label>
                  <input 
                    type="tel" 
                    required 
                    placeholder="VD: 0987123456..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-900 font-semibold focus:outline-none focus:ring-4 focus:ring-[#2e3d83]/10 focus:border-[#2e3d83] transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col">
                  <label className="text-slate-500 font-bold text-[13px] tracking-wider uppercase mb-2 ml-1">Email liên hệ</label>
                  <input 
                    type="email" 
                    required 
                    placeholder="VD: example@gmail.com..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-900 font-semibold focus:outline-none focus:ring-4 focus:ring-[#2e3d83]/10 focus:border-[#2e3d83] transition-all"
                  />
                </div>
                <div className="flex flex-col relative">
                  <label className="text-slate-500 font-bold text-[13px] tracking-wider uppercase mb-2 ml-1">Chủ đề hỗ trợ</label>
                  <div className="relative">
                    <select required className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-900 font-semibold appearance-none cursor-pointer focus:outline-none focus:ring-4 focus:ring-[#2e3d83]/10 focus:border-[#2e3d83] transition-all">
                      <option value="" disabled selected>-- Chọn Vấn Đề --</option>
                      <option value="tech">Hỗ Trợ Kỹ Thuật & Tài Khoản</option>
                      <option value="payment">Thanh Toán & Tiền Cọc</option>
                      <option value="auction">Hướng Dẫn Đấu Giá</option>
                      <option value="other">Vấn Đề Khác</option>
                    </select>
                    <ChevronDown size={20} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="flex flex-col">
                <label className="text-slate-500 font-bold text-[13px] tracking-wider uppercase mb-2 ml-1">Nội dung yêu cầu</label>
                <textarea 
                  required 
                  rows={4} 
                  placeholder="Mô tả chi tiết vấn đề bạn đang gặp phải..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-900 font-semibold resize-none focus:outline-none focus:ring-4 focus:ring-[#2e3d83]/10 focus:border-[#2e3d83] transition-all leading-relaxed"
                />
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-[#2e3d83] hover:bg-[#22306e] text-white py-4 sm:py-5 rounded-2xl font-black text-lg tracking-wide transition-all duration-300 flex items-center justify-center gap-3 shadow-lg shadow-[#2e3d83]/20 hover:shadow-2xl hover:-translate-y-1 active:scale-95 disabled:opacity-70 disabled:pointer-events-none"
              >
                {isSubmitting ? 'ĐANG GỬI...' : 'GỬI YÊU CẦU NGAY'} 
                <Send size={20} strokeWidth={2.5} />
              </button>

            </form>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
