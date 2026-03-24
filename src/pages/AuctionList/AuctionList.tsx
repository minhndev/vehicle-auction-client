import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, RefreshCw, BarChart3, Clock, CheckCircle2 } from 'lucide-react';
import { auctionApi, type AuctionQueryParams } from '../../features/bidding/api/auctionApi';
import { AuctionCard } from '../../features/bidding/components/AuctionCard/AuctionCard';
import { Button } from '../../components/ui/Button/Button';
import type { AuctionResponse } from '../../types/index';

const AUCTION_STATUSES = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'UPCOMING', label: 'Sắp diễn ra' },
  { value: 'ACTIVE', label: 'Đang đấu giá' },
  { value: 'COMPLETED', label: 'Đã kết thúc' },
];

const SORT_OPTIONS = [
  { value: 'createdAt,desc', label: 'Mới nhất' },
  { value: 'currentPrice,asc', label: 'Giá tăng dần' },
  { value: 'currentPrice,desc', label: 'Giá giảm dần' },
  { value: 'endTime,asc', label: 'Sắp kết thúc' },
];

const formatCompactVND = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(Math.max(0, amount));
};

export const AuctionList: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [auctions, setAuctions] = useState<AuctionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [keyword, setKeyword] = useState(() => searchParams.get('keyword') ?? searchParams.get('year') ?? '');
  const [status, setStatus] = useState(() => searchParams.get('status') ?? '');
  const [categoryId, setCategoryId] = useState(() => searchParams.get('categoryId') ?? '');
  const [minPrice, setMinPrice] = useState(() => searchParams.get('minPrice') ?? '');
  const [maxPrice, setMaxPrice] = useState(() => searchParams.get('maxPrice') ?? '');
  const [sortBy, setSortBy] = useState('createdAt,desc');

  // Pagination
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fetchAuctions = useCallback(async (currentPage: number) => {
    try {
      setLoading(true);
      setError(null);

      const params: AuctionQueryParams = {
        page: currentPage,
        size: 12,
        sort: sortBy,
      };
      if (keyword.trim()) params.keyword = keyword.trim();
      if (status) params.status = status;
      if (categoryId) params.categoryId = categoryId;
      if (minPrice) params.minPrice = Number(minPrice);
      if (maxPrice) params.maxPrice = Number(maxPrice);

      const response = await auctionApi.getPublicAuctions(params);
      setAuctions(response.content ?? []);
      setTotalPages(response.totalPages ?? 1);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Tải danh sách thất bại';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [keyword, status, categoryId, minPrice, maxPrice, sortBy]);

  const syncSearchParams = useCallback(() => {
    const params = new URLSearchParams();
    if (keyword.trim()) params.set('keyword', keyword.trim());
    if (status) params.set('status', status);
    if (categoryId) params.set('categoryId', categoryId);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    setSearchParams(params, { replace: true });
  }, [keyword, status, categoryId, minPrice, maxPrice, setSearchParams]);

  useEffect(() => {
    fetchAuctions(page);
  }, [page, fetchAuctions]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    syncSearchParams();
    fetchAuctions(0);
  };

  const clearFilters = () => {
    setKeyword('');
    setStatus('');
    setCategoryId('');
    setMinPrice('');
    setMaxPrice('');
    setSearchParams({}, { replace: true });
    setPage(0);
    fetchAuctions(0);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const activeFilters = [keyword, status, categoryId, minPrice, maxPrice].filter((v) => `${v}`.trim()).length;
  const maxVisiblePages = 5;
  const startPage = Math.max(0, Math.min(page - Math.floor(maxVisiblePages / 2), Math.max(0, totalPages - maxVisiblePages)));
  const endPageExclusive = Math.min(totalPages, startPage + maxVisiblePages);
  const pageNumbers = Array.from({ length: Math.max(0, endPageExclusive - startPage) }, (_, idx) => startPage + idx);

  const stats = {
    active: auctions.filter((a) => a.status === 'ACTIVE').length,
    upcoming: auctions.filter((a) => a.status === 'UPCOMING').length,
    completed: auctions.filter((a) => a.status === 'COMPLETED').length,
    avgCurrentPrice:
      auctions.length > 0
        ? auctions.reduce((sum, auction) => sum + (auction.currentPrice ?? 0), 0) / auctions.length
        : 0,
  };

  return (
    <div className="min-h-screen bg-slate-50 border-t border-slate-200">
      {/* Sleek Hero Banner */}
      <section className="bg-gradient-to-r from-slate-900 to-[#2e3d83] text-white pt-16 pb-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 pointer-events-none"></div>
        <div className="absolute -left-40 -top-40 w-96 h-96 bg-blue-500 rounded-full blur-[120px] opacity-20 pointer-events-none"></div>
        <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row items-center justify-between">
          <div className="text-center md:text-left">
            <p className="text-blue-200 font-bold uppercase tracking-widest text-xs mb-3 flex items-center justify-center md:justify-start">
              <BarChart3 size={14} className="mr-2" /> Sàn đấu giá trực tuyến
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 tracking-tight drop-shadow-md text-white">Khám Phá Thị Trường</h1>
            <p className="text-blue-100 max-w-xl text-lg font-medium leading-relaxed opacity-90">
              Tìm kiếm, theo dõi và đấu giá các phương tiện đã được chuyên gia kiểm định 120 điểm kỹ thuật.
            </p>
          </div>
          <div className="mt-10 md:mt-0 bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-[2rem] text-center min-w-[220px] shadow-2xl flex flex-col items-center">
            <span className="block text-5xl font-black text-[#f4c23d] mb-1 drop-shadow-sm">{loading ? '...' : stats.active}</span>
            <span className="text-blue-50 font-semibold tracking-wide text-sm flex items-center">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse mr-2 shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
              Phiên Đang Mở
            </span>
          </div>
        </div>
      </section>

      {/* Main Layout Container */}
      <section className="max-w-7xl mx-auto px-4 -mt-8 relative z-20 flex flex-col lg:flex-row gap-8 pb-32">
        
        {/* Left Sidebar (Filters) */}
        <aside className="w-full lg:w-[300px] flex-shrink-0">
          <div className="bg-white rounded-[2rem] p-6 shadow-xl shadow-slate-200/50 border border-slate-100 sticky top-28">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
              <h2 className="text-xl font-extrabold text-slate-900 flex items-center">
                <Filter size={20} className="mr-2 text-[#2e3d83]" /> Bộ Lọc
              </h2>
              {activeFilters > 0 && (
                <span className="bg-blue-50 text-[#2e3d83] text-xs font-bold px-2.5 py-1 rounded-full">{activeFilters}</span>
              )}
            </div>

            <form onSubmit={handleSearch} className="space-y-7">
              {/* Keyword Input */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Tìm Kiếm</label>
                <div className="relative">
                  <Search size={18} className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Tên xe, hãng, năm đời..."
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#2e3d83]/20 focus:border-[#2e3d83] outline-none transition-all text-slate-900 list-none font-medium placeholder-slate-400 text-sm"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                  />
                </div>
              </div>

              {/* Status Radio Group */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-3">Tình Trạng</label>
                <div className="space-y-3">
                  {AUCTION_STATUSES.map((s) => (
                    <label key={s.value || 'ALL'} className="flex items-center cursor-pointer group">
                      <div className="relative flex items-center justify-center w-5 h-5 mr-3 flex-shrink-0">
                        <input
                          type="radio"
                          name="statusFilter"
                          value={s.value}
                          checked={status === s.value}
                          onChange={(e) => {
                            setStatus(e.target.value);
                            setPage(0);
                            setTimeout(() => document.getElementById('filter-btn')?.click(), 50);
                          }}
                          className="peer sr-only"
                        />
                        <div className="w-5 h-5 border-[2.5px] border-slate-300 rounded-full peer-checked:border-[#2e3d83] peer-focus-visible:ring-2 peer-focus-visible:ring-[#2e3d83]/30 transition-all bg-white"></div>
                        <div className="absolute w-2.5 h-2.5 bg-[#2e3d83] rounded-full scale-0 peer-checked:scale-100 transition-transform"></div>
                      </div>
                      <span className={`font-semibold text-sm transition-colors ${status === s.value ? 'text-[#2e3d83]' : 'text-slate-600 group-hover:text-slate-900'}`}>{s.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-3">Khoảng Giá (VNĐ)</label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    placeholder="Từ..."
                    className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#2e3d83]/20 focus:border-[#2e3d83] outline-none text-sm transition-all font-medium text-slate-900 placeholder-slate-400"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                  />
                  <input
                    type="number"
                    placeholder="Đến..."
                    className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#2e3d83]/20 focus:border-[#2e3d83] outline-none text-sm transition-all font-medium text-slate-900 placeholder-slate-400"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 space-y-3">
                <Button id="filter-btn" type="submit" className="w-full bg-[#2e3d83] hover:bg-[#1f2857] text-white py-3.5 rounded-xl font-bold shadow-lg shadow-blue-900/20 transition-all flex justify-center items-center">
                  <Filter size={16} className="mr-2" /> Áp Dụng Lọc
                </Button>
                {activeFilters > 0 && (
                  <Button
                    type="button"
                    onClick={clearFilters}
                    className="w-full bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 py-3 rounded-xl font-bold transition-all flex justify-center items-center"
                  >
                    <RefreshCw size={14} className="mr-2 text-slate-400" /> Bỏ Lọc
                  </Button>
                )}
              </div>
            </form>
          </div>
        </aside>

        {/* Right Content Area (Grid & Stats) */}
        <div className="w-full flex-1 flex flex-col min-w-0">
          
          {/* Top Quick Stats Strip */}
          <div className="bg-white rounded-2xl md:rounded-full p-2 pl-6 pr-2 mb-8 shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 items-center justify-between mt-8 lg:mt-0">
            <div className="flex items-center space-x-6 text-sm py-2">
               <div className="flex items-center text-slate-600">
                 <div className="w-2 h-2 rounded-full bg-green-500 mr-2 shadow-[0_0_5px_rgba(34,197,94,0.6)]"></div>
                 Đang mở <span className="font-bold text-slate-900 ml-1">{loading ? '-' : stats.active}</span>
               </div>
               <div className="flex items-center text-slate-600">
                 <Clock size={14} className="mr-1.5 text-blue-500" />
                 Sắp tới <span className="font-bold text-slate-900 ml-1">{loading ? '-' : stats.upcoming}</span>
               </div>
               <div className="flex items-center text-slate-600">
                 <CheckCircle2 size={14} className="mr-1.5 text-slate-400" />
                 Kết thúc <span className="font-bold text-slate-900 ml-1">{loading ? '-' : stats.completed}</span>
               </div>
               <div className="hidden sm:flex items-center text-slate-600 pl-4 border-l border-slate-200">
                 Tr/bình: <span className="font-bold text-[#2e3d83] ml-1">{loading ? '-' : `${formatCompactVND(stats.avgCurrentPrice)} ₫`}</span>
               </div>
            </div>
            
            <div className="flex items-center w-full md:w-auto bg-slate-50 rounded-full px-3 py-1.5 border border-slate-100">
               <span className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-2">Sắp Xếp</span>
               <select 
                 className="bg-transparent border-none text-sm font-bold text-slate-800 focus:ring-0 cursor-pointer ml-1 outline-none py-1"
                 value={sortBy}
                 onChange={(e) => {
                   setSortBy(e.target.value);
                   setPage(0);
                 }}
               >
                 {SORT_OPTIONS.map((opt) => (
                   <option key={opt.value} value={opt.value}>{opt.label}</option>
                 ))}
               </select>
            </div>
          </div>

          {/* Results Header Info */}
          <div className="flex justify-between items-end mb-6">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900">Kết quả đấu giá</h2>
              {!loading && !error && (
                <p className="text-slate-500 font-medium mt-1">Tìm thấy tổng cộng {auctions.length} kết quả (Trang {page + 1}/{Math.max(totalPages, 1)})</p>
              )}
            </div>
          </div>

          {/* Grid View */}
          {loading ? (
             <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-pulse">
               {[1, 2, 3, 4, 5, 6].map(i => (
                 <div key={i} className="bg-slate-200 rounded-3xl h-[420px] shadow-sm"></div>
               ))}
             </div>
          ) : error ? (
            <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-2xl font-medium text-red-800 flex items-center shadow-sm">
              <RefreshCw className="mr-3" /> {error}
            </div>
          ) : auctions.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-100 py-24 flex flex-col items-center justify-center text-center shadow-sm">
              <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                <Search size={40} className="text-slate-300" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-800 mb-2">Không tìm thấy kết quả</h3>
              <p className="text-slate-500 font-medium max-w-sm">Hãy thử thay đổi tiêu chí bộ lọc bên trái hoặc sử dụng từ khóa khác rộng hơn.</p>
              <Button onClick={clearFilters} variant="outline" className="mt-6 rounded-full px-6 text-sm border-slate-200">
                Xóa trọn bộ lọc
              </Button>
            </div>
          ) : (
            <>
              {/* Product Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {auctions.map((auction) => (
                  <div key={auction.id} className="transition-transform duration-300 hover:-translate-y-1">
                    <AuctionCard auction={auction} />
                  </div>
                ))}
              </div>

              {/* Bottom Pagination Bubble */}
              {totalPages > 1 && (
                <div className="mt-12 flex justify-center">
                  <div className="bg-white rounded-full shadow-sm border border-slate-200 p-1.5 flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handlePageChange(Math.max(0, page - 1))}
                      disabled={page === 0}
                      className="w-10 h-10 flex items-center justify-center rounded-full text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent font-bold transition-colors"
                    >
                      ←
                    </button>
                    
                    {pageNumbers.map((pageNumber) => (
                      <button
                        key={pageNumber}
                        type="button"
                        className={`w-10 h-10 flex items-center justify-center rounded-full font-bold text-sm transition-all ${
                          pageNumber === page 
                            ? 'bg-[#2e3d83] text-white shadow-md' 
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                        onClick={() => handlePageChange(pageNumber)}
                      >
                        {pageNumber + 1}
                      </button>
                    ))}

                    <button
                      type="button"
                      onClick={() => handlePageChange(page + 1)}
                      disabled={page >= totalPages - 1}
                      className="w-10 h-10 flex items-center justify-center rounded-full text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent font-bold transition-colors"
                    >
                      →
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

        </div>
      </section>
    </div>
  );
};
