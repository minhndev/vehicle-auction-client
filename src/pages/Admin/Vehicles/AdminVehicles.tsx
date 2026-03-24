import React, { useEffect, useState } from 'react';
import { adminApi } from '../../../api/adminApi';
import { usePageI18n } from '../../../i18n/usePageI18n';
import type { ProductResponse } from '../../../types/index';
import { getErrorMessage } from '../../../utils/errorHelpers';
import { CheckCircle2, XCircle, AlertCircle, Loader2, User, Gauge } from 'lucide-react';

export const AdminVehicles: React.FC = () => {
  const { tp, getProductStatusLabel } = usePageI18n();
  const [vehicles, setVehicles] = useState<ProductResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminApi.getPendingVehicles();
      const list = Array.isArray(data) ? data : (data as any)?.content || [];
      setVehicles(list);
    } catch (err) {
      setError(getErrorMessage(err, tp('adminVehicles.loadError', 'Không thể tải danh sách')));
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    if (!window.confirm(tp('adminVehicles.approveConfirm', 'Cho phép hồ sơ xe này lên sàn?'))) return;
    try {
      setActionLoading(id);
      await adminApi.approveVehicle(id);
      setVehicles(prev => prev.filter(v => v.id !== id));
      setTimeout(() => alert(tp('adminVehicles.approveSuccess', 'Duyệt hồ sơ thành công!')), 100);
    } catch (err) {
      alert(`${tp('adminVehicles.approveFailed', 'Lỗi khi duyệt')}: ${getErrorMessage(err, 'Lỗi không xác định')}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    const reason = window.prompt(tp('adminVehicles.rejectReasonPrompt', 'Vui lòng nhập lý do từ chối:'));
    if (!reason) return;
    
    try {
      setActionLoading(id);
      await adminApi.rejectVehicle(id, reason);
      setVehicles(prev => prev.filter(v => v.id !== id));
      setTimeout(() => alert(tp('adminVehicles.rejectSuccess', 'Đã từ chối hồ sơ xe!')), 100);
    } catch (err) {
      alert(`${tp('adminVehicles.rejectFailed', 'Lỗi khi từ chối')}: ${getErrorMessage(err, 'Lỗi không xác định')}`);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-2">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 mb-2">{tp('adminVehicles.title', 'Phê Duyệt Khai Báo Xe')}</h1>
          <p className="text-slate-500 max-w-xl">
            {tp('adminVehicles.subtitle', 'Danh sách các phương tiện do đối tác đăng ký chờ được Ban Giám Đốc xét duyệt trước khi công khai lên sàn đấu giá.')}
          </p>
        </div>
        <div className="bg-amber-100 text-amber-700 font-bold px-4 py-2 rounded-xl flex items-center gap-2 border border-amber-200 shadow-sm">
          <AlertCircle size={18} /> {loading ? <Loader2 className="animate-spin" size={14}/> : vehicles.length} Yêu Cầu Chờ Xử Lý
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 flex items-center gap-2 font-medium">
          <AlertCircle size={18}/> {error}
        </div>
      )}

      {/* Grid of Pending Vehicles */}
      {loading ? (
        <div className="py-20 text-center flex flex-col items-center justify-center text-slate-400">
          <Loader2 className="animate-spin text-amber-500 mb-4" size={40} />
          <p className="font-semibold">{tp('adminVehicles.loading', 'Đang tải dữ liệu hồ sơ xe...')}</p>
        </div>
      ) : vehicles.length === 0 ? (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-16 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-sm">
            <CheckCircle2 size={36} />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">{tp('adminVehicles.emptyTitle', 'Hoàn Hảo!')}</h3>
          <p className="text-slate-500">{tp('adminVehicles.emptySubtitle', 'Hiện tại không có hồ sơ xe nào đang chờ bạn xử lý.')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map(vehicle => (
            <div key={vehicle.id} className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden flex flex-col transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-200/60 group">
              
              <div className="h-48 bg-slate-100 relative overflow-hidden">
                {Array.isArray(vehicle.images) && vehicle.images.length > 0 ? (
                  <img src={vehicle.images[0].url || ''} alt={vehicle.model} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 font-medium">
                    <AlertCircle size={32} className="mb-2 opacity-50"/>
                    Chưa cung cấp hình ảnh
                  </div>
                )}
                <div className="absolute top-4 left-4 bg-amber-500/90 text-white backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider shadow-lg shadow-amber-500/20">
                  {getProductStatusLabel('PENDING')}
                </div>
              </div>
              
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-xl text-slate-800 line-clamp-1 group-hover:text-blue-600 transition-colors" title={`${vehicle.year || ''} ${vehicle.brand} ${vehicle.model}`}>
                      {vehicle.year || ''} {vehicle.brand} {vehicle.model}
                    </h3>
                    <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">VIN: {vehicle.vinNumber || 'N/A'}</p>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 mb-6 space-y-3 flex-1 border border-slate-100">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center text-slate-500 gap-1.5"><User size={16}/> Cung cấp bởi</span>
                    <span className="font-bold text-slate-800" title={vehicle.sellerId}>ID: {vehicle.sellerId?.substring(0,8) || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm pt-3 border-t border-slate-200/60">
                    <span className="flex items-center text-slate-500 gap-1.5"><Gauge size={16}/> ODO</span>
                    <span className="font-bold text-slate-800">{(vehicle.mileage || 0).toLocaleString()} km</span>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-slate-200/60">
                    <span className="font-bold text-slate-500 uppercase text-xs tracking-wider mt-1">Giá TG Khởi Điểm</span>
                    <span className="font-black text-rose-500 text-lg">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(vehicle.startPrice || vehicle.basePrice || 0)}
                    </span>
                  </div>
                </div>

                <div className="flex gap-3 mt-auto">
                  <button 
                    onClick={() => vehicle.id && handleReject(vehicle.id)}
                    disabled={actionLoading === vehicle.id || !vehicle.id}
                    className="flex-1 py-2.5 rounded-xl font-bold bg-white text-red-500 border-2 border-red-100 hover:bg-red-50 hover:border-red-200 transition-all flex items-center justify-center gap-2 group/btn disabled:opacity-50"
                  >
                    {actionLoading === vehicle.id ? <Loader2 size={18} className="animate-spin" /> : <><XCircle size={18} className="group-hover/btn:scale-110 transition-transform"/> Từ chối</>}
                  </button>
                  <button 
                    onClick={() => vehicle.id && handleApprove(vehicle.id)}
                    disabled={actionLoading === vehicle.id || !vehicle.id}
                    className="flex-1 py-2.5 rounded-xl font-bold bg-[#10b981] text-white hover:bg-emerald-400 border-2 border-[#10b981] hover:border-emerald-400 hover:shadow-lg hover:shadow-emerald-500/30 transition-all flex items-center justify-center gap-2 group/btn disabled:opacity-50"
                  >
                    {actionLoading === vehicle.id ? <Loader2 size={18} className="animate-spin" /> : <><CheckCircle2 size={18} className="group-hover/btn:scale-110 transition-transform"/> Phê Duyệt</>}
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
};
