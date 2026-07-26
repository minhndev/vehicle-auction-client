import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderApi } from '../../../api/orderApi';
import type { OrderResponse } from '../../../types/index';
import {
  Trophy, Package, Clock, CheckCircle2, XCircle, AlertCircle,
  ChevronRight, RefreshCw, Wallet, Car,
} from 'lucide-react';

const formatVND = (amount?: number | null) => {
  if (amount == null) return '—';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(amount);
};

const formatDate = (s?: string | null) => {
  if (!s) return '—';
  return new Date(s).toLocaleDateString('vi-VN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const STATUS_MAP: Record<string, { icon: React.ReactNode; label: string; bg: string; text: string; border: string }> = {
  PENDING_PAYMENT: {
    icon: <Clock size={13} />, label: 'Chờ thanh toán',
    bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200',
  },
  PAID: {
    icon: <CheckCircle2 size={13} />, label: 'Đã thanh toán',
    bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200',
  },
  CANCELLED: {
    icon: <XCircle size={13} />, label: 'Đã hủy',
    bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200',
  },
  REFUNDED: {
    icon: <RefreshCw size={13} />, label: 'Đã hoàn tiền',
    bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200',
  },
};

const getStatus = (s?: string) =>
  STATUS_MAP[s ?? ''] ?? { icon: <AlertCircle size={13} />, label: s || 'Không xác định', bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200' };

const StatusBadge: React.FC<{ status?: string }> = ({ status }) => {
  const cfg = getStatus(status);
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      {cfg.icon} {cfg.label}
    </span>
  );
};

export const MyOrders: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fetchOrders = useCallback(async (p: number) => {
    try {
      setLoading(true);
      setError(null);
      const res = await orderApi.getMyOrders({ page: p, size: 10 });
      setOrders(res.content ?? []);
      setTotalPages(res.totalPages ?? 1);
    } catch {
      setError('Không thể tải danh sách hợp đồng. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOrders(page); }, [page, fetchOrders]);

  // Auto-refresh every 10s
  useEffect(() => {
    const iv = setInterval(() => fetchOrders(page), 10000);
    const onFocus = () => fetchOrders(page);
    window.addEventListener('focus', onFocus);
    return () => { clearInterval(iv); window.removeEventListener('focus', onFocus); };
  }, [page, fetchOrders]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 py-10 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-[#2e3d83] rounded-xl flex items-center justify-center shadow-lg">
              <Package className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight">Hợp Đồng & Thanh Toán</h1>
              <p className="text-slate-500 text-sm">Quản lý các hợp đồng đấu giá thắng của bạn</p>
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading && orders.length === 0 && (
          <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-slate-100">
            <div className="w-12 h-12 border-4 border-[#2e3d83]/20 border-t-[#2e3d83] rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-500 font-medium">Đang tải dữ liệu...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3 mb-6">
            <AlertCircle className="text-red-500 shrink-0" size={18} />
            <p className="text-red-700 text-sm font-medium">{error}</p>
            <button onClick={() => fetchOrders(page)} className="ml-auto text-red-600 hover:text-red-800 text-sm font-bold">Thử lại</button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && orders.length === 0 && (
          <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-slate-100">
            <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Trophy className="text-slate-300" size={40} />
            </div>
            <h3 className="text-xl font-black text-slate-700 mb-2">Chưa có hợp đồng nào</h3>
            <p className="text-slate-400 text-sm mb-6">Tham gia đấu giá và chiến thắng để xem hợp đồng tại đây</p>
            <button
              onClick={() => navigate('/auctions')}
              className="px-8 py-3 bg-[#2e3d83] text-white font-bold rounded-2xl hover:bg-[#1e2f6d] transition-colors shadow-lg"
            >
              Xem xe đấu giá →
            </button>
          </div>
        )}

        {/* Orders List */}
        {orders.length > 0 && (
          <div className="space-y-4">
            {orders.map((order) => {
              const isPending = order.status === 'PENDING_PAYMENT';
              return (
                <div
                  key={order.id}
                  className={`bg-white rounded-3xl border shadow-sm overflow-hidden transition-all hover:shadow-md ${isPending ? 'border-amber-200 shadow-amber-50' : 'border-slate-100'}`}
                >
                  {/* Card Header */}
                  <div className={`px-6 py-4 flex items-center justify-between ${isPending ? 'bg-amber-50/60' : 'bg-slate-50/60'} border-b border-slate-100`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isPending ? 'bg-amber-100' : 'bg-slate-100'}`}>
                        <Car size={18} className={isPending ? 'text-amber-600' : 'text-slate-500'} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-sm">
                          {order.productName || 'Xe đấu giá'}
                        </p>
                        <p className="text-xs text-slate-400">
                          #{order.id?.substring(0, 8).toUpperCase()} · {formatDate(order.createdAt)}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={order.status} />
                  </div>

                  {/* Card Body */}
                  <div className="px-6 py-5">
                    <div className="grid grid-cols-3 gap-4 mb-5">
                      <div className="text-center p-3 bg-slate-50 rounded-2xl">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Giá thắng</p>
                        <p className="font-black text-slate-800 text-sm">{formatVND(order.winningPrice)}</p>
                      </div>
                      <div className="text-center p-3 bg-slate-50 rounded-2xl">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Đã cọc</p>
                        <p className="font-black text-emerald-600 text-sm">{formatVND(order.depositAmount)}</p>
                      </div>
                      <div className={`text-center p-3 rounded-2xl ${isPending ? 'bg-amber-50' : 'bg-slate-50'}`}>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Còn lại</p>
                        <p className={`font-black text-sm ${isPending ? 'text-amber-700' : 'text-slate-800'}`}>
                          {formatVND(order.remainingAmount)}
                        </p>
                      </div>
                    </div>

                    {order.shippingAddress && (
                      <p className="text-xs text-slate-500 mb-4 flex items-center gap-1.5">
                        <span>📍</span> {order.shippingAddress}
                      </p>
                    )}

                    <div className="flex gap-3">
                      {isPending && (
                        <button
                          onClick={() => navigate(`/user/orders/${order.id}/checkout`)}
                          className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-[#2e3d83] to-[#1e293b] text-white font-black text-sm rounded-2xl shadow-lg shadow-blue-900/20 hover:shadow-blue-900/40 active:scale-95 transition-all"
                        >
                          <Wallet size={16} /> THANH TOÁN NGAY
                        </button>
                      )}
                      <button
                        onClick={() => navigate(`/user/orders/${order.id}/checkout`)}
                        className={`flex items-center justify-center gap-2 py-3 px-5 border-2 text-sm font-bold rounded-2xl transition-colors ${isPending ? 'border-slate-200 text-slate-600 hover:bg-slate-50' : 'flex-1 border-[#2e3d83]/30 text-[#2e3d83] hover:bg-blue-50'}`}
                      >
                        Chi tiết <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-8">
            <button
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
              className="px-6 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
            >
              ← Trước
            </button>
            <span className="text-sm font-medium text-slate-500">{page + 1} / {totalPages}</span>
            <button
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
              className="px-6 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
            >
              Sau →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
