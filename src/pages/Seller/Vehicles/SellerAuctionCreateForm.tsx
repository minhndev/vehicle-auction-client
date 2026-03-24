import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sellerApi } from '../../../features/seller/api/sellerApi';
import { auctionApi } from '../../../features/bidding/api/auctionApi';
import { usePageI18n } from '../../../i18n/usePageI18n';
import type { AuctionRequest, ProductResponse } from '../../../types/index';
import { Car, CalendarClock, DollarSign, Tag, ShieldCheck, CheckCircle2, XCircle, ArrowLeft, Loader2, Info } from 'lucide-react';

const formatVND = (amount?: number) =>
  amount
    ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
    : '—';

const toBackendLocalDateTime = (input: string): string => {
  if (!input) return input;
  return input.length === 16 ? `${input}:00` : input;
};

export const SellerAuctionCreateForm: React.FC = () => {
  const { tp } = usePageI18n();
  const navigate = useNavigate();
  
  const [eligibleProducts, setEligibleProducts] = useState<ProductResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [depositMode, setDepositMode] = useState<'MANUAL' | 'PERCENT_OF_AUCTION' | 'PERCENT_OF_PRODUCT'>('PERCENT_OF_AUCTION');
  const [depositPercent, setDepositPercent] = useState(10);
  const [formData, setFormData] = useState<AuctionRequest>({
    productId: '',
    startTime: '',
    endTime: '',
    startPrice: 0,
    bidIncrement: 500000,
    depositAmount: 10000000,
  });

  useEffect(() => {
    fetchEligibleProducts();
  }, []);

  const fetchEligibleProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [vehicleData, auctionData] = await Promise.all([
        sellerApi.getMyVehicles(),
        auctionApi.getPublicAuctions({ page: 0, size: 200 }) // Load basic auctions to map active ones
      ]);

      const myVehicles = Array.isArray(vehicleData) ? vehicleData : (vehicleData as any)?.content || [];
      const rawAuctions = Array.isArray((auctionData as any)?.content) ? (auctionData as any).content : [];
      
      const activeAuctionProductIds = new Set(
        rawAuctions.filter((a: any) => a.status === 'UPCOMING' || a.status === 'ACTIVE').map((a: any) => String(a.productId))
      );

      const eligible = myVehicles.filter(
        (v: ProductResponse) => (v.status === 'APPROVED' || v.status === 'IN_AUCTION') && !!v.id && !activeAuctionProductIds.has(String(v.id))
      );

      setEligibleProducts(eligible);
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || tp('sellerAuctions.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const selectedProduct = eligibleProducts.find((p) => String(p.id) === String(formData.productId));
  const productValue = Number(selectedProduct?.startPrice || selectedProduct?.basePrice || 0);

  const getDepositBaseAmount = () => {
    if (depositMode === 'PERCENT_OF_PRODUCT') return productValue;
    return Number(formData.startPrice) || 0;
  };

  const computedDepositAmount = Math.max(0, Math.round((getDepositBaseAmount() * Number(depositPercent || 0)) / 100));

  const handleCreateAuction = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.productId || !formData.startTime || !formData.endTime) {
      setError('Vui lòng điền đủ thông tin xe và thời gian.');
      return;
    }

    const start = new Date(formData.startTime).getTime();
    const end = new Date(formData.endTime).getTime();
    if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
      setError('Thời gian kết thúc phải lớn hơn thời gian bắt đầu.');
      return;
    }

    const effectiveDeposit = depositMode === 'MANUAL' ? Number(formData.depositAmount) : computedDepositAmount;
    if (!Number.isFinite(effectiveDeposit) || effectiveDeposit <= 0) {
      setError('Tiền cọc không hợp lệ.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await auctionApi.createAuction({
        ...formData,
        startTime: toBackendLocalDateTime(formData.startTime),
        endTime: toBackendLocalDateTime(formData.endTime),
        depositAmount: effectiveDeposit,
      });

      alert('Đã tạo phiên đấu giá thành công! Quản trị viên sẽ phê duyệt phiên của bạn.');
      navigate('/seller/auctions');
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Lỗi khi tạo phiên đấu giá.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-[#2e3d83] mb-4" size={48} />
        <h2 className="text-xl font-bold text-slate-600">Đang chuẩn bị dữ liệu cấu hình...</h2>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="w-12 h-12 bg-white border border-slate-200 text-slate-400 hover:text-[#2e3d83] hover:border-[#2e3d83] rounded-2xl flex items-center justify-center transition-all shadow-sm">
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-3xl font-black text-[#2e3d83]">Tạo Phiên Đấu Giá Mới</h1>
          <p className="text-slate-500 font-medium tracking-wide">Thiết lập thời gian và cấu hình rào cản tài chính cho xe của bạn.</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 flex items-center gap-3 font-semibold shadow-sm">
          <XCircle size={20} /> {error}
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <form onSubmit={handleCreateAuction}>
          
          <div className="p-8 md:p-12 space-y-12">
            
            {/* Step 1: Chọn Xe */}
            <div>
              <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
                <span className="w-8 h-8 rounded-full bg-[#2e3d83]/10 text-[#2e3d83] flex items-center justify-center text-sm">1</span> 
                Chọn Phương Tiện
              </h3>
              
              {eligibleProducts.length === 0 ? (
                 <div className="p-8 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 flex flex-col items-center justify-center text-center">
                    <Car size={48} className="text-slate-300 mb-4" />
                    <h4 className="text-lg font-bold text-slate-700 mb-2">Bạn không có mẫu xe nào hợp lệ để tạo phiên!</h4>
                    <p className="text-slate-500 mb-6 max-w-md">Các xe đang trong trạng thái "Chờ duyệt", hoặc đã liên kết với một phiên đấu giá khác sẽ không xuất hiện ở đây.</p>
                    <button type="button" onClick={() => navigate('/seller/products/new')} className="px-6 py-3 bg-[#2e3d83] text-white font-bold rounded-xl shadow-lg shadow-[#2e3d83]/20 hover:-translate-y-0.5 transition-all">
                      Đăng ký đăng kiểm xe mới
                    </button>
                 </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  <div className="md:col-span-8">
                    <label className="text-sm font-bold text-slate-700 uppercase tracking-wide block mb-2"><Car size={16} className="inline mr-1"/> Danh sách xe khả dụng <span className="text-red-500">*</span></label>
                    <select required value={formData.productId} onChange={(e) => {
                      const productId = e.target.value;
                      const product = eligibleProducts.find((item) => String(item.id) === String(productId));
                      setFormData(prev => ({ ...prev, productId, startPrice: Number(product?.startPrice || product?.basePrice || 0) || prev.startPrice }));
                    }} className="w-full px-5 py-4 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:border-[#2e3d83] focus:ring-4 focus:ring-[#2e3d83]/10 outline-none transition-all font-bold appearance-none text-[#2e3d83] text-lg">
                      <option value="" className="text-slate-400">--- Bấm để chọn một chiếc xe ---</option>
                      {eligibleProducts.map(p => <option key={p.id} value={String(p.id)}>{p.name || `${p.brand} ${p.model} (${p.year})`}</option>)}
                    </select>
                  </div>
                  {selectedProduct && (
                    <div className="md:col-span-4 bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col justify-center">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Định giá tham chiếu</span>
                      <span className="font-black text-xl text-[#f4c23d]">{formatVND(productValue)}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Step 2: Cài Đặt Thời Gian & Mức Giá */}
            <div className={!formData.productId ? 'opacity-30 pointer-events-none transition-opacity' : 'transition-opacity'}>
              <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
                <span className="w-8 h-8 rounded-full bg-[#2e3d83]/10 text-[#2e3d83] flex items-center justify-center text-sm">2</span> 
                Cấu Hình Đấu Giá
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Thời gian */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 uppercase tracking-wide flex items-center gap-2"><CalendarClock size={16}/> Thời Điểm Mở Phiên <span className="text-red-500">*</span></label>
                    <input type="datetime-local" required value={formData.startTime} onChange={e => setFormData(p => ({...p, startTime: e.target.value}))}
                      className="w-full px-5 py-4 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:border-[#2e3d83] focus:ring-4 focus:ring-[#2e3d83]/10 outline-none font-medium transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 uppercase tracking-wide flex items-center gap-2"><CalendarClock size={16}/> Hạn Chót Kết Thúc <span className="text-red-500">*</span></label>
                    <input type="datetime-local" required value={formData.endTime} onChange={e => setFormData(p => ({...p, endTime: e.target.value}))}
                      className="w-full px-5 py-4 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:border-[#2e3d83] focus:ring-4 focus:ring-[#2e3d83]/10 outline-none font-medium transition-all" />
                  </div>
                </div>

                {/* Mức Giá */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 uppercase tracking-wide flex items-center gap-2"><Tag size={16}/> Giá Khởi Điểm Bán <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <span className="absolute left-5 top-1/2 -translate-y-1/2 font-extrabold text-slate-400">₫</span>
                      <input type="number" required min={1000000} value={formData.startPrice || ''} onChange={e => setFormData(p => ({...p, startPrice: Number(e.target.value)}))}
                        className="w-full pl-12 pr-5 py-4 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:border-[#2e3d83] focus:ring-4 focus:ring-[#2e3d83]/10 outline-none font-extrabold text-[#2e3d83] transition-all text-lg" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 uppercase tracking-wide flex items-center gap-2"><DollarSign size={16}/> Thiết lập Bước Giá (Tối thiểu) <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <span className="absolute left-5 top-1/2 -translate-y-1/2 font-extrabold text-slate-400">₫</span>
                      <input type="number" required min={1000} value={formData.bidIncrement || ''} onChange={e => setFormData(p => ({...p, bidIncrement: Number(e.target.value)}))}
                        className="w-full pl-12 pr-5 py-4 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:border-[#2e3d83] focus:ring-4 focus:ring-[#2e3d83]/10 outline-none font-bold text-slate-700 transition-all text-lg" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3: Tính Toán Tiền Cọc */}
            <div className={!formData.productId ? 'opacity-30 pointer-events-none transition-opacity' : 'transition-opacity'}>
              <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
                <span className="w-8 h-8 rounded-full bg-[#2e3d83]/10 text-[#2e3d83] flex items-center justify-center text-sm">3</span> 
                Hàng Rào Tiền Cọc Đảm Bảo
              </h3>

              <div className="bg-[#2e3d83]/5 rounded-3xl p-8 border border-[#2e3d83]/10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                  
                  <div className="space-y-6">
                    <div>
                      <label className="text-sm font-bold text-[#2e3d83] uppercase tracking-wide flex items-center gap-2 mb-3"><ShieldCheck size={16}/> Phương Thức Áp Dụng</label>
                      <select value={depositMode} onChange={e => setDepositMode(e.target.value as typeof depositMode)} className="w-full px-5 py-4 rounded-xl bg-white border border-[#2e3d83]/20 focus:border-[#2e3d83] outline-none font-bold text-slate-700 shadow-sm transition-all appearance-none cursor-pointer">
                        <option value="PERCENT_OF_AUCTION">Tính theo % Giá Khởi Điểm Phiên Đấu</option>
                        <option value="PERCENT_OF_PRODUCT">Tính theo % Giá Tham Chiếu Của Xe</option>
                        <option value="MANUAL">Nhập số tiền VNĐ cố định</option>
                      </select>
                    </div>

                    {depositMode !== 'MANUAL' ? (
                      <div className="space-y-4 bg-white p-6 rounded-2xl border border-[#2e3d83]/20 shadow-sm relative overflow-hidden">
                        <div className="flex justify-between items-end mb-2 relative z-10">
                          <span className="font-bold text-slate-500">Tỷ lệ Trích Lập</span>
                          <span className="font-black text-3xl text-[#2e3d83]">{depositPercent}%</span>
                        </div>
                        <input type="range" min={5} max={20} step={1} value={depositPercent} onChange={e => setDepositPercent(Number(e.target.value))}
                          className="w-full accent-[#2e3d83] h-3 bg-slate-100 rounded-lg appearance-none cursor-pointer relative z-10" />
                        <div className="flex justify-between mt-2 text-xs text-slate-400 font-bold uppercase tracking-widest relative z-10">
                          <span>5% Min</span>
                          <span>20% Max</span>
                        </div>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#f4c23d]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                      </div>
                    ) : (
                      <div className="space-y-2 relative">
                        <label className="text-sm font-bold text-[#2e3d83] uppercase tracking-wide">Nhập Tiền Cọc (VND)</label>
                        <span className="absolute left-5 top-[2.4rem] font-extrabold text-slate-400">₫</span>
                        <input type="number" required min={0} value={formData.depositAmount || ''} onChange={e => setFormData(p => ({...p, depositAmount: Number(e.target.value)}))} placeholder="Nhập số tiền VNĐ..."
                          className="w-full pl-12 pr-5 py-4 rounded-xl border-2 border-[#f4c23d] bg-yellow-50 focus:border-yellow-500 outline-none font-black text-[#2e3d83] text-xl transition-all shadow-sm" />
                      </div>
                    )}
                  </div>

                  <div className="bg-white rounded-2xl p-8 border border-[#2e3d83]/20 shadow-lg shadow-[#2e3d83]/10 flex flex-col items-center justify-center text-center">
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center justify-center gap-2"><Info size={16}/> SỐ TIỀN CỌC ÁP DỤNG TRÊN MỖI LƯỢT</p>
                    <p className="text-4xl md:text-5xl font-black text-[#f4c23d] drop-shadow-sm mb-4">
                      {depositMode === 'MANUAL' ? formatVND(formData.depositAmount) : formatVND(computedDepositAmount)}
                    </p>
                    <p className="text-sm text-slate-500 max-w-xs leading-relaxed">
                      Người mua sẽ phải thanh toán số tiền này qua VNPAY trước khi được phép bấm tham gia đấu giá vào xe của bạn.
                    </p>
                  </div>

                </div>
              </div>
            </div>

          </div>

          <div className="px-8 md:px-12 py-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <button type="button" onClick={() => navigate('/seller/auctions')} className="px-6 py-3 font-bold text-slate-500 hover:text-slate-800 transition-colors">Hủy Quay Lại Bảng</button>
            <button type="submit" disabled={submitting || !formData.productId} className="flex items-center gap-2 px-10 py-4 bg-gradient-to-r from-[#2e3d83] to-[#1a2350] text-white rounded-xl shadow-xl shadow-[#2e3d83]/30 hover:-translate-y-0.5 transition-all font-black uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed">
              {submitting ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
              {submitting ? 'Đang Khởi Tạo...' : 'Đệ Trình Phiên Mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
