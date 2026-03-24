import React, { useEffect, useState } from 'react';
import { adminApi } from '../../../api/adminApi';
import { auctionApi } from '../../../features/bidding/api/auctionApi';
import { usePageI18n } from '../../../i18n/usePageI18n';
import { Users, Gavel, AlertCircle, DollarSign, ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { tp } = usePageI18n();
  const [stats, setStats] = useState({
    users: 0,
    auctions: 0,
    pending: 0,
    revenue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCounters = async () => {
      try {
        setLoading(true);
        // Call all necessary APIs in parallel to compute dashboard stats.
        // If APIs don't exist, they will swallow fail inside PromiseSettled.
        const [usersRes, auctionsRes, pendingRes] = await Promise.allSettled([
          adminApi.getUsers({ page: 0, size: 1 }),
          auctionApi.getPublicAuctions({ status: 'ACTIVE', page: 0, size: 1 }),
          adminApi.getPendingVehicles({ page: 0, size: 1 })
        ]);

        let uCount = 0, aCount = 0, pCount = 0;
        
        if (usersRes.status === 'fulfilled') {
          // @ts-ignore
          uCount = usersRes.value?.totalElements ?? (Array.isArray(usersRes.value) ? usersRes.value.length : 0);
        }
        if (auctionsRes.status === 'fulfilled') {
          // @ts-ignore
          aCount = auctionsRes.value?.totalElements ?? (Array.isArray(auctionsRes.value) ? auctionsRes.value.length : 0);
        }
        if (pendingRes.status === 'fulfilled') {
          // @ts-ignore
          pCount = pendingRes.value?.totalElements ?? (Array.isArray(pendingRes.value) ? pendingRes.value.length : 0);
        }

        setStats({
          users: uCount,
          auctions: aCount,
          pending: pCount,
          revenue: 14500000 // mock revenue for now since we don't have a specific endpoint for total system revenue tracking yet
        });
      } catch (err) {
        // silent fail - UI degrade gracefully to 0
      } finally {
        setLoading(false);
      }
    };
    fetchCounters();
  }, []);

  const formatVND = (v: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">{tp('adminDashboard.title', 'Bảng điều khiển Admin')}</h1>
        <p className="text-slate-500 mt-1">{tp('adminDashboard.subtitle', 'Tổng quan về hoạt động của nền tảng')}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Users */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-500">
            <Users size={64} className="text-[#2e3d83]" />
          </div>
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">{tp('adminDashboard.totalUsers', 'Tổng người dùng')}</p>
              <h3 className="text-3xl font-black text-slate-800 mt-2">{loading ? '...' : stats.users}</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <Users size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="flex items-center text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded mr-2">
              <ArrowUpRight size={14} className="mr-0.5" /> 12%
            </span>
            <span className="text-slate-400">{tp('adminDashboard.system', 'Toàn hệ thống')}</span>
          </div>
        </div>

        {/* Live Auctions */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-500">
            <Gavel size={64} className="text-[#2e3d83]" />
          </div>
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">{tp('adminDashboard.liveAuctions', 'Phiên ĐG đang diễn ra')}</p>
              <h3 className="text-3xl font-black text-slate-800 mt-2">{loading ? '...' : stats.auctions}</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Gavel size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="flex items-center text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded mr-2">
              <ArrowUpRight size={14} className="mr-0.5" /> 5%
            </span>
            <span className="text-slate-400">{tp('adminDashboard.activeAuctions', 'Đang hoạt động')}</span>
          </div>
        </div>

        {/* Pending Vehicles */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-500">
            <AlertCircle size={64} className="text-amber-500" />
          </div>
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">{tp('adminDashboard.pendingVehicles', 'Xe chờ duyệt')}</p>
              <h3 className={`text-3xl font-black mt-2 ${stats.pending > 0 ? 'text-amber-500' : 'text-slate-800'}`}>
                {loading ? '...' : stats.pending}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
              <AlertCircle size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="flex items-center text-rose-600 font-medium bg-rose-50 px-2 py-0.5 rounded mr-2">
              <ArrowDownRight size={14} className="mr-0.5" /> 2%
            </span>
            <span className="text-slate-400">{tp('adminDashboard.needAdminAction', 'Cần Admin xử lý')}</span>
          </div>
        </div>

        {/* Revenue (mock) */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-500">
            <DollarSign size={64} className="text-emerald-500" />
          </div>
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">{tp('adminDashboard.totalRevenue', 'Tổng doanh thu')}</p>
              <h3 className="text-2xl font-black text-slate-800 mt-2 truncate max-w-[160px]" title={loading ? '...' : formatVND(stats.revenue)}>
                {loading ? '...' : formatVND(stats.revenue)}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
              <DollarSign size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="flex items-center text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded mr-2">
              <ArrowUpRight size={14} className="mr-0.5" /> 8%
            </span>
            <span className="text-slate-400">{tp('adminDashboard.mockRevenueNote', 'Doanh thu cọc (giả lập)')}</span>
          </div>
        </div>

      </div>

      {/* Recent Activity Placeholder */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-2">
          <Activity size={20} className="text-[#2e3d83]" />
          <h2 className="text-lg font-bold text-slate-800">{tp('adminDashboard.systemActivity', 'Hoạt động hệ thống gần đây')}</h2>
        </div>
        <div className="p-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
            <Activity size={24} className="text-slate-300" />
          </div>
          <p className="text-slate-500 max-w-sm leading-relaxed">
            {tp('adminDashboard.comingSoonTop', 'Tính năng biểu đồ & nhật ký hoạt động')} <br/>
            {tp('adminDashboard.comingSoonBottom', 'sẽ ra mắt trong bản cập nhật tới.')}
          </p>
        </div>
      </div>
    </div>
  );
};

