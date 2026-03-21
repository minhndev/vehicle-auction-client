import React, { useEffect, useState } from 'react';
import { Button } from '../../../components/ui/Button/Button';
import { adminApi, type UserResponse } from '../../../api/adminApi';
import { getErrorMessage } from '../../../utils/errorHelpers';
import styles from './AdminUsers.module.css';

export const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterRole, setFilterRole] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminApi.getUsers();
      // Handle pageable data if returned
      const list = Array.isArray(data) ? data : (data as any)?.content || [];
      setUsers(list);
    } catch (err) {
      setError(getErrorMessage(err, 'Lỗi tải danh sách người dùng. Nếu API /users chưa hỗ trợ, danh sách sẽ trống.'));
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, currentRole: string) => {
    const roles = ['USER', 'MEMBER', 'BUYER', 'SELLER', 'ADMIN'];
    const targetRole = window.prompt(`Nhập Role mới (hiện tại: ${currentRole}).\nChọn: ${roles.join(', ')}`, currentRole);
    if (!targetRole || targetRole === currentRole || !roles.includes(targetRole.toUpperCase())) return;

    try {
      await adminApi.updateUserRole(userId, targetRole.toUpperCase());
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: targetRole.toUpperCase() } : u));
      alert('Đổi quyền thành công!');
    } catch (err) {
      alert('Đổi quyền thất bại: ' + getErrorMessage(err, 'Lỗi không xác định'));
    }
  };

  const handleStatusToggle = async (user: UserResponse) => {
    const newStatus = user.status === 'ACTIVE' ? 'BANNED' : 'ACTIVE';
    if (!window.confirm(`Bạn có chắc muốn chuyển trạng thái tài khoản ${user.email} thành ${newStatus}?`)) return;

    try {
      await adminApi.updateUserStatus(user.id, newStatus);
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: newStatus } : u));
    } catch (err) {
      alert('Đổi trạng thái thất bại: ' + getErrorMessage(err, 'Lỗi không xác định'));
    }
  };

  const filteredUsers = users.filter(u => {
    if (filterRole !== 'all' && u.role !== filterRole.toUpperCase()) return false;
    if (searchQuery && !u.email.toLowerCase().includes(searchQuery.toLowerCase()) && !(u.firstName + ' ' + u.lastName).toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Quản Lý Người Dùng</h1>
      <p className={styles.subtitle}>Xem, quản lý và phân quyền tài khoản người dùng trong hệ thống.</p>

      {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}

      <div className={styles.filters}>
        <input 
          type="text" 
          placeholder="Tìm theo tên hoặc email..." 
          className={styles.searchInput}
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
        <select className={styles.filterSelect} value={filterRole} onChange={e => setFilterRole(e.target.value)}>
          <option value="all">Tất Cả Quyền</option>
          <option value="user">USER</option>
          <option value="member">MEMBER</option>
          <option value="buyer">BUYER</option>
          <option value="seller">SELLER</option>
          <option value="admin">ADMIN</option>
        </select>
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Họ Tên</th>
            <th>Email</th>
            <th>Quyền</th>
            <th>Trạng Thái</th>
            <th>Hành Động</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>Đang tải dữ liệu...</td></tr>
          ) : filteredUsers.length === 0 ? (
            <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>Không tìm thấy người dùng nào.</td></tr>
          ) : (
            filteredUsers.map(user => (
              <tr key={user.id}>
                <td><span className={styles.mono}>#{user.id.substring(0, 8)}</span></td>
                <td>{user.firstName} {user.lastName}</td>
                <td>{user.email}</td>
                <td><span className={styles.roleBadge}>{user.role || 'USER'}</span></td>
                <td>
                  <span className={user.status === 'BANNED' ? styles.statusBanned : styles.statusActive}>
                    {user.status || 'ACTIVE'}
                  </span>
                </td>
                <td style={{ display: 'flex', gap: '8px' }}>
                  <Button variant="outline" size="small" onClick={() => handleRoleChange(user.id, user.role)}>
                    Đổi Quyền
                  </Button>
                  <Button 
                    variant="outline" 
                    size="small" 
                    style={{ borderColor: user.status === 'BANNED' ? '#10b981' : '#ef4444', color: user.status === 'BANNED' ? '#10b981' : '#ef4444' }}
                    onClick={() => handleStatusToggle(user)}
                  >
                    {user.status === 'BANNED' ? 'Mở Khóa' : 'Khóa'}
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
