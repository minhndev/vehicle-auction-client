import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../store';
import { orderApi } from '../../../api/orderApi';
import { usePageI18n } from '../../../i18n/usePageI18n';

export const UserDashboard: React.FC = () => {
  const { tp } = usePageI18n();
  const user = useSelector((state: RootState) => state.auth.user);

  const [pendingOrders, setPendingOrders] = useState(0);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [ordersRes] = await Promise.allSettled([
          orderApi.getMyOrders({ page: 0, size: 1 })
        ]);

        if (ordersRes.status === 'fulfilled') {
          const orders = ordersRes.value.content ?? [];
          const pending = orders.filter((o) => o.status === 'PENDING_PAYMENT').length;
          setPendingOrders(ordersRes.value.totalElements ?? pending);
        }
      } catch {
        // fail silently — UI degrades gracefully
      } finally {
        setLoadingStats(false);
      }
    };
    loadStats();
  }, []);

  const statCards = [
    {
      icon: '📦',
      label: tp('userDashboard.pendingOrders'),
      value: loadingStats ? '…' : pendingOrders,
      to: '/user/orders',
      highlight: pendingOrders > 0,
    },
    {
      icon: '❤️',
      label: tp('userDashboard.watchlist'),
      value: '—',
      to: '/user/watchlist',
      highlight: false,
    },
    {
      icon: '⚖️',
      label: tp('userDashboard.bidHistory'),
      value: '—',
      to: '/user/bids',
      highlight: false,
    },
  ];

  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold text-slate-800 mb-2">{tp('userDashboard.title')}</h1>
      <p className="text-slate-500 mb-8">
        {tp('userDashboard.welcome')}, <strong className="text-slate-700">{user?.firstName} {user?.lastName}</strong>!
      </p>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card) => (
          <Link key={card.label} to={card.to} className="group">
            <div
              className={`flex flex-col items-center justify-center p-6 border rounded-2xl bg-white shadow-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-md ${card.highlight ? 'border-red-500' : 'border-slate-100'
                }`}
            >
              <span className="text-3xl mb-3">{card.icon}</span>
              <h3 className="text-sm font-medium text-slate-500 mb-1">{card.label}</h3>
              <p className={`text-2xl font-bold ${card.highlight ? 'text-red-500' : 'text-slate-800'}`}>
                {card.value}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* Informative placeholder to fill space */}
      <div className="mt-12 bg-slate-50 border border-slate-100 rounded-2xl p-6 text-center">
        <h3 className="text-lg font-bold text-slate-700 mb-2">Bắt đầu đấu giá ngay!</h3>
        <p className="text-slate-500 mb-4 max-w-md mx-auto">
          Tại Vehicle Auction, hàng trăm chiếc xe chất lượng đang chờ bạn khám phá. Hãy duyệt qua danh sách xe và đặt giá ngay hôm nay.
        </p>
        <Link to="/auctions" className="inline-flex items-center justify-center px-6 py-2.5 bg-[#2e3d83] text-white font-medium rounded-lg hover:bg-opacity-90 transition-colors">
          Xem danh sách xe
        </Link>
      </div>
    </div>
  );
};
