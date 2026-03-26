import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Gavel, LayoutDashboard, User as UserIcon, History, LogOut } from 'lucide-react';
import type { RootState } from '../../store';
import { logout } from '../../store/slices/authSlice';
import { authService } from '../../features/auth/api/authService';
import { watchlistApi } from '../../api/watchlistApi';
import { auctionApi } from '../../features/bidding/api/auctionApi';
import { AlertCircle, X } from 'lucide-react';
import { NotificationBell } from '../../components/NotificationBell/NotificationBell';
import { useAuctionWebSocket } from '../../hooks/useAuctionWebSocket';

export interface NavItem {
  id: string;
  label: string;
  url: string;
  isActive?: boolean;
  isButton?: boolean;
}

const MENU_ITEMS: NavItem[] = [
  { id: '1', label: 'Trang chủ', url: '/', isActive: true },
  { id: '2', label: 'Xe đấu giá', url: '/auctions' },
  { id: '3', label: 'Đăng bán xe', url: '/sell', isButton: true },
  { id: '4', label: 'Về chúng tôi', url: '/about' },
  { id: '5', label: 'Liên hệ', url: '/contact' },
];

const NavLink = ({ item }: { item: NavItem }) => {
  if (item.isButton) {
    return (
      <Link 
        to={item.url}
        className="flex items-center justify-center bg-[#f4c23d] hover:bg-[#ffcf4c] text-slate-900 font-extrabold px-6 py-2.5 rounded-full text-[15px] tracking-wide uppercase transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-95"
      >
        {item.label}
      </Link>
    );
  }

  return (
    <div className="relative flex flex-col items-center">
      <Link 
        to={item.url}
        className={`text-[#1e293b] text-[16px] leading-[19.2px] hover:text-[#2e3d83] transition-colors ${item.isActive ? 'font-bold' : 'font-medium'}`}
      >
        {item.label}
      </Link>
      {/* Active Indicator Underline */}
      {item.isActive && (
        <div className="absolute -bottom-[6px] w-[20px] h-[3px] bg-[#ffcb23] rounded-full" />
      )}
    </div>
  );
};

