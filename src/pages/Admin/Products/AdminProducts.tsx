import React, { useEffect, useState } from 'react';
import { adminApi } from '../../../api/adminApi';
import { usePageI18n } from '../../../i18n/usePageI18n';
import type { ProductResponse } from '../../../types/index';
import { getErrorMessage } from '../../../utils/errorHelpers';
import { 
  Search, Eye, CheckCircle2, XCircle, Trash2, ImageIcon, 
  AlertCircle, Mail, Loader2, RefreshCw, X 
} from 'lucide-react';
import { SellerEmail } from './components/SellerEmail';

export const AdminProducts: React.FC = () => {
  const [items, setItems] = useState<ProductResponse[]>([]);
  const { getProductStatusLabel } = usePageI18n();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState('all');
  const [keyword, setKeyword] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<ProductResponse | null>(null);
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  const handleOpenModal = (item: ProductResponse) => {
    setSelectedItem(item);
    setMainImageIndex(0);
  };

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminApi.getProducts({ page: 0, size: 100, sort: 'createdAt,desc', ...(status !== 'all' ? { status } : {}), ...(keyword.trim() ? { keyword: keyword.trim() } : {}) });
      setItems(data);
    } catch (err) {
      setError(getErrorMessage(err, 'Không thể tải danh sách xe.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [status]);

  const getStatusBadge = (st?: string) => {
    switch (st) {
      case 'PENDING': return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-100 text-amber-700">{getProductStatusLabel('PENDING')}</span>;
      case 'APPROVED': return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-100 text-emerald-700">{getProductStatusLabel('APPROVED')}</span>;
      case 'IN_AUCTION': return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-blue-100 text-blue-700">{getProductStatusLabel('IN_AUCTION')}</span>;
      case 'REJECTED': return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-red-100 text-red-700">{getProductStatusLabel('REJECTED')}</span>;
      case 'SOLD': return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500 text-white shadow-sm">{getProductStatusLabel('SOLD')}</span>;
      case 'CANCELLED': return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-slate-200 text-slate-600">{getProductStatusLabel('CANCELLED')}</span>;
      default: return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-slate-100 text-slate-500">{getProductStatusLabel(st)}</span>;
    }
  };

  const handleApprove = async (id: string) => {
    if (!window.confirm('Duyệt xe này?')) return;
    try {
      setActionLoadingId(id);
      await adminApi.approveVehicle(id);
      await fetchItems();
    } catch (err) { setError(getErrorMessage(err, 'Không thể duyệt.')); } finally { setActionLoadingId(null); }
  };

  const handleReject = async (id: string) => {
    const reason = window.prompt('Nhập lý do từ chối:');
    if (!reason) return;
    try {
      setActionLoadingId(id);
      await adminApi.rejectVehicle(id, reason);
      await fetchItems();
    } catch (err) { setError(getErrorMessage(err, 'Không thể từ chối.')); } finally { setActionLoadingId(null); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Xóa mềm xe này?')) return;
    try {
      setActionLoadingId(id);
      await adminApi.deleteProduct(id);
      await fetchItems();
    } catch (err) { setError(getErrorMessage(err, 'Lỗi.')); } finally { setActionLoadingId(null); }
  };

  const handleRestore = async (id: string) => {
    if (!window.confirm('Khôi phục lại xe này vào hệ thống?')) return;
    try {
      setActionLoadingId(id);
      await adminApi.restoreProduct(id);
      await fetchItems();
    } catch (err) { setError(getErrorMessage(err, 'Lỗi.')); } finally { setActionLoadingId(null); }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-2">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 mb-2">Quản Lý Xe Đăng Ký</h1>
          <p className="text-slate-500 max-w-xl">Trình quản lý tập trung theo dõi tất cả các tài sản đăng ký, hỗ trợ kiểm duyệt xe chờ bán trên hệ thống đấu giá.</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 flex items-center gap-2 font-medium">
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {/* Control Panel */}
      <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-100 flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Search size={18}/></div>
          <input type="text" placeholder="Tìm theo Hãng xe, Mẫu xe, ID..." value={keyword} onChange={(e) => setKeyword(e.target.value)} onKeyDown={e => e.key === 'Enter' && fetchItems()}
            className="w-full pl-12 pr-5 py-3 rounded-xl bg-slate-50 hover:bg-slate-100 focus:bg-white focus:ring-2 ring-blue-500/20 outline-none transition-colors border-none" />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)} 
          className="px-5 py-3 rounded-xl bg-slate-50 border-r-8 border-transparent focus:ring-2 ring-blue-500/20 outline-none font-medium text-slate-600 cursor-pointer text-sm">
          <option value="all">Tất cả Trạng Thái</option>
          <option value="PENDING">Chờ Duyệt</option>
          <option value="APPROVED">Đã Duyệt</option>
          <option value="IN_AUCTION">Đang Đấu Giá</option>
          <option value="SOLD">Đã Bán</option>
          <option value="CANCELLED">Đã Hủy</option>
        </select>
        <button onClick={fetchItems} className="px-6 py-3 bg-[#2e3d83] text-white hover:bg-blue-800 font-bold rounded-xl transition-all shadow-md flex items-center gap-2">Tìm kiếm</button>
      </div>

      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest w-20">Ảnh</th>
                <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest min-w-[200px]">Định Danh Xe</th>
                <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Khách/Doanh Nghiệp (ID)</th>
                <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Cập Nhật & Trạng Thái</th>
                <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Giá Tư Vấn</th>
                <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Bộ Quản Trị</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={6} className="py-20 text-center text-slate-400"><Loader2 className="animate-spin text-blue-500 mx-auto mb-3" size={32}/> Tải danh mục...</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={6} className="py-20 text-center text-slate-400 font-medium">Bảng dữ liệu trống.</td></tr>
              ) : (
                items.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="w-16 h-12 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center">
                        {item.images?.[0]?.url ? <img src={item.images[0].url} alt="img" className="w-full h-full object-cover"/> : <ImageIcon size={20} className="text-slate-300"/>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-800 text-sm mb-0.5">{item.name || `${item.brand} ${item.model}`.trim() || 'No Name'}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">VIN: {item.vinNumber || 'MISSING'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-600 text-sm bg-slate-100 px-2.5 py-1.5 rounded-lg border border-slate-200 shadow-sm flex items-center gap-2">
                          <Mail size={14} className="text-[#2e3d83] opacity-70" />
                          <SellerEmail sellerId={item.sellerEmail || (item.createdBy?.includes('@') ? item.createdBy : item.sellerId) || item.createdBy || ''} />
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col items-start gap-1">
                        {getStatusBadge(item.status)}
                        <span className="text-xs text-slate-400 font-medium">{item.createdAt ? new Date(item.createdAt).toLocaleDateString('vi-VN') : ''}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-black text-slate-700 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.startPrice || item.basePrice || 0)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleOpenModal(item)} className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-500 hover:text-white flex items-center justify-center transition-all" title="Xem chi tiết"><Eye size={16}/></button>
                        {item.status === 'PENDING' && item.id ? (
                          <>
                            <button onClick={() => handleApprove(item.id as string)} disabled={actionLoadingId === item.id} className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white flex items-center justify-center transition-all disabled:opacity-50"><CheckCircle2 size={16}/></button>
                            <button onClick={() => handleReject(item.id as string)} disabled={actionLoadingId === item.id} className="w-8 h-8 rounded-lg bg-red-50 text-red-600 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all disabled:opacity-50"><XCircle size={16}/></button>
                          </>
                        ) : null}
                        
                        {item.status === 'CANCELLED' && item.id ? (
                          <button onClick={() => handleRestore(item.id as string)} disabled={actionLoadingId === item.id} className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-800 hover:text-white flex items-center justify-center transition-all disabled:opacity-50" title="Khôi phục"><RefreshCw size={16}/></button>
                        ) : item.id ? (
                          <button onClick={() => handleDelete(item.id as string)} disabled={actionLoadingId === item.id} className="w-8 h-8 rounded-lg bg-red-50 text-red-600 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all disabled:opacity-50"><Trash2 size={16}/></button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Vehicle Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setSelectedItem(null)}></div>
          <div className="bg-white relative z-10 w-full max-w-5xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-300">
            {/* Header */}
            <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
              <h2 className="text-2xl font-black text-slate-800">{selectedItem.brand} {selectedItem.model}</h2>
              <button onClick={() => setSelectedItem(null)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-500 transition-colors bg-white shadow-sm border border-slate-200"><X size={20}/></button>
            </div>
            
            {/* Body */}
            <div className="overflow-y-auto p-8 flex-1 custom-scrollbar">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Images */}
                <div className="lg:col-span-7 space-y-4">
                  <div 
                    className="bg-slate-100 rounded-3xl aspect-[4/3] overflow-hidden border border-slate-200 flex items-center justify-center shadow-inner relative group cursor-zoom-in"
                    onClick={() => selectedItem.images?.[mainImageIndex]?.url && setZoomedImage(selectedItem.images[mainImageIndex].url)}
                  >
                    {selectedItem.images && selectedItem.images.length > 0 ? (
                      <img 
                        key={selectedItem.images[mainImageIndex]?.url}
                        src={selectedItem.images[mainImageIndex]?.url || selectedItem.images[0].url} 
                        alt="Main" 
                        loading="eager"
                        className="w-full h-full object-cover transition-all duration-500 group-hover:scale-[1.03] animate-in fade-in zoom-in-95" 
                      />
                    ) : (
                      <ImageIcon size={64} className="text-slate-300"/>
                    )}
                    <div className="absolute top-4 left-4">
                      {getStatusBadge(selectedItem.status)}
                    </div>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors pointer-events-none rounded-3xl" />
                  </div>
                  {selectedItem.images && selectedItem.images.length > 1 && (
                    <div className="grid grid-cols-5 gap-3">
                       {selectedItem.images.map((img, idx) => (
                         <div 
                           key={idx} 
                           onClick={() => setMainImageIndex(idx)}
                           className={`bg-slate-100 rounded-2xl aspect-square overflow-hidden border-2 cursor-pointer transition-all ${mainImageIndex === idx ? 'border-blue-500 shadow-md scale-105' : 'border-transparent hover:border-slate-300'}`}
                         >
                           <img src={img.url} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                         </div>
                       ))}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="lg:col-span-5 flex flex-col">
                  <div className="mb-6">
                     <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Mã Định Danh Phương Tiện (VIN)</p>
                     <p className="text-xl font-mono font-bold text-slate-800 bg-slate-100 inline-block px-3 py-1.5 rounded-lg border border-slate-200">{selectedItem.vinNumber || 'CHƯA CẬP NHẬT'}</p>
                  </div>
                  
                  <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 mb-6 space-y-4 shadow-sm flex-1">
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-200 pb-2">Thông Số Kỹ Thuật</h3>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500 font-medium">Năm sản xuất</span>
                      <span className="font-bold text-slate-800">{selectedItem.manufactureYear || selectedItem.year || '-'}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500 font-medium">Số ODO</span>
                      <span className="font-bold text-slate-800">{selectedItem.mileage ? selectedItem.mileage.toLocaleString() + ' km' : '-'}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500 font-medium">Màu sắc</span>
                      <span className="font-bold text-slate-800 capitalize">{selectedItem.color || '-'}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500 font-medium">Nhiên liệu</span>
                      <span className="font-bold text-slate-800 capitalize">{selectedItem.fuelType || '-'}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500 font-medium">Số máy (Engine No)</span>
                      <span className="font-bold text-slate-800 uppercase">{selectedItem.engineNumber || '-'}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500 font-medium">Biển số</span>
                      <span className="font-bold text-slate-800 uppercase">{selectedItem.licensePlate || '-'}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500 font-medium">Hộp số</span>
                      <span className="font-bold text-slate-800 capitalize">{selectedItem.transmission || '-'}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm pt-3 border-t border-slate-200/60">
                      <span className="text-slate-500 font-medium">Người đăng ký</span>
                      <span className="font-bold text-[#2e3d83]">
                        <SellerEmail sellerId={selectedItem.sellerEmail || (selectedItem.createdBy?.includes('@') ? selectedItem.createdBy : selectedItem.sellerId) || selectedItem.createdBy || ''} />
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-white border-2 border-emerald-100 rounded-3xl p-6 shadow-sm mb-6">
                    <p className="text-xs font-black text-emerald-500 uppercase tracking-widest mb-1">Giá Tư Vấn Niêm Yết</p>
                    <p className="text-3xl font-black text-emerald-600 tracking-tight">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedItem.startPrice || selectedItem.basePrice || 0)}
                    </p>
                  </div>
                </div>
              </div>
              
              {selectedItem.description && (
                <div className="mt-8 bg-slate-50 rounded-3xl p-8 border border-slate-100 shadow-sm">
                  <h4 className="font-black text-slate-800 mb-4 text-lg">Mô tả thêm / Đánh giá</h4>
                  <p className="text-slate-600 leading-relaxed max-w-4xl whitespace-pre-line">
                    {selectedItem.description}
                  </p>
                </div>
              )}
            </div>

            {/* Actions Footer */}
            <div className="bg-white px-8 py-5 border-t border-slate-100 flex items-center justify-end gap-4 shrink-0 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)] relative z-10">
              <button onClick={() => setSelectedItem(null)} className="px-6 py-3 rounded-full font-bold text-slate-600 bg-white border-2 border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-colors focus:ring-4 ring-slate-100">Đóng Cửa Sổ</button>
              {selectedItem.status === 'PENDING' && (
                <>
                  <button onClick={() => { handleReject(selectedItem.id as string); setSelectedItem(null); }} className="px-6 py-3 rounded-full font-bold text-red-600 bg-red-50 border-2 border-red-100 hover:bg-red-500 hover:text-white hover:border-red-500 transition-colors flex items-center gap-2 shadow-sm focus:ring-4 ring-red-100"><XCircle size={18}/> Từ Chối Hồ Sơ</button>
                  <button onClick={() => { handleApprove(selectedItem.id as string); setSelectedItem(null); }} className="px-8 py-3 rounded-full font-bold text-white bg-[#10b981] shadow-lg shadow-emerald-500/30 hover:bg-emerald-400 transition-transform hover:-translate-y-0.5 flex items-center gap-2 focus:ring-4 ring-emerald-200"><CheckCircle2 size={20}/> Phê Duyệt Xe Này</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Zoom Modal */}
      {zoomedImage && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setZoomedImage(null)}>
          <button onClick={() => setZoomedImage(null)} className="absolute top-6 right-6 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-colors"><X size={24}/></button>
          <img src={zoomedImage} alt="Zoomed" className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl animate-in zoom-in-95 duration-300" />
        </div>
      )}
    </div>
  );
};
