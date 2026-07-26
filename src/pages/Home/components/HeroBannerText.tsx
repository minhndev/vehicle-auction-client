import React from 'react';

export const HeroBannerText: React.FC = () => {
  return (
    <div className="w-full max-w-2xl font-sans text-center md:text-left">
      <div className="inline-flex items-center justify-center min-h-[45px] px-6 rounded-xl mb-8 bg-white/20 backdrop-blur-md border border-white/30 text-[#f4c23d] text-sm font-black tracking-[0.15em] uppercase shadow-lg">
        Lựa Chọn Hàng Đầu
      </div>

      <h1 className="m-0 mb-6 text-white font-extrabold text-5xl md:text-6xl lg:text-7xl leading-[1.1] tracking-tight drop-shadow-xl">
        Tìm Kiếm Siêu Xe <br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-200">Trong Mơ Của Bạn</span>
      </h1>

      <p className="m-0 text-blue-50 text-xl leading-relaxed font-medium drop-shadow-md max-w-xl mx-auto md:mx-0">
        Khám phá các ưu đãi độc quyền trên những phương tiện cao cấp đã qua kiểm định. Bắt đầu phiên đấu giá thời gian thực ngay hôm nay.
      </p>
    </div>
  );
};