export const HeaderNav: React.FC = () => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const notifiedAuctions = useRef<Set<string>>(new Set());
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Global WS for personal notifications (empty auctionId = still connects for /user/queue/notification)
  const { notification: wsNotification } = useAuctionWebSocket('');

  useEffect(() => {
    if (!isAuthenticated) return;

    const checkWatchlist = async () => {
      try {
        const [watchlist, upcomingResponse] = await Promise.all([
          watchlistApi.getWatchlist(),
          auctionApi.getPublicAuctions({ status: 'UPCOMING', size: 50 })
        ]);

        const watchlistProductIds = new Set(watchlist.map(w => String(w.productId)));
        
        // Find upcoming auctions for products in watchlist
        const upcomingAuctions = (upcomingResponse as any).content || [];
        const myUpcoming = upcomingAuctions.filter((a: any) => 
          watchlistProductIds.has(String(a.productId)) && a.startTime
        );

        const now = Date.now();
        const FIFTEEN_MINS = 15 * 60 * 1000;

        for (const auction of myUpcoming) {
          const startTime = new Date(auction.startTime).getTime();
          const diff = startTime - now;

          // If starting in less than 15 mins but not started yet
          if (diff > 0 && diff <= FIFTEEN_MINS) {
            if (!notifiedAuctions.current.has(auction.id)) {
              setNotification(`Phiên đấu giá "${auction.productName}" sẽ bắt đầu trong ít phút nữa!`);
              notifiedAuctions.current.add(auction.id);
              
              // Auto hide after 10s
              setTimeout(() => setNotification(null), 10000);
              break; 
            }
          }
        }
      } catch (err) {
        console.error('Lỗi kiểm tra lịch đấu giá:', err);
      }
    };

    checkWatchlist();
    const interval = setInterval(checkWatchlist, 120000); // Check every 2 mins
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const dashboardPath = useMemo(() => {
    const role = String(user?.role || '').toUpperCase();
    if (role === 'ADMIN') return '/admin/dashboard';
    if (role === 'SELLER') return '/seller/dashboard';
    return '/user/dashboard';
  }, [user?.role]);

  const profilePath = useMemo(() => {
    const role = String(user?.role || '').toUpperCase();
    if (role === 'ADMIN') return '/admin/users';
    if (role === 'SELLER') return '/seller/dashboard';
    return '/user/profile';
  }, [user?.role]);

  const historyPath = useMemo(() => {
    const role = String(user?.role || '').toUpperCase();
    if (role === 'SELLER') return '/seller/products';
    if (role === 'ADMIN') return '/admin/auctions';
    return '/user/orders';
  }, [user?.role]);

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch {
      // backend logout is stateless; always clear client session
    } finally {
      dispatch(logout());
      navigate('/');
    }
  };

  const initials = `${user?.firstName?.charAt(0) || 'U'}${user?.lastName?.charAt(0) || ''}`.toUpperCase();

  const headerClassName = "w-full border-b flex items-center justify-center font-['Lato'] sticky top-0 left-0 z-50 transition-all duration-300";
  const headerStyle = {
    height: 'var(--layout-header-height)',
    backgroundColor: isScrolled ? 'rgba(255, 255, 255, 0.95)' : '#ffffff',
    backdropFilter: isScrolled ? 'blur(10px)' : 'none',
    borderColor: isScrolled ? 'transparent' : '#f1f5f9',
    boxShadow: isScrolled ? '0 4px 20px -2px rgba(0, 0, 0, 0.05)' : 'none',
  };

  return (
    <>
      {notification && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[60] animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="bg-[#2e3d83] text-white px-6 py-3 rounded-2xl shadow-2xl border border-white/20 flex items-center gap-3 backdrop-blur-md">
            <div className="w-8 h-8 rounded-full bg-[#f4c23d] flex items-center justify-center text-slate-900 shrink-0">
               <AlertCircle size={18} />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-blue-200 uppercase tracking-wider">Thông báo quan tâm</span>
              <span className="text-sm font-semibold">{notification}</span>
            </div>
            <button onClick={() => setNotification(null)} className="ml-4 p-1 hover:bg-white/10 rounded-full transition-colors">
              <X size={16} />
            </button>
          </div>
        </div>
      )}
      <div className={headerClassName} style={headerStyle}>
      <div className="w-full max-w-[1202px] flex items-center justify-between px-4 xl:px-0">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
          <div className="flex items-center justify-center w-10 h-10 bg-[#f8fafc] rounded-xl border border-slate-100 group-hover:bg-[#ffcb23] group-hover:border-[#ffcb23] transition-colors shadow-sm">
            <Gavel className="text-[#2e3d83] transition-colors" size={22} strokeWidth={2.5} />
          </div>
          <span className="text-[#1e293b] font-extrabold text-xl tracking-wide hidden sm:block">Vehicle Auction</span>
        </Link>

        {/* Navigation Menu */}
        <nav className="flex items-center gap-[30px] lg:gap-[40px] ml-[auto] mr-[auto]">
          {MENU_ITEMS.map((item) => (
            <NavLink key={item.id} item={item} />
          ))}
        </nav>

        {/* Auth / User menu */}
        {!isAuthenticated ? (
          <div className="flex items-center gap-3">
            <Link 
              to="/login"
              className="flex items-center justify-center px-4 h-[38px] text-[#1e293b] text-sm font-bold rounded-full hover:bg-slate-100 transition-colors"
            >
              Đăng nhập
            </Link>
            <Link
              to="/register"
              className="flex items-center justify-center px-6 h-[38px] bg-gradient-to-r from-[#2e3d83] to-[#1e293b] rounded-full hover:shadow-lg hover:shadow-[#2e3d83]/30 hover:-translate-y-0.5 transition-all"
            >
              <span className="text-white font-semibold text-sm tracking-wide">Đăng ký</span>
            </Link>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            <NotificationBell liveNotification={wsNotification} />

            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsOpen(prev => !prev)}
                className="flex items-center gap-2 rounded-full border border-slate-200 bg-white hover:bg-slate-50 transition-colors px-2 py-1 pr-3 text-[#1f2f6d] font-semibold shadow-sm"
              >
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#2e3d83] text-white text-sm font-bold shadow-inner">
                {initials}
              </span>
              <span className="text-sm">{user?.firstName || 'User'}</span>
            </button>

            {isOpen && (
              <div className="absolute right-0 mt-3 w-56 overflow-hidden rounded-2xl border border-slate-100 bg-white/95 backdrop-blur-xl shadow-2xl shadow-blue-900/10 py-1 z-50">
                <Link to={dashboardPath} className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-[#2e3d83] transition-colors" onClick={() => setIsOpen(false)}>
                  <LayoutDashboard size={16} /> Bảng điều khiển
                </Link>
                <Link to={profilePath} className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-[#2e3d83] transition-colors" onClick={() => setIsOpen(false)}>
                  <UserIcon size={16} /> Hồ sơ cá nhân
                </Link>
                <Link to={historyPath} className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-[#2e3d83] transition-colors" onClick={() => setIsOpen(false)}>
                  <History size={16} /> Lịch sử hoạt động
                </Link>
                <div className="h-[1px] bg-slate-100 my-1"></div>
                <button
                  type="button"
                  className="flex items-center gap-3 w-full px-4 py-3 text-left text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                  onClick={handleLogout}
                >
                  <LogOut size={16} /> Đăng xuất
                </button>
              </div>
            )}
          </div>
          </div>
        )}
      </div>
    </div>
    </>
  );
};
