import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { AuctionResponse } from '../../../types';
import { useCountdown } from '../../../hooks/useCountdown';
import { getAuctionList, getUpcomingAuctions } from './homeDataService';

const PLACEHOLDER_CAR_IMAGE = 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80';

const formatVND = (amount?: number) => {
  if (amount == null) return '—';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
};

// --- SUB-COMPONENTS ---
const LiveAuctionCard: React.FC<{ data: AuctionResponse; isLiveTab: boolean }> = ({ data, isLiveTab }) => {
  const countdown = useCountdown((isLiveTab ? data.endTime : data.startTime) ?? '');

  const timeText = countdown
    ? `${String(countdown.hours).padStart(2,'0')}:${String(countdown.minutes).padStart(2,'0')}:${String(countdown.seconds).padStart(2,'0')}`
    : isLiveTab
      ? 'Đã kết thúc'
      : 'Sắp bắt đầu';

  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-lg border border-slate-100 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 flex flex-col group relative">
      {/* Absolute Badges */}
      <div className="absolute top-4 left-4 z-10">
        <div className={`px-3 py-1.5 rounded-full text-xs font-black tracking-widest uppercase flex items-center shadow-md ${isLiveTab ? 'bg-red-500 text-white' : 'bg-[#f4c23d] text-slate-900'}`}>
          {isLiveTab && <span className="w-2 h-2 bg-white rounded-full animate-pulse mr-2"></span>}
          {isLiveTab ? 'ĐANG ĐẤU GIÁ' : 'SẮP DIỄN RA'}
        </div>
      </div>

      <div className="relative h-60 w-full overflow-hidden bg-slate-200">
        <img 
          src={PLACEHOLDER_CAR_IMAGE} 
          alt={data.productName ?? 'Xe đấu giá'} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
        />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent"></div>
      </div>

      <div className="flex flex-col flex-1 p-6 relative">
        <h3 className="text-xl font-extrabold text-[#2e3d83] mb-4 line-clamp-2 min-h-[56px]">
          {data.productName ?? 'Phiên đấu giá'}
        </h3>

        <div className="flex items-center justify-between mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <div className="flex flex-col">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">Giá hiện tại</span>
            <span className="text-lg font-black text-slate-900">{formatVND(data.currentPrice ?? data.startPrice)}</span>
          </div>
          <div className="w-px h-10 bg-slate-200 mx-2"></div>
          <div className="flex flex-col text-right">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">Tiền cọc</span>
            <span className="text-lg font-bold text-slate-700">{formatVND(data.depositAmount)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <span className="text-sm font-semibold text-slate-500">{isLiveTab ? 'Kết thúc trong:' : 'Bắt đầu trong:'}</span>
          <span className="text-lg font-black text-red-500 tracking-wider bg-red-50 px-3 py-1 rounded-lg border border-red-100">
            {timeText}
          </span>
        </div>

        <Link 
          to={`/auctions/${data.id}`} 
          className="w-full py-4 text-center rounded-xl font-bold transition-all bg-[#2e3d83] hover:bg-[#1a2352] text-white shadow-md shadow-blue-900/20 active:scale-95"
        >
          Tham Gia Ngay
        </Link>
      </div>
    </div>
  );
};

export const LiveAuction: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'live' | 'upcoming'>('live');
  const [liveAuctions, setLiveAuctions] = useState<AuctionResponse[]>([]);
  const [upcomingAuctions, setUpcomingAuctions] = useState<AuctionResponse[]>([]);

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        const [livePage, upcomingPage] = await Promise.all([
          getAuctionList({ status: 'ACTIVE', page: 0, size: 4, sort: 'currentPrice,desc' }),
          getUpcomingAuctions(4),
        ]);

        if (!mounted) return;
        setLiveAuctions(livePage);
        setUpcomingAuctions(upcomingPage);
      } catch {
        if (!mounted) return;
        setLiveAuctions([]);
        setUpcomingAuctions([]);
      }
    };

    fetchData();
    return () => {
      mounted = false;
    };
  }, []);

  const currentList = useMemo(
    () => (activeTab === 'live' ? liveAuctions : upcomingAuctions),
    [activeTab, liveAuctions, upcomingAuctions],
  );

  return (
    <section className="w-full bg-gradient-to-b from-slate-50 to-slate-100 py-24 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4">
        
        <div className="flex flex-col items-center text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold text-[#2e3d83] mb-6 tracking-tight">
            Phiên Đấu Giá <span className="text-[#f4c23d]">Sôi Động</span>
          </h2>
          <div className="flex items-center justify-center relative w-64 h-8 mb-4">
            <div className="absolute inset-0 top-1/2 -translate-y-1/2 h-0.5 bg-slate-300"></div>
            <div className="w-8 h-8 rounded-full bg-[#f4c23d] relative z-10 shadow-md"></div>
          </div>
        </div>

        {/* Custom Tabs */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex bg-slate-200/60 backdrop-blur-md rounded-full p-2 relative shadow-inner">
            <button
              className={`relative z-10 px-8 py-3 rounded-full font-bold text-sm md:text-base uppercase tracking-widest transition-all duration-300 ${activeTab === 'live' ? 'text-white shadow-lg' : 'text-slate-500 hover:text-slate-800'}`}
              onClick={() => setActiveTab('live')}
            >
              {activeTab === 'live' && <span className="absolute inset-0 bg-[#2e3d83] rounded-full -z-10 shadow-[0_4px_12px_rgba(46,61,131,0.3)]"></span>}
              <span className="flex items-center">
                <span className={`w-2 h-2 rounded-full mr-2 ${activeTab === 'live' ? 'bg-red-400 animate-pulse' : 'bg-transparent'}`}></span>
                Đang diễn ra
              </span>
            </button>
            <button
              className={`relative z-10 px-8 py-3 rounded-full font-bold text-sm md:text-base uppercase tracking-widest transition-all duration-300 ${activeTab === 'upcoming' ? 'text-[#2e3d83] shadow-lg' : 'text-slate-500 hover:text-slate-800'}`}
              onClick={() => setActiveTab('upcoming')}
            >
              {activeTab === 'upcoming' && <span className="absolute inset-0 bg-white rounded-full -z-10 shadow-[0_4px_12px_rgba(255,255,255,1)]"></span>}
              <span className="flex items-center">
                <span className={`w-2 h-2 rounded-full mr-2 ${activeTab === 'upcoming' ? 'bg-[#f4c23d]' : 'bg-transparent'}`}></span>
                Sắp diễn ra
              </span>
            </button>
          </div>
        </div>

        {/* Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {currentList.length === 0 ? (
            <div className="col-span-full py-16 text-center bg-white rounded-3xl border border-slate-200">
              <span className="text-5xl mb-4 block">💤</span>
              <p className="text-slate-500 font-bold text-lg">Hệ thống đang chờ phiên đấu giá mới.</p>
            </div>
          ) : (
            currentList.map((item) => (
              <LiveAuctionCard key={String(item.id)} data={item} isLiveTab={activeTab === 'live'} />
            ))
          )}
        </div>

      </div>
    </section>
  );
};

export default LiveAuction;

