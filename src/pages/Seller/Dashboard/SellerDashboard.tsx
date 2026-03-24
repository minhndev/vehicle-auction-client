import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { sellerApi } from '../../../features/seller/api/sellerApi';
import { auctionApi } from '../../../features/bidding/api/auctionApi';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../store';
import { Car, Gavel, DollarSign, ArrowRight, Loader2, Activity } from 'lucide-react';

export const SellerDashboard: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);

  const [stats, setStats] = useState({
    totalCars: 0,
    activeAuctions: 0,
    totalValue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [vehicles, auctions] = await Promise.all([
          sellerApi.getMyVehicles().catch(() => []),
          auctionApi.getPublicAuctions({ size: 100, status: 'ACTIVE' }).catch(() => ({ content: [] }))
        ]);

        const myVehiclesList = Array.isArray(vehicles) ? vehicles : (vehicles as any).content || [];
        const activeAuctionsList = Array.isArray((auctions as any)?.content) ? (auctions as any).content : [];

        const myProductIds = new Set(myVehiclesList.map((v: any) => String(v.id)));
        const myActiveAuctions = activeAuctionsList.filter((a: any) => myProductIds.has(String(a.productId)));

        const estValue = myActiveAuctions.reduce((sum: number, a: any) => sum + (a.currentPrice || a.startPrice || 0), 0);

        setStats({
          totalCars: myVehiclesList.length,
          activeAuctions: myActiveAuctions.length,
          totalValue: estValue
        });
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu trang chủ Seller:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const formatVND = (amount: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">

      {/* Welcome Banner */}
      <div className="bg-gradient-to-br from-[#0f172a] to-[#1e293b] rounded-3xl p-10 text-white relative overflow-hidden shadow-2xl">
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-black mb-4">Xin chào, {`${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'nhà phân phối'}</h1>
          <p className="text-slate-300 max-w-xl text-lg leading-relaxed mb-8">
            Chào mừng trở lại V-Auction. Tại đây, bạn có thể dễ dàng quản lý kho xe, khởi tạo và theo dõi các phiên đấu giá trực tuyến.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/seller/products/new" className="px-6 py-3 bg-emerald-500 text-white hover:bg-emerald-400 font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2">
              <Car size={20} /> Đăng Ký Kiểm Định Xe Mới
            </Link>
            <Link to="/seller/auctions/new" className="px-6 py-3 bg-white/10 text-white hover:bg-white/20 font-bold rounded-xl transition-all backdrop-blur-md flex items-center gap-2">
              <Gavel size={20} /> Mở Phiên Đấu Giá
            </Link>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute left-1/2 bottom-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl translate-y-1/2 translate-x-1/2"></div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden group">
          <div className="flex items-center justify-between mb-4 relative z-10">
            <h3 className="text-slate-500 font-bold uppercase tracking-widest text-sm">Tổng xe đang quản lý</h3>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform"><Car size={24} /></div>
          </div>
          <div className="relative z-10">
            {loading ? <Loader2 className="animate-spin text-slate-300" size={32} /> : <p className="text-4xl font-black text-slate-800">{stats.totalCars}</p>}
          </div>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-blue-600"></div>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden group">
          <div className="flex items-center justify-between mb-4 relative z-10">
            <h3 className="text-slate-500 font-bold uppercase tracking-widest text-sm">Đấu giá đang diễn ra</h3>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform"><Activity size={24} /></div>
          </div>
          <div className="relative z-10 flex items-baseline gap-2">
            {loading ? <Loader2 className="animate-spin text-slate-300" size={32} /> : <p className="text-4xl font-black text-slate-800">{stats.activeAuctions}</p>}
            {!loading && <span className="text-emerald-500 font-bold text-sm bg-emerald-50 px-2 rounded-full">LIVE</span>}
          </div>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-emerald-600"></div>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden group">
          <div className="flex items-center justify-between mb-4 relative z-10">
            <h3 className="text-slate-500 font-bold uppercase tracking-widest text-sm">Ước tính Doanh Thu</h3>
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center group-hover:scale-110 transition-transform"><DollarSign size={24} /></div>
          </div>
          <div className="relative z-10">
            {loading ? <Loader2 className="animate-spin text-slate-300" size={32} /> : <p className="text-3xl font-black text-[#f4c23d]">{formatVND(stats.totalValue)}</p>}
          </div>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-yellow-500"></div>
        </div>
      </div>

      {/* Quick Access List */}
      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-100 p-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-bold text-slate-800">Truy Cập Nhanh</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link to="/seller/products" className="group flex items-center justify-between p-6 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-[#10b981] hover:shadow-lg hover:shadow-emerald-500/10 transition-all">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center"><Car size={24} /></div>
              <div>
                <h4 className="font-bold text-slate-800 group-hover:text-[#10b981] transition-colors">Kho Xe Của Bạn</h4>
                <p className="text-sm text-slate-500 font-medium mt-1">Quản lý hồ sơ, thêm xe mới</p>
              </div>
            </div>
            <ArrowRight className="text-slate-300 group-hover:text-[#10b981] group-hover:translate-x-1 transition-all" />
          </Link>
          <Link to="/seller/auctions" className="group flex items-center justify-between p-6 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-[#10b981] hover:shadow-lg hover:shadow-emerald-500/10 transition-all">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center"><Gavel size={24} /></div>
              <div>
                <h4 className="font-bold text-slate-800 group-hover:text-[#10b981] transition-colors">Quản Lý Phiên Đấu Giá</h4>
                <p className="text-sm text-slate-500 font-medium mt-1">Theo dõi tiến độ, tạo phiên</p>
              </div>
            </div>
            <ArrowRight className="text-slate-300 group-hover:text-[#10b981] group-hover:translate-x-1 transition-all" />
          </Link>
        </div>
      </div>
    </div>
  );
};
