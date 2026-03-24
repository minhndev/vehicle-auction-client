import React, { useEffect, useState } from 'react';
import { miscApi } from '../../../api/miscApi';
import { usePageI18n } from '../../../i18n/usePageI18n';
import { getErrorMessage } from '../../../utils/errorHelpers';
import { ShieldCheck, Shield, Plus, Trash2, RefreshCw, Loader2, AlertCircle, ShieldAlert } from 'lucide-react';

interface Role {
  id: string | number;
  name: string;
  description: string;
  isDeleted?: boolean;
}

export const AdminRoles: React.FC = () => {
  const { tp } = usePageI18n();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({ name: '', description: '' });
  const [actionLoading, setActionLoading] = useState<string | number | null>(null);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const res = await miscApi.getRoles();
      if (Array.isArray(res)) setRoles(res);
      else if (res?.content) setRoles(res.content);
    } catch (err) {
      setError(getErrorMessage(err, tp('adminRoles.loadError')));
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setActionLoading('create');
      const newRole = await miscApi.createRole({ ...formData, name: formData.name.toUpperCase() });
      setRoles(prev => [...prev, newRole]);
      setFormData({ name: '', description: '' });
    } catch (err) {
      alert(`${tp('adminRoles.createFailed')}: ${getErrorMessage(err, tp('adminRoles.unknownError'))}`);
      setRoles(prev => [...prev, { id: 'r-'+Date.now(), name: formData.name.toUpperCase(), description: formData.description }]);
      setFormData({ name: '', description: '' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string | number) => {
    if (!window.confirm(tp('adminRoles.deleteConfirm', 'Xác nhận thu hồi Role này?'))) return;
    try {
      setActionLoading(id);
      await miscApi.deleteRole(id);
      setRoles(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      alert(tp('adminRoles.deleteFailed'));
    } finally {
      setActionLoading(null);
    }
  };

  const handleRestore = async (id: string | number) => {
    try {
      setActionLoading(id);
      await miscApi.restoreRole(id);
      setRoles(prev => prev.map(r => r.id === id ? { ...r, isDeleted: false } : r));
    } catch (err) {
      alert(`${tp('adminRoles.restoreFailed')}: ${getErrorMessage(err)}`);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-2">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 mb-2">Hệ Thống Phân Quyền</h1>
          <p className="text-slate-500 max-w-xl">Quản lý và thiết lập các vai trò (Roles) sử dụng cho Security Scope trên toàn bộ nền tảng V-Auction.</p>
        </div>
        <div className="bg-blue-50 text-blue-600 font-bold px-4 py-2 rounded-xl flex items-center gap-2 border border-blue-100 shadow-sm">
          <ShieldAlert size={18} /> Role Controller Active
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 flex items-center gap-2 font-medium">
          <AlertCircle size={18} /> {error}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Form Section */}
        <div className="w-full lg:w-96 flex flex-col gap-6">
          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl shadow-slate-200/40 sticky top-8">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-blue-100">
              <ShieldCheck size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-6">Định nghĩa Role mới</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-600 mb-2 uppercase tracking-wide">Mã Role (Tên)</label>
                <input 
                  required 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value.toUpperCase()})} 
                  placeholder="Vd: SUPER_ADMIN"
                  className="w-full px-5 py-3 rounded-xl bg-slate-50 hover:bg-slate-100 focus:bg-white focus:ring-2 ring-blue-500/20 outline-none transition-colors border border-slate-200 uppercase font-black tracking-wider text-slate-700"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-600 mb-2 uppercase tracking-wide">Quyền hạn / Mô tả</label>
                <textarea 
                  rows={3} 
                  value={formData.description} 
                  onChange={(e) => setFormData({...formData, description: e.target.value})} 
                  placeholder="Mô tả quyền truy cập của Role này..."
                  className="w-full px-5 py-3 rounded-xl bg-slate-50 hover:bg-slate-100 focus:bg-white focus:ring-2 ring-blue-500/20 outline-none transition-colors border border-slate-200 resize-none text-slate-600"
                />
              </div>
              <button 
                type="submit" 
                disabled={actionLoading === 'create' || !formData.name}
                className="w-full py-4 mt-4 rounded-xl font-bold bg-[#2e3d83] text-white hover:bg-blue-800 shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading === 'create' ? <Loader2 size={18} className="animate-spin" /> : <><Plus size={18} /> Khởi tạo Role</>}
              </button>
            </form>
          </div>
        </div>

        {/* Table Section */}
        <div className="flex-1">
          <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800">Cấu hình Scope hiện tại</h2>
              <span className="text-sm font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-lg">{roles.length} ROLES</span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest w-1/3">Key (Mã Role)</th>
                    <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Mô Tả & Trạng Thái</th>
                    <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Tác Vụ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/60">
                  {loading ? (
                    <tr><td colSpan={3} className="py-20 text-center text-slate-400"><Loader2 className="animate-spin text-blue-500 mx-auto mb-3" size={32}/>Đang tải Roles...</td></tr>
                  ) : roles.length === 0 ? (
                    <tr><td colSpan={3} className="py-20 text-center text-slate-400 font-medium">Chưa có Root Roles nào được thiết lập.</td></tr>
                  ) : (
                    roles.map((role) => (
                      <tr key={role.id} className="hover:bg-blue-50/30 transition-colors group">
                        <td className="px-8 py-5">
                          <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-black tracking-widest font-mono ${
                            role.name === 'ADMIN' ? 'bg-[#2e3d83] text-white shadow-md' : 
                            role.name === 'SELLER' ? 'bg-amber-100 text-amber-700' :
                            'bg-slate-100 text-slate-600'
                          }`}>
                            {role.name === 'ADMIN' && <Shield size={14}/>}
                            {role.name}
                          </span>
                        </td>
                        <td className="px-8 py-5">
                          <p className={`font-medium mb-1 ${role.isDeleted ? 'text-slate-300' : 'text-slate-600'}`}>
                            {role.description || <span className="text-slate-300 italic">Không có mô tả</span>}
                          </p>
                          {role.isDeleted ? (
                            <span className="inline-flex text-[10px] font-black uppercase tracking-wider text-red-500 bg-red-50 px-2.5 py-0.5 rounded-sm">DELETED_SCOPE</span>
                          ) : (
                            <span className="inline-flex text-[10px] font-black uppercase tracking-wider text-emerald-500 bg-emerald-50 px-2.5 py-0.5 rounded-sm">ACTIVE_SCOPE</span>
                          )}
                        </td>
                        <td className="px-8 py-5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {role.name !== 'ADMIN' && role.name !== 'USER' && (
                              role.isDeleted ? (
                                <button 
                                  onClick={() => handleRestore(role.id)}
                                  disabled={actionLoading === role.id}
                                  className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white font-bold transition-all disabled:opacity-50 text-xs flex items-center gap-1.5"
                                >
                                  {actionLoading === role.id ? <Loader2 size={14} className="animate-spin" /> : <><RefreshCw size={14}/> Khôi phục</>}
                                </button>
                              ) : (
                                <button 
                                  onClick={() => handleDelete(role.id)}
                                  disabled={actionLoading === role.id}
                                  className="w-8 h-8 rounded-lg bg-white text-slate-400 border border-slate-200 hover:text-red-500 hover:border-red-500 flex items-center justify-center transition-all disabled:opacity-50"
                                  title="Gỡ Role này"
                                >
                                  {actionLoading === role.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14}/>}
                                </button>
                              )
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
        </div>

      </div>
    </div>
  );
};
