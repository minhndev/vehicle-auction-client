import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { sellerApi } from '../../../features/seller/api/sellerApi';
import { auctionApi } from '../../../features/bidding/api/auctionApi';
import { usePageI18n } from '../../../i18n/usePageI18n';
import type { AuctionResponse, ProductResponse } from '../../../types/index';
import { Plus, ExternalLink, AlertCircle, Loader2 } from 'lucide-react';

const formatVND = (amount?: number) =>
  amount
    ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
    : '—';

export const SellerAuctions: React.FC = () => {
  const { tp, getAuctionStatusLabel } = usePageI18n();
  const [vehicles, setVehicles] = useState<ProductResponse[]>([]);
  const [auctions, setAuctions] = useState<AuctionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchData();
  }, [filterStatus]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [vehicleData, auctionData] = await Promise.all([
        sellerApi.getMyVehicles(),
        auctionApi.getPublicAuctions({
          page: 0,
          size: 100,
          sort: 'createdAt,desc',
          ...(filterStatus !== 'ALL' ? { status: filterStatus } : {}),
        }),
      ]);

      const myVehicles = Array.isArray(vehicleData) ? vehicleData : (vehicleData as any)?.content || [];
      setVehicles(myVehicles);

      const rawAuctions = Array.isArray((auctionData as any)?.content) ? (auctionData as any).content : [];
      const myProductIds = new Set(myVehicles.map((v: ProductResponse) => String(v.id)));
      const myAuctions = rawAuctions.filter((a: AuctionResponse) => myProductIds.has(String(a.productId)));

      setAuctions(myAuctions);
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || tp('sellerAuctions.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const getProductName = (productId?: string) => {
    if (!productId) return tp('shared.status.unknown');
    const product = vehicles.find((v) => String(v.id) === String(productId));
    return product?.name || `${product?.brand || ''} ${product?.model || ''}`.trim() || productId;
  };

  const filteredAuctions = auctions.filter((a) => !search || getProductName(a.productId).toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-extrabold text-[#2e3d83] mb-2">Quản Lý Phiên Đấu Giá</h1>
          <p className="text-slate-500 max-w-xl">Quản lý và kích hoạt các phiên đấu giá cho tải sản của bạn. Bạn cần đăng ký xe trước khi tạo phiên.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/seller/products" className="px-5 py-2.5 font-bold text-[#2e3d83] bg-[#2e3d83]/5 hover:bg-[#2e3d83]/10 transition-colors rounded-xl items-center gap-2 flex">
            Quản Lý Xe
          </Link>
          <Link to="/seller/auctions/new" className="px-6 py-2.5 bg-[#2e3d83] text-white hover:bg-[#1a2350] transition-colors shadow-lg shadow-[#2e3d83]/20 rounded-xl font-bold flex items-center gap-2 tracking-wide uppercase text-sm">
            <Plus size={18} /> Mở Phiên Đấu Giá
          </Link>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 flex items-center gap-2 font-medium">
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {/* Toolbar */}
      <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-100 flex flex-col sm:flex-row gap-2 mb-6">
        <div className="relative flex-1">
          <input type="text" placeholder="Tìm kiếm phiên theo tên xe..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full px-5 py-3 rounded-xl bg-slate-50 hover:bg-slate-100 focus:bg-white focus:ring-2 ring-[#2e3d83]/20 outline-none transition-colors" />
        </div>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} 
          className="px-5 py-3 rounded-xl bg-slate-50 border-r-8 border-transparent focus:ring-2 ring-[#2e3d83]/20 outline-none font-medium cursor-pointer">
          <option value="ALL">Tất cả trạng thái</option>
          <option value="UPCOMING">Sắp diễn ra</option>
          <option value="ACTIVE">Đang diễn ra</option>
          <option value="COMPLETED">Đã kết thúc</option>
          <option value="CANCELLED">Bị hủy</option>
        </select>
      </div>

      {/* Modern Table List */}
      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Mã Phiên</th>
                <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest min-w-[200px]">Tài sản đấu giá</th>
                <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Trạng thái</th>
                <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Mức Giá</th>
                <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Kết Thúc</th>
                <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest whitespace-nowrap text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={6} className="py-16 text-center text-slate-500 font-medium"><Loader2 className="animate-spin mx-auto mb-2 text-[#2e3d83]" size={32} /> Đang tải dữ liệu...</td></tr>
              ) : filteredAuctions.length === 0 ? (
                <tr><td colSpan={6} className="py-16 text-center text-slate-400 font-medium tracking-wide">Chưa có phiên đấu giá nào được tìm thấy.</td></tr>
              ) : (
                filteredAuctions.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-5"><span className="font-mono text-sm font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded">#{String(a.id).slice(0,6)}</span></td>
                    <td className="px-6 py-5 font-bold text-slate-800">{getProductName(a.productId)}</td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                        a.status === 'ACTIVE' ? 'bg-[#f4c23d]/20 text-yellow-700' :
                        a.status === 'UPCOMING' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {getAuctionStatusLabel(a.status)}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <p className="font-extrabold text-[#2e3d83]">{formatVND(a.currentPrice || a.startPrice)}</p>
                    </td>
                    <td className="px-6 py-5 text-sm font-medium text-slate-600">
                      {a.endTime ? new Date(a.endTime).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }) : '—'}
                    </td>
                    <td className="px-6 py-5 text-right">
                      {a.id && (
                        <Link to={`/auctions/${a.id}`} className="inline-flex items-center justify-center w-10 h-10 bg-white border border-slate-200 text-slate-400 rounded-xl hover:bg-[#2e3d83] hover:text-white hover:border-[#2e3d83] transition-all shadow-sm group-hover:shadow-md">
                          <ExternalLink size={18} />
                        </Link>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
