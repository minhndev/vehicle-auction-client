import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { sellerApi } from '../../../features/seller/api/sellerApi';
import { usePageI18n } from '../../../i18n/usePageI18n';
import type { ProductResponse } from '../../../types/index';
import { Plus, Search, Edit3, Trash2, RefreshCw, AlertCircle, Loader2, Image as ImageIcon, X } from 'lucide-react';

const formatVND = (amount?: number) =>
  amount ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount) : '—';

export const SellerProducts: React.FC = () => {
  const { getProductStatusLabel } = usePageI18n();
  const [vehicles, setVehicles] = useState<ProductResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  
  const [confirmModal, setConfirmModal] = useState<{ mode: 'delete' | 'restore'; id: string; title: string; message: string; } | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await sellerApi.getMyVehicles();
      const list = Array.isArray(data) ? data : (data as any)?.content || [];
      setVehicles(list);
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Lỗi khi tải danh sách sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'PENDING': return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-100 text-amber-700">{getProductStatusLabel('PENDING')}</span>;
      case 'APPROVED': return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-100 text-emerald-700">{getProductStatusLabel('APPROVED')}</span>;
      case 'IN_AUCTION': return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-blue-100 text-blue-700">{getProductStatusLabel('IN_AUCTION')}</span>;
      case 'REJECTED': return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-red-100 text-red-700">{getProductStatusLabel('REJECTED')}</span>;
      case 'SOLD': return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500 text-white shadow-sm">{getProductStatusLabel('SOLD')}</span>;
      case 'CANCELLED': return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-slate-200 text-slate-600">{getProductStatusLabel('CANCELLED')}</span>;
      default: return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-slate-100 text-slate-500">{getProductStatusLabel(status)}</span>;
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setActionLoadingId(id);
      await sellerApi.deleteVehicle(id);
      await fetchVehicles();
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Không thể xóa sản phẩm');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRestore = async (id: string) => {
    try {
      setActionLoadingId(id);
      await sellerApi.restoreVehicle(id);
      await fetchVehicles();
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Không thể khôi phục sản phẩm');
    } finally {
      setActionLoadingId(null);
    }
  };

  const confirmAction = async () => {
    if (!confirmModal) return;
    if (confirmModal.mode === 'delete') await handleDelete(confirmModal.id);
    else await handleRestore(confirmModal.id);
    setConfirmModal(null);
  };

  const filteredVehicles = vehicles.filter(v => {
    if (filterStatus !== 'all' && v.status !== filterStatus) return false;
    if (search && !v.brand?.toLowerCase().includes(search.toLowerCase()) && !v.model?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-2">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 mb-2">Kho Xe Đăng Ký</h1>
          <p className="text-slate-500 max-w-xl">Quản lý hồ sơ và tiến độ kiểm duyệt hệ thống của những chiếc xe bạn đã đăng ký.</p>
        </div>
        <Link to="/seller/products/new" className="px-6 py-3 bg-emerald-500 text-white hover:bg-emerald-400 font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2">
          <Plus size={20} /> Đăng Ký Kiểm Định Xe Mới
        </Link>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 flex items-center gap-2 font-medium">
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {/* Toolbar */}
      <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-100 flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Search size={18}/></div>
          <input type="text" placeholder="Tìm kiếm theo Hãng xe, Model..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-5 py-3 rounded-xl bg-slate-50 hover:bg-slate-100 focus:bg-white focus:ring-2 ring-emerald-500/20 outline-none transition-colors border-none" />
        </div>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} 
          className="px-5 py-3 rounded-xl bg-slate-50 border-r-8 border-transparent focus:ring-2 ring-emerald-500/20 outline-none font-medium text-slate-600 cursor-pointer text-sm">
          <option value="all">Tất cả trạng thái</option>
          <option value="PENDING">Chờ Kiểm Duyệt</option>
          <option value="APPROVED">Đã Duyệt (Có thể đấu giá)</option>
          <option value="IN_AUCTION">Đang Đấu Giá</option>
          <option value="REJECTED">Bị Từ Chối</option>
          <option value="SOLD">Đã Giao Dịch Thành Công</option>
          <option value="CANCELLED">Đã Hủy</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest w-24">Hình Ảnh</th>
                <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest min-w-[200px]">Thông tin xe (Model / VIN)</th>
                <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Trạng Thái</th>
                <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Định Giá Tham Chiếu</th>
                <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={5} className="py-20 text-center text-slate-500 font-medium"><Loader2 className="animate-spin mx-auto mb-3 text-emerald-500" size={32} /> Đang tải danh sách tài sản...</td></tr>
              ) : filteredVehicles.length === 0 ? (
                <tr><td colSpan={5} className="py-20 text-center text-slate-400 font-medium tracking-wide">Không tìm thấy xe nào phù hợp.</td></tr>
              ) : (
                filteredVehicles.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="w-20 h-14 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center relative">
                        {Array.isArray(v.images) && v.images.length > 0 ? (
                          <img src={typeof v.images[0] === 'string' ? v.images[0] : v.images[0]?.url} alt={v.model} className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="text-slate-300" size={24} />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-800 text-base mb-0.5">{v.name || `${v.brand} ${v.model}`}</p>
                      <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">VIN: {v.vinNumber || 'N/A'} • {v.year}</p>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(v.status)}</td>
                    <td className="px-6 py-4">
                      <p className="font-extrabold text-slate-700">{formatVND(v.startPrice || v.basePrice)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {v.status === 'IN_AUCTION' || v.status === 'SOLD' ? (
                          <button disabled className="w-10 h-10 rounded-xl bg-slate-50 text-slate-300 flex items-center justify-center cursor-not-allowed border border-slate-100"><Edit3 size={18} /></button>
                        ) : (
                          <Link to={`/seller/products/${v.id}/edit`} className="w-10 h-10 rounded-xl bg-white text-slate-500 hover:text-blue-600 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 flex items-center justify-center transition-all shadow-sm">
                            <Edit3 size={18} />
                          </Link>
                        )}
                        
                        {v.status === 'CANCELLED' ? (
                          <button
                            disabled={!v.id || actionLoadingId === v.id}
                            onClick={() => v.id && setConfirmModal({ mode: 'restore', id: v.id, title: 'Khôi phục sản phẩm', message: 'Bạn muốn đưa chiếc xe này trở lại danh sách kiểm duyệt ban đầu?' })}
                            className="w-10 h-10 rounded-xl bg-white text-emerald-500 hover:text-white hover:bg-emerald-500 border border-slate-200 hover:border-emerald-500 flex items-center justify-center transition-all shadow-sm disabled:opacity-50"
                          >
                            {actionLoadingId === v.id ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
                          </button>
                        ) : (
                          <button
                            disabled={!v.id || actionLoadingId === v.id}
                            onClick={() => v.id && setConfirmModal({ mode: 'delete', id: v.id, title: 'Xác nhận Rút xe', message: 'Hồ sơ xe này sẽ bị chuyển thành trạng thái Hủy (Xóa mềm). Bạn có chắc chắn muốn bỏ đăng ký?' })}
                            className="w-10 h-10 rounded-xl bg-white text-red-500 hover:text-white hover:bg-red-500 border border-slate-200 hover:border-red-500 flex items-center justify-center transition-all shadow-sm disabled:opacity-50"
                          >
                            {actionLoadingId === v.id ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setConfirmModal(null)} />
          <div className="relative bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-300">
            <button onClick={() => setConfirmModal(null)} className="absolute top-4 right-4 p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors"><X size={20}/></button>
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg ${confirmModal.mode === 'delete' ? 'bg-red-50 text-red-500 shadow-red-500/20' : 'bg-emerald-50 text-emerald-500 shadow-emerald-500/20'}`}>
               {confirmModal.mode === 'delete' ? <Trash2 size={32}/> : <RefreshCw size={32}/>}
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-2">{confirmModal.title}</h3>
            <p className="text-slate-500 text-sm leading-relaxed mb-8">{confirmModal.message}</p>
            <div className="flex gap-3">
              <button disabled={!!actionLoadingId} onClick={() => setConfirmModal(null)} className="flex-1 py-3 font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">Đóng</button>
              <button disabled={!!actionLoadingId} onClick={confirmAction} className={`flex-1 py-3 font-bold text-white rounded-xl shadow-lg transition-all flex items-center justify-center ${confirmModal.mode === 'delete' ? 'bg-red-500 hover:bg-red-600 shadow-red-500/30' : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/30'}`}>
                {actionLoadingId ? <Loader2 size={18} className="animate-spin" /> : 'Xác Nhận'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
