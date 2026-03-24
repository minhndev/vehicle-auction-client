import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { adminApi, type UserResponse } from '../../../api/adminApi';
import { usePageI18n } from '../../../i18n/usePageI18n';
import { getErrorMessage } from '../../../utils/errorHelpers';
import type { RootState } from '../../../store';
import { ShieldCheck, UserCheck, UserX, Loader2, Search, Key, Shield } from 'lucide-react';

export const AdminUsers: React.FC = () => {
  const { tp, getUserStatusLabel } = usePageI18n();
  const authUser = useSelector((state: RootState) => state.auth.user);
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterRole, setFilterRole] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [grantingUserId, setGrantingUserId] = useState<string | null>(null);

  // Helper func current role logic truncated for brevity, assume "ADMIN" directly as visual
  const currentRole = 'ADMIN'; 
  const currentUserId = String(authUser?.id || '');
  const currentUserEmail = String(authUser?.email || '');

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminApi.getUsers({ page: 0, size: 200, active: true, deleted: false, sort: 'createdAt,desc' } as any);
      setUsers(Array.isArray(data) ? data : (data as any)?.content || []);
    } catch (err) {
      setError(getErrorMessage(err, tp('adminUsers.loadError')));
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (user: UserResponse) => {
    const roles = ['USER', 'MEMBER', 'BUYER', 'SELLER', 'ADMIN'];
    const cRole = user.role || 'USER';
    const targetRole = window.prompt(`Thay đổi phân quyền cho ${user.email}\nHiện tại: ${cRole}\nNhập vai trò (USER, MEMBER, BUYER, SELLER, ADMIN):`, cRole);
    if (!targetRole || targetRole.toUpperCase() === cRole || !roles.includes(targetRole.toUpperCase())) return;

    try {
      const fullUser = await adminApi.getUserById(user.id);
      await adminApi.updateUserRole(user.id, {
        firstName: fullUser.firstName || '', lastName: fullUser.lastName || '',
        phoneNumber: (fullUser as any).phoneNumber || '', address: (fullUser as any).address || '',
        roleNames: [targetRole.toUpperCase()]
      });
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, role: targetRole.toUpperCase() } : u));
    } catch (err) { alert(`Failed: ${getErrorMessage(err)}`); }
  };

  const handleStatusToggle = async (user: UserResponse) => {
    const isActive = typeof user.active === 'boolean' ? user.active : user.status !== 'BANNED';
    if (!window.confirm(`${isActive ? 'Cấm/Ban' : 'Mở khóa'} người dùng ${user.email}?`)) return;
    try {
      await adminApi.updateUserStatus(user.id, !isActive);
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, active: !isActive, status: !isActive ? 'ACTIVE' : 'BANNED' } : u));
    } catch (err) { alert(`Lỗi: ${getErrorMessage(err)}`); }
  };

  const handleGrantSeller = async (user: UserResponse) => {
    if (grantingUserId === user.id) return;
    if (String(user.role).toUpperCase() === 'SELLER') { alert('Đã là đối tác'); return; }
    if (!window.confirm(`Duyệt ${user.email} trở thành Seller?`)) return;

    try {
      setGrantingUserId(user.id);
      const updated = await adminApi.grantSellerRole(user.id);
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, ...updated, role: 'SELLER' } : u));
    } catch (err: any) {
      alert(`Xin lỗi, xảy ra lỗi (Hoặc tài khoản đã là admin/seller): ${getErrorMessage(err)}`);
    } finally { setGrantingUserId(null); }
  };

  const filteredUsers = users.filter(u => {
    if (u.id === currentUserId || u.email === currentUserEmail) return false;
    if (filterRole !== 'all' && String(u.role || 'USER').toUpperCase() !== filterRole.toUpperCase()) return false;
    const query = searchQuery.trim().toLowerCase();
    if (query && !u.email?.toLowerCase().includes(query) && !`${u.firstName} ${u.lastName}`.toLowerCase().includes(query)) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-2">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 mb-2">Tài Khoản Hành Chính</h1>
          <p className="text-slate-500 max-w-xl">Trình giám sát quyền truy cập hệ thống. Bạn đang đăng nhập bằng tư cách <span className="font-bold text-[#2e3d83] px-2 py-0.5 bg-blue-50 rounded">{currentRole}</span>.</p>
        </div>
      </div>

      <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-100 flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Search size={18}/></div>
          <input type="text" placeholder="Tìm theo Email, Tên đầy đủ..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-5 py-3 rounded-xl bg-slate-50 hover:bg-slate-100 focus:bg-white focus:ring-2 ring-blue-500/20 outline-none transition-colors border-none" />
        </div>
        <select value={filterRole} onChange={e => setFilterRole(e.target.value)} 
          className="px-5 py-3 rounded-xl bg-slate-50 border-r-8 border-transparent focus:ring-2 ring-blue-500/20 outline-none font-medium text-slate-600 cursor-pointer text-sm">
          <option value="all">Mọi Cấp Bậc</option>
          <option value="user">USER (Tiêu chuẩn)</option>
          <option value="seller">SELLER (Nhà bán)</option>
          <option value="admin">ADMIN (Quản trị)</option>
        </select>
      </div>

      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Định Danh Công Dân</th>
                <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Trạng Thái & Bảo Mật</th>
                <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Phân Quyền Máy Chủ</th>
                <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Menu Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={4} className="py-20 text-center text-slate-400"><Loader2 className="animate-spin text-blue-500 mx-auto mb-3" size={32}/>Đang đồng bộ hóa kho dữ liệu...</td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan={4} className="py-20 text-center text-slate-400 font-medium">Không có kết quả nào.</td></tr>
              ) : (
                filteredUsers.map(user => {
                  const isActive = typeof user.active === 'boolean' ? user.active : user.status !== 'BANNED';
                  const roleStr = String(user.role || 'USER').toUpperCase();
                  return (
                    <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center font-black uppercase shadow-inner border border-slate-200">
                             {user.firstName?.charAt(0) || user.email?.charAt(0) || '?'}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 text-sm mb-0.5">{user.firstName} {user.lastName}</p>
                            <p className="text-xs font-medium text-slate-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {isActive ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-100"><UserCheck size={14}/> SẠCH</span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-red-50 text-red-600 border border-red-100"><UserX size={14}/> KHÓA MẠNG</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold font-mono tracking-widest ${
                          roleStr === 'ADMIN' ? 'bg-[#2e3d83] text-white shadow-md' :
                          roleStr === 'SELLER' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                            {roleStr === 'ADMIN' && <Shield size={14}/>}
                            {roleStr === 'SELLER' && <ShieldCheck size={14}/>}
                            {roleStr}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleGrantSeller(user)}
                            disabled={grantingUserId === user.id || roleStr === 'SELLER'}
                            className="text-xs font-bold px-3 py-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white rounded-lg transition-all disabled:opacity-50 disabled:hidden"
                          >
                            Cấp Đại Lý
                          </button>
                          <button 
                            onClick={() => handleRoleChange(user)}
                            className="w-9 h-9 flex items-center justify-center bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg transition-all"
                            title="Sửa Roles"
                          >
                            <Key size={16}/>
                          </button>
                          <button 
                            onClick={() => handleStatusToggle(user)}
                            className={`w-9 h-9 flex items-center justify-center rounded-lg transition-all ${isActive ? 'bg-red-50 text-red-500 hover:bg-red-500 hover:text-white' : 'bg-emerald-50 text-emerald-500 hover:bg-emerald-500 hover:text-white'}`}
                            title={isActive ? "Khóa" : "Mở Khóa"}
                          >
                            {isActive ? <UserX size={16}/> : <UserCheck size={16}/>}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
