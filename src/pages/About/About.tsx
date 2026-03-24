import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Target, TrendingUp, CheckCircle2, Award, Clock } from 'lucide-react';

const teamMembers = [
  { name: 'Nguyen Hoang', role: 'Trưởng bộ phận đấu giá', years: '12 năm kinh nghiệm' },
  { name: 'Tran Minh', role: 'Giám đốc thẩm định phương tiện', years: '9 năm kinh nghiệm' },
  { name: 'Le Anh', role: 'Trưởng vận hành nền tảng', years: '8 năm kinh nghiệm' },
];

const milestones = [
  { year: '2018', title: 'Khởi Nguyên', detail: 'Nền tảng Vehicle Auction ra mắt với quy trình xác minh người bán minh bạch.' },
  { year: '2021', title: 'Đột Phá Kỹ Thuật', detail: 'Triển khai đấu giá thời gian thực và cảnh báo trên di động.' },
  { year: '2024', title: 'Mở Rộng Quy Mô', detail: 'Mở rộng giao nhận toàn quốc và nâng cấp cơ chế bảo vệ người mua.' },
];

export const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-24">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 to-[#2e3d83] text-white py-24 lg:py-32 flex flex-col items-center text-center px-4">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 pointer-events-none"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-slate-900/50 pointer-events-none"></div>
        
        <div className="relative z-10 max-w-4xl mx-auto">
          <p className="text-[#f4c23d] font-bold tracking-widest uppercase mb-4 text-sm drop-shadow-sm">Về Vehicle Auction</p>
          <h1 className="text-white text-4xl md:text-5xl lg:text-7xl font-extrabold mb-8 leading-tight tracking-tight drop-shadow-md">
            Mua xe chất lượng đỉnh cao <br className="hidden md:block"/> an toàn &amp; tốc độ
          </h1>
          <p className="text-blue-50 text-lg md:text-2xl mb-12 max-w-3xl mx-auto leading-relaxed font-medium drop-shadow-sm">
            Chúng tôi kết hợp thẩm định minh bạch, người bán độc lập đã xác minh và công nghệ đấu giá thời gian thực để tạo ra sự khác biệt.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/auctions" className="w-full sm:w-auto px-8 py-4 bg-[#f4c23d] hover:bg-[#e0bc27] text-slate-900 font-extrabold rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 text-center tracking-wide">
              Xem Các Phiên Đang Mở
            </Link>
            <Link to="/register" className="w-full sm:w-auto px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-extrabold rounded-xl backdrop-blur-md transition-all text-center tracking-wide">
              Đăng Ký Thành Viên
            </Link>
          </div>
        </div>
      </section>

      {/* Mission & Features */}
      <section className="max-w-6xl mx-auto px-4 -mt-16 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Mission Card */}
          <article className="bg-white rounded-3xl p-8 lg:p-10 shadow-xl border border-slate-100 flex flex-col h-full hover:-translate-y-1 transition-transform duration-300">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 text-[#2e3d83]">
              <Target size={32} strokeWidth={2.5} />
            </div>
            <h2 className="text-2xl font-extrabold text-[#2e3d83] mb-4">Sứ mệnh cốt lõi</h2>
            <p className="text-slate-600 leading-relaxed font-medium text-lg">
              Minh bạch và tối ưu hóa giao dịch phương tiện bằng cách cung cấp cho người mua 
              đầy đủ thông tin chi tiết về lịch sử, nguồn gốc và sức mạnh công lý trên nền tảng số hóa tự động.
            </p>
          </article>

          {/* Features Card */}
          <article className="bg-[#2e3d83] rounded-3xl p-8 lg:p-10 shadow-2xl border border-[#2e3d83] flex flex-col h-full text-white hover:-translate-y-1 transition-transform duration-300 overflow-hidden relative">
            <div className="absolute -right-8 -top-8 text-blue-900/30">
              <ShieldCheck size={180} />
            </div>
            <div className="relative z-10">
              <h2 className="text-2xl font-extrabold text-[#f4c23d] mb-6">Điểm khác biệt</h2>
              <ul className="space-y-6">
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[#f4c23d]/20 flex items-center justify-center mr-4 mt-0.5 text-[#f4c23d]">
                    <CheckCircle2 size={18} strokeWidth={3} />
                  </span>
                  <span className="text-blue-50 font-semibold text-lg">Báo cáo kiểm định 120 điểm độc lập cho từng xe</span>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[#f4c23d]/20 flex items-center justify-center mr-4 mt-0.5 text-[#f4c23d]">
                    <TrendingUp size={18} strokeWidth={3} />
                  </span>
                  <span className="text-blue-50 font-semibold text-lg">Hệ thống Live-Bidding chốt giá theo milli-giây</span>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[#f4c23d]/20 flex items-center justify-center mr-4 mt-0.5 text-[#f4c23d]">
                    <ShieldCheck size={18} strokeWidth={3} />
                  </span>
                  <span className="text-blue-50 font-semibold text-lg">Hỗ trợ ký quỹ đảm bảo &amp; Thanh toán trung gian VNPay</span>
                </li>
              </ul>
            </div>
          </article>
        </div>
      </section>

      {/* Milestones */}
      <section className="max-w-4xl mx-auto px-4 py-24">
        <div className="text-center mb-20">
          <h2 className="text-4xl font-extrabold text-slate-900 mb-4">Cột mốc phát triển</h2>
          <p className="text-slate-500 font-medium text-lg max-w-2xl mx-auto">
            Xây dựng và cải tiến liên tục dựa trên sự thành công của hàng nghìn đối tác định giá toàn quốc.
          </p>
        </div>
        
        <div className="relative pl-8 md:pl-0">
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-1 bg-slate-200 transform -translate-x-1/2 rounded-full" aria-hidden="true"></div>
          <div className="md:hidden absolute left-4 top-0 bottom-0 w-1 bg-slate-200 rounded-full" aria-hidden="true"></div>
          
          <div className="space-y-12">
            {milestones.map((milestone, index) => (
              <article key={milestone.year} className={`relative flex flex-col md:flex-row items-center ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                <div className="hidden md:flex flex-1"></div>
                
                <div className="absolute left-[-24px] md:left-1/2 w-12 h-12 rounded-full bg-white border-[6px] border-[#2e3d83] flex items-center justify-center transform md:-translate-x-1/2 z-10 shadow-lg shadow-[#2e3d83]/20">
                  <Award size={20} className="text-[#2e3d83]" />
                </div>
                
                <div className="flex-1 bg-white p-8 rounded-3xl shadow-md border border-slate-100 ml-8 md:ml-0 md:mx-10 relative overflow-visible hover:shadow-xl hover:-translate-y-1 transition-all">
                  <div className={`hidden md:block absolute top-1/2 w-4 h-4 bg-white border-t border-r border-slate-100 transform -translate-y-1/2 ${index % 2 === 0 ? '-left-2 -rotate-[135deg]' : '-right-2 rotate-45'}`}></div>
                  
                  <span className="inline-block px-4 py-1.5 bg-[#f4c23d]/20 text-amber-800 text-sm font-black tracking-widest uppercase rounded-full mb-3">{milestone.year}</span>
                  <h3 className="text-2xl font-bold text-[#2e3d83] mb-2">{milestone.title}</h3>
                  <p className="text-slate-600 font-medium leading-relaxed">{milestone.detail}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Team Grid */}
      <section className="bg-white py-24 border-t border-slate-200">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-slate-900 mb-4">Ban điều hành</h2>
            <p className="text-slate-500 font-medium text-lg max-w-2xl mx-auto">
              Hội tụ các chuyên gia cấp cao từng giữ vai trò chủ chốt ở các tập đoàn TMĐT lớn.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamMembers.map((member) => (
              <article key={member.name} className="bg-slate-50 rounded-[2rem] p-10 text-center border-2 border-transparent hover:border-blue-100 hover:bg-white hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group">
                <div className="w-28 h-28 mx-auto bg-gradient-to-br from-[#2e3d83] to-blue-600 text-white rounded-full flex items-center justify-center text-4xl font-black shadow-lg mb-8 group-hover:scale-110 group-hover:shadow-blue-500/30 transition-all duration-300">
                  {member.name.charAt(0)}
                </div>
                <h3 className="text-2xl font-extrabold text-slate-900 mb-1">{member.name}</h3>
                <p className="text-[#2e3d83] font-bold mb-4">{member.role}</p>
                <div className="inline-flex items-center text-sm text-slate-600 font-semibold bg-slate-200/70 px-4 py-1.5 rounded-full">
                  <Clock size={16} className="mr-2 text-slate-500" />
                  {member.years}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
      
    </div>
  );
};
