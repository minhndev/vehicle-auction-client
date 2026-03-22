import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { logout } from '../../store/slices/authSlice';
import { authService } from '../../features/auth/api/authService';

export interface NavItem {
  id: string;
  label: string;
  url: string;
  isActive?: boolean;
}

const MENU_ITEMS: NavItem[] = [
  { id: '1', label: 'Home', url: '/', isActive: true },
  { id: '2', label: 'Car Auction', url: '/auctions' },
  { id: '3', label: 'Sell Your Car', url: '/sell' },
  { id: '4', label: 'About us', url: '/about' },
  { id: '5', label: 'Contect', url: '/contact' },
];

const NavLink = ({ item }: { item: NavItem }) => {
  return (
    <div className="relative flex flex-col items-center">
      <Link 
        to={item.url}
        className={`text-white text-[16px] leading-[19.2px] hover:opacity-80 transition-opacity ${item.isActive ? 'font-bold' : 'font-medium'}`}
      >
        {item.label}
      </Link>
      {/* Active Indicator Underline */}
      {item.isActive && (
        <div className="absolute -bottom-[6px] w-[16px] h-[3px] bg-[#ffcb23] rounded-[5px]" />
      )}
    </div>
  );
};

export const HeaderNav: React.FC = () => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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

  return (
    <div className="w-full h-[82px] bg-[#e8edfa] bg-opacity-20 flex items-center justify-center font-['Lato'] absolute top-0 left-0 z-50">
      <div className="w-full max-w-[1202px] flex items-center justify-between">
        
        {/* Logo */}
        <div className="w-[165px] h-[42px] bg-gray-300 rounded flex items-center justify-center overflow-hidden flex-shrink-0">
          <img src="/placeholder.png" alt="Logo" className="w-[120px] opacity-50" />
        </div>

        {/* Navigation Menu */}
        <nav className="flex items-center gap-[30px] lg:gap-[40px] ml-[auto] mr-[auto]">
          {MENU_ITEMS.map((item) => (
            <NavLink key={item.id} item={item} />
          ))}
        </nav>

        {/* Auth / User menu */}
        {!isAuthenticated ? (
          <div className="flex items-center gap-[10px]">
            <Link 
              to="/login"
              className="text-white text-[16px] font-bold leading-[19.2px] hover:underline"
            >
              Sign in
            </Link>
            <span className="text-[#898989] text-[16px] font-medium leading-[19.2px]">or</span>
            <Link
              to="/register"
              className="flex items-center justify-center w-[122px] h-[35px] bg-[#2e3d83] rounded-[5px] text-white text-[16px] font-medium leading-[19.2px] hover:bg-opacity-90 transition-colors"
            >
              Register now
            </Link>
          </div>
        ) : (
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsOpen(prev => !prev)}
              className="flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-[#1f2f6d] font-semibold"
            >
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#2e3d83] text-white text-sm">
                {initials}
              </span>
              <span>{user?.firstName || 'User'}</span>
            </button>

            {isOpen && (
              <div className="absolute right-0 mt-2 w-52 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
                <Link to={dashboardPath} className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50" onClick={() => setIsOpen(false)}>
                  Dashboard
                </Link>
                <Link to={profilePath} className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50" onClick={() => setIsOpen(false)}>
                  Hồ sơ
                </Link>
                <Link to={historyPath} className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50" onClick={() => setIsOpen(false)}>
                  Lịch sử
                </Link>
                <button
                  type="button"
                  className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                  onClick={handleLogout}
                >
                  Thoát
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
