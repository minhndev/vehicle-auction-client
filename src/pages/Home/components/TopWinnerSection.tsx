import React, { useEffect, useState } from 'react';
import { ShoppingBag, ChevronLeft, ChevronRight } from 'lucide-react';
import { auctionApi } from '../../../features/bidding/api/auctionApi';
import type { AuctionResponse } from '../../../types';

interface Winner {
  id: string;
  name: string;
  image: string;
  wins: number;
  totalValue: number;
}

const maskId = (value: string) => {
  if (value.length <= 6) return value;
  return `${value.slice(0, 3)}***${value.slice(-3)}`;
};

const formatVND = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(Math.max(0, amount));
};

const toAvatarUrl = (name: string) => {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=2E3D83&color=ffffff&size=240`;
};

const normalizeWinners = (auctions: AuctionResponse[]): Winner[] => {
  const winnerMap = new Map<string, Winner>();

  auctions.forEach((item) => {
    const winnerId = String(item.winnerId ?? item.winnerEmail ?? '').trim();
    const winnerName = String(item.winnerName ?? item.winnerUsername ?? item.winnerEmail ?? '').trim();
    if (!winnerId || !winnerName) return;

    const existing = winnerMap.get(winnerId);
    const amount = Number(item.currentPrice ?? item.startPrice ?? 0);

    if (existing) {
      existing.wins += 1;
      existing.totalValue += Number.isFinite(amount) ? Math.max(0, amount) : 0;
      return;
    }

    winnerMap.set(winnerId, {
      id: winnerId,
      name: winnerName,
      image: toAvatarUrl(winnerName),
      wins: 1,
      totalValue: Number.isFinite(amount) ? Math.max(0, amount) : 0,
    });
  });

  return Array.from(winnerMap.values())
    .sort((a, b) => {
      if (b.wins !== a.wins) return b.wins - a.wins;
      return b.totalValue - a.totalValue;
    })
    .slice(0, 4);
};

const TopWinnerCard: React.FC<{ data: Winner }> = ({ data }) => {
  return (
    <div className="relative flex flex-col items-center group w-64 pb-8">
      <div className="w-full aspect-[2.5/4] rounded-full border-8 border-white bg-slate-100 shadow-xl overflow-hidden relative transform transition-all duration-500 group-hover:-translate-y-4 group-hover:shadow-3xl group-hover:border-[#2e3d83]/10">
        <img 
          src={data.image} 
          alt={data.name} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
        />
        <div className="absolute inset-x-0 bottom-0 py-8 px-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col items-center text-center">
          <h3 className="text-white font-black text-xl mb-1 truncate w-full px-2">{data.name}</h3>
          <p className="text-white/80 text-sm font-medium tracking-wide">{maskId(data.id)}</p>
          <div className="mt-3 bg-[#f4c23d] text-slate-900 text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
            {formatVND(data.totalValue)}
          </div>
          <div className="text-white text-xs mt-2 opacity-75 font-semibold">{data.wins} Lần Thắng</div>
        </div>
      </div>
      
      {/* Floating Action Badge */}
      <button className="absolute bottom-2 w-16 h-16 bg-white rounded-full shadow-2xl flex items-center justify-center border border-slate-100 text-[#2e3d83] transition-all transform hover:scale-110 hover:bg-[#2e3d83] hover:text-white z-10">
        <ShoppingBag size={24} strokeWidth={2.5} />
      </button>
    </div>
  );
};

const TopWinnerSection: React.FC = () => {
  const [winners, setWinners] = useState<Winner[]>([]);

  useEffect(() => {
    let mounted = true;

    const fetchTopWinners = async () => {
      try {
        const page = await auctionApi.getPublicAuctions({ status: 'COMPLETED', page: 0, size: 30, sort: 'updatedAt,desc' });
        const completedAuctions = Array.isArray(page?.content) ? page.content : [];
        if (!mounted) return;
        setWinners(normalizeWinners(completedAuctions));
      } catch {
        if (!mounted) return;
        setWinners([]);
      }
    };

    fetchTopWinners();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section className="w-full bg-slate-50 py-24 pb-32 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 flex flex-col items-center">
        
        {/* Header Title */}
        <div className="flex flex-col items-center text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold text-[#2e3d83] mb-6 tracking-tight">
            Người Thắng <span className="text-[#f4c23d]">Nổi Bật</span>
          </h2>
          <div className="flex items-center justify-center relative w-64 h-8 mb-4">
            <div className="absolute inset-0 top-1/2 -translate-y-1/2 h-0.5 bg-slate-300"></div>
            <div className="w-8 h-8 rounded-full bg-slate-900 relative z-10 shadow-md"></div>
          </div>
        </div>

        {/* Carousel Content */}
        <div className="flex w-full items-center justify-center gap-4 lg:gap-8">
          <button className="hidden md:flex flex-shrink-0 w-14 h-14 bg-white rounded-full shadow-lg border border-slate-100 items-center justify-center text-slate-400 hover:text-[#2e3d83] hover:scale-110 transition-all">
            <ChevronLeft size={28} />
          </button>

          <div className="flex flex-wrap justify-center gap-6 lg:gap-10">
            {winners.length === 0 ? (
              <p className="py-20 text-slate-500 font-bold">Đang tải dữ liệu người thắng...</p>
            ) : (
              winners.map((winner) => (
                <TopWinnerCard key={winner.id} data={winner} />
              ))
            )}
          </div>

          <button className="hidden md:flex flex-shrink-0 w-14 h-14 bg-white rounded-full shadow-lg border border-slate-100 items-center justify-center text-slate-400 hover:text-[#2e3d83] hover:scale-110 transition-all">
            <ChevronRight size={28} />
          </button>
          
        </div>

      </div>
    </section>
  );
};

export default TopWinnerSection;

