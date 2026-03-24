import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, Facebook, Youtube, Instagram, MapPin, ArrowRight, Gavel } from 'lucide-react';

export const FooterTopBar: React.FC = () => {
  return (
    <footer className="w-full bg-[#1e293b] pt-20 pb-10 border-t-4 border-[#f4c23d] text-slate-300">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        
        {/* TOP ROW: 4 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Col 1: Brand & Socials */}
          <div className="flex flex-col">
            <Link to="/" className="flex items-center gap-2 mb-6 group">
              <div className="flex items-center justify-center w-12 h-12 bg-white/10 rounded-xl backdrop-blur-md group-hover:bg-[#f4c23d] transition-colors">
                <Gavel className="text-white group-hover:text-slate-900 transition-colors" size={24} strokeWidth={2.5} />
              </div>
              <span className="text-white font-black text-2xl tracking-wide">Vehicle Auction</span>
            </Link>
            <p className="text-slate-400 font-medium leading-relaxed mb-6">
              Nền tảng đấu giá trực tuyến xe chuyên nghiệp số 1 tại Việt Nam. Minh bạch, uy tín và định chuẩn chất lượng cho từng giao dịch.
            </p>
            <div className="flex items-center gap-3">
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#2e3d83] hover:text-white transition-colors text-slate-400">
                <Facebook size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#2e3d83] hover:text-white transition-colors text-slate-400">
                <Youtube size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#2e3d83] hover:text-white transition-colors text-slate-400">
                <Instagram size={18} />
              </a>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="flex flex-col">
            <h4 className="text-white font-bold text-lg mb-6 uppercase tracking-wider">Khám Phá</h4>
            <ul className="space-y-4 font-medium">
              <li><Link to="/auctions" className="hover:text-[#f4c23d] transition-colors flex items-center gap-2"><ArrowRight size={14} /> Tất cả Đấu Giá</Link></li>
              <li><Link to="/auctions" className="hover:text-[#f4c23d] transition-colors flex items-center gap-2"><ArrowRight size={14} /> Xe Sắp Mở Bán</Link></li>
              <li><Link to="/about" className="hover:text-[#f4c23d] transition-colors flex items-center gap-2"><ArrowRight size={14} /> Về Chúng Tôi</Link></li>
              <li><Link to="/contact" className="hover:text-[#f4c23d] transition-colors flex items-center gap-2"><ArrowRight size={14} /> Liên Hệ Hỗ Trợ</Link></li>
            </ul>
          </div>

          {/* Col 3: Support */}
          <div className="flex flex-col">
            <h4 className="text-white font-bold text-lg mb-6 uppercase tracking-wider">Quy Định</h4>
            <ul className="space-y-4 font-medium">
              <li><a href="#" className="hover:text-[#f4c23d] transition-colors flex items-center gap-2"><ArrowRight size={14} /> Hướng Dẫn Mua Xe</a></li>
              <li><a href="#" className="hover:text-[#f4c23d] transition-colors flex items-center gap-2"><ArrowRight size={14} /> Điều Khoản Dịch Vụ</a></li>
              <li><a href="#" className="hover:text-[#f4c23d] transition-colors flex items-center gap-2"><ArrowRight size={14} /> Chính Sách Bảo Mật</a></li>
              <li><a href="#" className="hover:text-[#f4c23d] transition-colors flex items-center gap-2"><ArrowRight size={14} /> Chính Sách Hoàn Tiền</a></li>
            </ul>
          </div>

          {/* Col 4: Contact Info */}
          <div className="flex flex-col">
            <h4 className="text-white font-bold text-lg mb-6 uppercase tracking-wider">Thông Tin Liên Hệ</h4>
            <ul className="space-y-5 font-medium">
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0">
                  <MapPin size={16} className="text-[#f4c23d]" />
                </div>
                <span className="leading-relaxed">123 Đường Ngọc Khánh<br/>Ba Đình, Hà Nội</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0">
                  <Phone size={16} className="text-[#f4c23d]" />
                </div>
                <span>+84 (024) 1234 5678</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0">
                  <Mail size={16} className="text-[#f4c23d]" />
                </div>
                <span>support@vehicle-auction.vnn</span>
              </li>
            </ul>
          </div>

        </div>

        {/* BOTTOM ROW: Copyright */}
        <div className="pt-8 border-t border-slate-700/50 flex flex-col md:flex-row items-center justify-between text-sm font-medium">
          <p>© {new Date().getFullYear()} Vehicle Auction. All rights reserved.</p>
          <div className="flex items-center gap-4 mt-4 md:mt-0">
             <span className="opacity-50">Phương thức thanh toán:</span>
             <div className="flex gap-2">
               <div className="w-10 h-6 bg-white/10 rounded"></div>
               <div className="w-10 h-6 bg-white/10 rounded"></div>
               <div className="w-10 h-6 bg-white/10 rounded"></div>
             </div>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default FooterTopBar;
