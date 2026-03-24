import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { authService } from '../features/auth/api/authService';
import { LayoutDashboard, Users, Car, LayoutGrid, Gavel, ShieldCheck, LogOut, Vibrate } from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch {
      // ignore and clear local session anyway
    } finally {
      dispatch(logout());
      navigate('/');
    }
  };

  const navItems = [
    { name: 'Tổng Quan', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Quản Lý Người Dùng', path: '/admin/users', icon: Users },
    { name: 'Quản Lý Phân Khúc', path: '/admin/categories', icon: LayoutGrid },
    { name: 'Quản Lý Xe Đăng Ký', path: '/admin/products', icon: Car },
    { name: 'Phiên Đấu Giá', path: '/admin/auctions', icon: Gavel },
    { name: 'Phân Quyền', path: '/admin/roles', icon: ShieldCheck },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      
      {/* Sidebar */}
      <aside className="w-72 bg-[#1e293b] text-white flex flex-col shadow-2xl z-20 shrink-0">
        <div className="p-8 border-b border-white/10">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-[#f4c23d] to-yellow-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <Vibrate className="text-slate-900" size={20} />
            </div>
            <div>
              <h3 className="font-black text-xl tracking-wide uppercase text-white">V-Auction</h3>
              <p className="text-[10px] text-[#f4c23d] font-bold tracking-widest uppercase">Admin System</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2 custom-scrollbar">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            const Icon = item.icon;
            return (
              <Link 
                key={item.path} 
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold transition-all duration-300 ${
                  isActive 
                    ? 'bg-[#2e3d83] text-white shadow-lg shadow-[#2e3d83]/50' 
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon size={20} className={isActive ? 'text-[#f4c23d]' : ''} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-white/10">
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-xl font-bold transition-colors"
          >
            <LogOut size={20} />
            Đăng Xuất
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-8 z-10 shrink-0 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Hệ thống Đang hoạt động</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
              <p className="text-sm font-black text-[#2e3d83]">Quản Trị Viên</p>
              <p className="text-xs font-bold text-slate-400">admin@v-auction.com</p>
            </div>
            <div className="w-10 h-10 bg-[#f4c23d] rounded-full flex items-center justify-center text-slate-900 font-extrabold shadow-md border-2 border-white">
              AD
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-10 relative z-0">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
