import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, User, History, Heart, Bell } from 'lucide-react';
import { usePageI18n } from '../i18n/usePageI18n';

export const UserLayout: React.FC = () => {
  const { tp } = usePageI18n();
  const location = useLocation();

  const NAV_ITEMS = [
    {
      id: 'dashboard',
      label: tp('userDashboard.title') || 'Bảng điều khiển',
      icon: LayoutDashboard,
      path: '/user/dashboard',
    },
    {
      id: 'profile',
      label: tp('userDashboard.profileTitle') || 'Hồ sơ của tôi',
      icon: User,
      path: '/user/profile',
    },
    {
      id: 'orders',
      label: tp('userDashboard.ordersTitle') || 'Đơn hàng của tôi',
      icon: History,
      path: '/user/orders',
    },
    {
      id: 'bids',
      label: tp('userDashboard.bidHistory') || 'Lịch sử đặt giá',
      icon: History, // Can change to a better icon if preferred
      path: '/user/bids',
    },
    {
      id: 'watchlist',
      label: tp('userDashboard.watchlist') || 'Danh sách quan tâm',
      icon: Heart,
      path: '/user/watchlist',
    },
    {
      id: 'notifications',
      label: tp('userDashboard.unreadNotifications') || 'Thông báo',
      icon: Bell,
      path: '/user/notifications',
    },
  ];

  return (
    <div className="w-full bg-[#f8fafc] min-h-[calc(100vh-var(--layout-header-height))]">
      <div className="max-w-[1202px] mx-auto py-8 px-4 xl:px-0 flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 sticky top-[calc(var(--layout-header-height)+2rem)]">
            <h2 className="text-[#1e293b] font-bold text-lg px-4 mb-4">Quản lý tài khoản</h2>
            <nav className="flex flex-col gap-1">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname.startsWith(item.path);
                return (
                  <Link
                    key={item.id}
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium text-sm ${
                      isActive
                        ? 'bg-[#2e3d83] text-white shadow-md shadow-[#2e3d83]/20'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-[#2e3d83]'
                    }`}
                  >
                    <Icon size={18} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'text-[#ffcb23]' : ''} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-100 p-6 min-h-[500px]">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
