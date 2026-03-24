import React from 'react';
import { Link } from 'react-router-dom';
import { usePageI18n } from '../../../i18n/usePageI18n';
import { ArrowRight } from 'lucide-react';

const RegisterBanner: React.FC = () => {
  const { tp } = usePageI18n();

  return (
    <section className="w-full py-24 pb-32 px-4 flex justify-center bg-white border-t border-slate-100">
      <div className="w-full max-w-6xl rounded-[2.5rem] bg-gradient-to-br from-[#1e293b] to-[#2e3d83] shadow-2xl overflow-hidden relative flex flex-col md:flex-row items-center justify-between">
        
        {/* Decor Pattern */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>

        {/* Content Block */}
        <div className="relative z-10 w-full md:w-1/2 p-10 sm:p-14 lg:p-20 flex flex-col items-center md:items-start text-center md:text-left">
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white leading-[1.2] mb-6 tracking-tight">
            {tp('registerBanner.title') || 'Đăng Ký Đấu Giá Ngay Hôm Nay'}
          </h2>
          
          <p className="text-blue-100/90 text-[17px] sm:text-lg mb-10 max-w-lg leading-relaxed font-medium">
            {tp('registerBanner.description') || 'Hàng nghìn người đã mua được siêu xe với mức giá không tưởng. Tham gia cộng đồng của chúng tôi ngay.'}
          </p>

          {/* Form Group */}
          <div className="flex flex-col sm:flex-row w-full max-w-lg bg-white/10 backdrop-blur-md p-1.5 rounded-full border border-white/20 shadow-xl focus-within:ring-4 focus-within:ring-white/10 transition-all">
            <input 
              type="email" 
              placeholder={tp('registerBanner.emailPlaceholder') || 'Nhập địa chỉ email...'} 
              className="flex-1 bg-transparent border-none outline-none text-white placeholder-blue-200 px-6 py-4 text-base font-medium"
            />
            <Link 
              to="/register"
              className="bg-[#f4c23d] hover:bg-[#ffcf4c] text-slate-900 px-8 py-4 sm:py-0 rounded-full font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 mt-2 sm:mt-0 active:scale-95 shadow-lg group whitespace-nowrap"
            >
              {tp('registerBanner.registerNow') || 'Tham Gia Bidding'}
              <ArrowRight size={18} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

        </div>

        {/* Image Display */}
        <div className="relative z-10 w-full md:w-1/2 h-64 md:h-full min-h-[400px]">
          <img 
            src="https://images.unsplash.com/photo-1542281286-9e0a16bb7366?auto=format&fit=crop&w=1000&q=80" 
            alt={tp('registerBanner.carPlaceholderAlt') || 'Siêu xe thể thao'} 
            className="absolute inset-0 w-full h-full object-cover object-center clip-image md:rounded-l-3xl shadow-[-10px_0_30px_rgba(0,0,0,0.5)]" 
          />
        </div>
        
      </div>
    </section>
  );
};

export default RegisterBanner;

