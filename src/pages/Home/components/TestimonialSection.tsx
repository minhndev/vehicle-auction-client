import React, { useEffect, useState } from 'react';
import { Star, Quote } from 'lucide-react';
import { auctionApi } from '../../../features/bidding/api/auctionApi';
import type { AuctionResponse } from '../../../types';

interface Testimonial {
  id: string;
  name: string;
  role: string;
  feedback: string;
  image: string;
}

const formatVND = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(Math.max(0, amount));
};

const toAvatarUrl = (name: string) => {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0F172A&color=ffffff&size=220`;
};

const toTestimonials = (completedAuctions: AuctionResponse[]): Testimonial[] => {
  return completedAuctions
    .filter((item) => item.winnerName || item.winnerUsername || item.winnerEmail)
    .slice(0, 3)
    .map((item, index) => {
      const winnerName = String(item.winnerName ?? item.winnerUsername ?? item.winnerEmail ?? `Người thắng ${index + 1}`);
      const auctionName = item.productName ?? 'phiên đấu giá';
      const price = Number(item.currentPrice ?? item.startPrice ?? 0);

      return {
        id: String(item.id ?? index),
        name: winnerName,
        role: `Người thắng #${index + 1}`,
        feedback: `Tôi đã thắng ${auctionName} với mức giá ${formatVND(price)}. Hệ thống đấu giá tự động rất minh bạch, giao diện thân thiện và hỗ trợ nhiệt tình.`,
        image: toAvatarUrl(winnerName),
      };
    });
};

const TestimonialCard: React.FC<{ data: Testimonial }> = ({ data }) => {
  return (
    <div className="bg-white p-8 rounded-3xl shadow-xl shadow-[#2e3d83]/5 border border-slate-100 relative group hover:-translate-y-2 transition-transform duration-300">
      <Quote className="absolute top-6 right-6 text-slate-100 group-hover:text-blue-50 transition-colors w-16 h-16 -z-0" />
      
      <div className="flex items-center gap-1 mb-6 relative z-10">
        {[...Array(5)].map((_, i) => (
          <Star key={i} size={20} className="fill-[#f4c23d] text-[#f4c23d]" />
        ))}
      </div>
      
      <p className="text-slate-600 text-lg leading-relaxed font-medium mb-8 relative z-10 min-h-[100px]">
        "{data.feedback}"
      </p>
      
      <div className="flex items-center gap-4 relative z-10 pt-6 border-t border-slate-100">
        <img
          src={data.image}
          alt={data.name}
          className="w-14 h-14 rounded-full border-2 border-slate-100 shadow-md group-hover:border-[#2e3d83] transition-colors"
        />
        <div>
          <h4 className="font-extrabold text-[#2e3d83] text-[17px] mb-0.5">
            {data.name}
          </h4>
          <span className="text-sm font-semibold text-slate-400">
            {data.role}
          </span>
        </div>
      </div>
    </div>
  );
};

const TestimonialSection: React.FC = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  useEffect(() => {
    let mounted = true;

    const fetchTestimonials = async () => {
      try {
        const page = await auctionApi.getPublicAuctions({ status: 'COMPLETED', page: 0, size: 12, sort: 'updatedAt,desc' });
        const completedAuctions = Array.isArray(page?.content) ? page.content : [];

        if (!mounted) return;
        setTestimonials(toTestimonials(completedAuctions));
      } catch {
        if (!mounted) return;
        setTestimonials([]);
      }
    };

    fetchTestimonials();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section className="w-full bg-[#f8fafc] py-24 pb-32 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col items-center text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold text-[#2e3d83] mb-6 tracking-tight">
            Khách Hàng <span className="text-[#f4c23d]">Nói Gì?</span>
          </h2>
          <div className="flex items-center justify-center relative w-64 h-8 mb-4">
            <div className="absolute inset-0 top-1/2 -translate-y-1/2 h-0.5 bg-slate-300"></div>
            <div className="w-8 h-8 rounded-full bg-slate-900 relative z-10 shadow-md"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.length === 0 ? (
            <div className="col-span-full py-20 text-center text-slate-500 font-bold bg-white rounded-3xl border border-slate-100 shadow-sm">
              Chưa có phản hồi từ người thắng phiên gần đây.
            </div>
          ) : (
            testimonials.map((item) => (
              <TestimonialCard key={item.id} data={item} />
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection;

