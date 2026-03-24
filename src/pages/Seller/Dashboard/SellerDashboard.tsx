import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { sellerApi } from '../../../features/seller/api/sellerApi';
import { usePageI18n } from '../../../i18n/usePageI18n';
import type { ProductResponse } from '../../../types/index';
import { Car, Clock, DollarSign, CheckCircle2, ChevronRight, Settings, AlertCircle, Plus, Activity } from 'lucide-react';

const formatVND = (amount?: number) =>
  amount
    ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
    : '—';

export const SellerDashboard: React.FC = () => {
  const { tp, getProductStatusLabel } = usePageI18n();
  const [vehicles, setVehicles] = useState<ProductResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const data = await sellerApi.getMyVehicles();
      const list = Array.isArray(data) ? data : (data as any)?.content || [];
      // Sort to show newest first
      const sorted = list.sort((a: any, b: any) => 
        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );
      setVehicles(sorted);
    } catch (err) {
      // silent fail
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'PENDING': 
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-bold uppercase tracking-wider rounded-md border border-amber-200"><Clock size={12}/>{getProductStatusLabel(status)}</span>;
      case 'APPROVED': 
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider rounded-md border border-emerald-200"><CheckCircle2 size={12}/>{getProductStatusLabel(status)}</span>;
      case 'IN_AUCTION': 
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider rounded-md border border-indigo-200"><Activity size={12}/>{getProductStatusLabel(status)}</span>;
      case 'REJECTED': 
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-rose-50 text-rose-700 text-xs font-bold uppercase tracking-wider rounded-md border border-rose-200"><AlertCircle size={12}/>{getProductStatusLabel(status)}</span>;
      case 'SOLD': 
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wider rounded-md border border-slate-300"><DollarSign size={12}/>{getProductStatusLabel(status)}</span>;
      default: 
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 text-slate-600 text-xs font-bold uppercase tracking-wider rounded-md border border-slate-200">{status || tp('sellerDashboard.notAvailable', 'Không có')}</span>;
    }
  };

  const activeCount = vehicles.filter(v => v.status === 'IN_AUCTION').length;
  const pendingCount = vehicles.filter(v => v.status === 'PENDING').length;
  const soldCount = vehicles.filter(v => v.status === 'SOLD').length;
  // Giả sử doanh thu là tổng startPrice (hoặc winningPrice nếu có API detail) của xe đã SOLD
  const totalSales = vehicles.filter(v => v.status === 'SOLD').reduce((sum, v) => sum + (v.startPrice || 0), 0);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">{tp('sellerDashboard.title', 'Bảng điều khiển Người Bán')}</h1>
          <p className="text-slate-500 mt-1">{tp('sellerDashboard.subtitle', 'Quản lý xe và theo dõi hoạt động bán hàng')}</p>
        </div>
        <Link 
          to="/seller/products/new" 
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#2e3d83] hover:bg-[#1e293b] text-white font-semibold rounded-xl shadow-md shadow-[#2e3d83]/20 active:scale-95 transition-all"
        >
          <Plus size={20} />
          {tp('sellerDashboard.newVehicle', 'Đăng bán xe mới')}
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Active in Auction */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-500">
            <Car size={64} className="text-[#2e3d83]" />
          </div>
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">{tp('sellerDashboard.inAuction', 'Đang đấu giá')}</p>
          <h3 className="text-3xl font-black text-slate-800 mt-2">{loading ? '...' : activeCount}</h3>
        </div>

        {/* Pending Approval */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-500">
            <Clock size={64} className="text-amber-500" />
          </div>
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">{tp('sellerDashboard.pending', 'Chờ duyệt')}</p>
          <h3 className={`text-3xl font-black mt-2 ${pendingCount > 0 ? 'text-amber-500' : 'text-slate-800'}`}>
            {loading ? '...' : pendingCount}
          </h3>
        </div>

        {/* Total Revenue */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-500">
            <DollarSign size={64} className="text-emerald-500" />
          </div>
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">{tp('sellerDashboard.totalRevenue', 'Doanh thu')}</p>
          <h3 className="text-2xl font-black text-emerald-600 mt-3 truncate">{loading ? '...' : formatVND(totalSales)}</h3>
        </div>

        {/* Sold Vehicles */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-500">
            <CheckCircle2 size={64} className="text-indigo-500" />
          </div>
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">{tp('sellerDashboard.soldVehicles', 'Đã bán hoàn tất')}</p>
          <h3 className="text-3xl font-black text-slate-800 mt-2">{loading ? '...' : soldCount}</h3>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Car size={20} className="text-[#2e3d83]"/>
            {tp('sellerDashboard.recentVehicles', 'Danh sách xe gần đây')}
          </h2>
          <Link to="/seller/products" className="text-sm font-bold text-[#2e3d83] hover:underline flex items-center gap-1">
            {tp('sellerDashboard.viewAll', 'Xem tất cả')} <ChevronRight size={16} />
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-slate-100 text-xs uppercase tracking-wider text-slate-500 font-bold">
                <th className="px-6 py-4">{tp('sellerDashboard.vehicle', 'Sản phẩm')}</th>
                <th className="px-6 py-4">{tp('sellerDashboard.status', 'Trạng thái')}</th>
                <th className="px-6 py-4">{tp('sellerDashboard.suggestedPrice', 'Giá khởi điểm')}</th>
                <th className="px-6 py-4">{tp('sellerDashboard.createdDate', 'Ngày đăng')}</th>
                <th className="px-6 py-4 text-right">{tp('sellerDashboard.action', 'Thao tác')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-medium">Đang tải dữ liệu...</td>
                </tr>
              ) : vehicles.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-medium">Chưa có xe nào. Hãy đăng bán chiếc xe đầu tiên!</td>
                </tr>
              ) : (
                vehicles.slice(0, 5).map(v => (
                  <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <strong className="text-slate-800 block text-sm">{v.name || `${v.brand} ${v.model}`}</strong>
                      <span className="text-xs text-slate-400">ID: {v.id?.slice(0, 8)}</span>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(v.status)}</td>
                    <td className="px-6 py-4 font-bold text-[#2e3d83]">{formatVND(v.startPrice)}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {v.createdAt ? new Date(v.createdAt).toLocaleDateString('vi-VN') : '—'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {v.status === 'IN_AUCTION' || v.status === 'SOLD' ? (
                        <button title="Khóa chỉnh sửa" disabled className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-400 font-semibold rounded-lg text-xs cursor-not-allowed">
                          <Settings size={14} /> Quản lý
                        </button>
                      ) : (
                        <Link to={`/seller/products/${v.id}/edit`} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 font-bold rounded-lg text-xs hover:bg-indigo-100 transition-colors">
                          <Settings size={14} /> Quản lý
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
