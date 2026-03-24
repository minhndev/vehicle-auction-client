import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Button } from '../../../components/ui/Button/Button';
import { adminApi, type UserResponse } from '../../../api/adminApi';
import { usePageI18n } from '../../../i18n/usePageI18n';
import { getErrorMessage } from '../../../utils/errorHelpers';
import type { RootState } from '../../../store';
import styles from './AdminUsers.module.css';

export const AdminUsers: React.FC = () => {
  const { tp, getUserStatusLabel } = usePageI18n();
  const authUser = useSelector((state: RootState) => state.auth.user);
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterRole, setFilterRole] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [grantingUserId, setGrantingUserId] = useState<string | null>(null);
  const defaultUserQuery = {
    page: 0,
    size: 50,
    active: true,
    deleted: false,
    sort: 'createdAt,desc',
  } as const;

  const decodeRoleFromToken = (): string | null => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return null;

      const payload = JSON.parse(atob(token.split('.')[1])) as Record<string, unknown>;
      const role = payload.role;
      if (typeof role === 'string' && role.trim().length > 0) {
        return role.replace('ROLE_', '').toUpperCase();
      }

      const authorities = payload.authorities || payload.roles;
      if (Array.isArray(authorities) && authorities.length > 0) {
        const first = authorities[0];
        if (typeof first === 'string') {
          return first.replace('ROLE_', '').toUpperCase();
        }
        if (first && typeof first === 'object') {
          const authorityValue = (first as Record<string, unknown>).authority;
          if (typeof authorityValue === 'string') {
            return authorityValue.replace('ROLE_', '').toUpperCase();
          }
        }
      }
    } catch {
      return null;
    }

    return null;
  };

  const currentRole = (authUser?.role || decodeRoleFromToken() || 'UNKNOWN').toUpperCase();
  const currentUserId = String(authUser?.id || '').trim().toLowerCase();
  const currentUserEmail = String(authUser?.email || '').trim().toLowerCase();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminApi.getUsers(defaultUserQuery);
      // Handle pageable data if returned
      const list = Array.isArray(data) ? data : (data as any)?.content || [];
      setUsers(list);
    } catch (err) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 403) {
        setError(tp('adminUsers.permissionError'));
      } else {
        setError(getErrorMessage(err, tp('adminUsers.loadError')));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (user: UserResponse) => {
    const roles = ['USER', 'MEMBER', 'BUYER', 'SELLER', 'ADMIN'];
    const currentRole = user.role || 'USER';
    const targetRole = window.prompt(tp('adminUsers.rolePrompt', { currentRole, roles: roles.join(', ') }), currentRole);
    if (!targetRole || targetRole === currentRole || !roles.includes(targetRole.toUpperCase())) return;

    try {
      // Lấy đầy đủ bản ghi user để tránh ghi đè làm mất thông tin (ví dụ phoneNumber, address)
      const fullUser = await adminApi.getUserById(user.id);
      
      const payload = {
        firstName: fullUser.firstName || '',
        lastName: fullUser.lastName || '',
        phoneNumber: (fullUser as any).phoneNumber || (fullUser as any).phone || '',
        address: (fullUser as any).address || '',
        roleNames: [targetRole.toUpperCase()]
      };

      await adminApi.updateUserRole(user.id, payload);
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, role: targetRole.toUpperCase() } : u));
      alert(tp('adminUsers.roleChangeSuccess'));
    } catch (err) {
      alert(`${tp('adminUsers.roleChangeFailed')}: ${getErrorMessage(err, tp('adminUsers.unknownError'))}`);
    }
  };

  const handleStatusToggle = async (user: UserResponse) => {
    const isActive = typeof user.active === 'boolean' ? user.active : user.status !== 'BANNED';
    const nextActive = !isActive;
    const nextLabel = nextActive ? 'ACTIVE' : 'BANNED';
    if (!window.confirm(tp('adminUsers.toggleStatusConfirm', { email: user.email, status: getUserStatusLabel(nextLabel) }))) return;

    try {
      await adminApi.updateUserStatus(user.id, nextActive);
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, active: nextActive, status: nextLabel } : u));
    } catch (err) {
      alert(`${tp('adminUsers.toggleStatusFailed')}: ${getErrorMessage(err, tp('adminUsers.unknownError'))}`);
    }
  };

  const handleGrantSeller = async (user: UserResponse) => {
    if (grantingUserId === user.id) {
      return;
    }

    const existingRoles = Array.isArray(user.roles) ? user.roles.map(r => String(r).toUpperCase()) : [];
    const effectiveRole = String(user.role || '').toUpperCase();
    if (effectiveRole === 'SELLER' || existingRoles.includes('SELLER')) {
      alert(tp('adminUsers.alreadySeller'));
      return;
    }

    if (!window.confirm(tp('adminUsers.grantSellerConfirm', { email: user.email }))) return;

    try {
      setGrantingUserId(user.id);
      const updated = await adminApi.grantSellerRole(user.id);
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, ...updated, role: 'SELLER', roles: Array.from(new Set([...(updated.roles || []), 'SELLER'])) } : u));
      alert(tp('adminUsers.grantSellerSuccess'));
    } catch (err: any) {
      // Verify exact user state by id. If role already became SELLER, treat as success.
      try {
        const verifiedUser = await adminApi.getUserById(user.id);
        const verifiedRoles = Array.isArray(verifiedUser.roles)
          ? verifiedUser.roles.map((r) => String(r).toUpperCase())
          : [];
        const verifiedRole = String(verifiedUser.role || '').toUpperCase();

        if (verifiedRole === 'SELLER' || verifiedRoles.includes('SELLER')) {
          setUsers(prev => prev.map(u => u.id === user.id ? { ...u, ...verifiedUser, role: 'SELLER', roles: Array.from(new Set([...(verifiedUser.roles || []), 'SELLER'])) } : u));
          alert(tp('adminUsers.grantSellerSuccess'));
          return;
        }
      } catch {
        // fall through to default error message
      }

      alert(`${tp('adminUsers.grantSellerFailed')}: ${getErrorMessage(err, tp('adminUsers.unknownError'))}`);
    } finally {
      setGrantingUserId(null);
    }
  };

  const filteredUsers = users.filter(u => {
    const userId = String(u.id || '').trim().toLowerCase();
    const role = String(u.role || 'USER').toUpperCase();
    const email = String(u.email || '').toLowerCase();
    const fullName = `${String(u.firstName || '')} ${String(u.lastName || '')}`.trim().toLowerCase();
    const query = searchQuery.trim().toLowerCase();

    // Do not allow account-management actions on the currently logged-in account.
    if ((currentUserId && userId === currentUserId) || (currentUserEmail && email === currentUserEmail)) return false;

    if (filterRole !== 'all' && role !== filterRole.toUpperCase()) return false;
    if (query && !email.includes(query) && !fullName.includes(query)) return false;
    return true;
  });

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{tp('adminUsers.title')}</h1>
      <p className={styles.subtitle}>{tp('adminUsers.subtitle')}</p>
      <div style={{ marginBottom: '1rem', fontWeight: 600 }}>
        {tp('adminUsers.currentRole')}: <span className={styles.roleBadge}>{currentRole}</span>
      </div>

      {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}

      <div className={styles.filters}>
        <input 
          type="text" 
          placeholder={tp('adminUsers.searchPlaceholder')} 
          className={styles.searchInput}
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
        <select className={styles.filterSelect} value={filterRole} onChange={e => setFilterRole(e.target.value)}>
          <option value="all">{tp('adminUsers.allRoles')}</option>
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
            <th>{tp('adminUsers.fullName')}</th>
            <th>Email</th>
            <th>{tp('adminUsers.role')}</th>
            <th>{tp('adminUsers.status')}</th>
            <th>{tp('adminUsers.action')}</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>{tp('adminUsers.loading')}</td></tr>
          ) : filteredUsers.length === 0 ? (
            <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>{tp('adminUsers.empty')}</td></tr>
          ) : (
            filteredUsers.map(user => (
              <tr key={user.id}>
                <td><span className={styles.mono}>#{String(user.id).slice(0, 8)}</span></td>
                <td>{String(user.firstName || '')} {String(user.lastName || '')}</td>
                <td>{String(user.email || '')}</td>
                <td><span className={styles.roleBadge}>{user.role || 'USER'}</span></td>
                <td>
                  <span className={(typeof user.active === 'boolean' ? !user.active : user.status === 'BANNED') ? styles.statusBanned : styles.statusActive}>
                    {getUserStatusLabel(typeof user.active === 'boolean' ? (user.active ? 'ACTIVE' : 'BANNED') : (user.status || 'ACTIVE'))}
                  </span>
                </td>
                <td style={{ display: 'flex', gap: '8px' }}>
                  <Button
                    variant="outline"
                    size="small"
                    onClick={() => handleGrantSeller(user)}
                    disabled={
                      grantingUserId === user.id ||
                      String(user.role || '').toUpperCase() === 'SELLER' ||
                      (Array.isArray(user.roles) && user.roles.some(r => String(r).toUpperCase() === 'SELLER'))
                    }
                    style={{ borderColor: '#2563eb', color: '#2563eb' }}
                  >
                    {grantingUserId === user.id ? tp('adminUsers.granting') : tp('adminUsers.grantSeller')}
                  </Button>
                  <Button variant="outline" size="small" onClick={() => handleRoleChange(user)}>
                    {tp('adminUsers.changeRole')}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="small" 
                    style={{ borderColor: ((typeof user.active === 'boolean' ? !user.active : user.status === 'BANNED') ? '#10b981' : '#ef4444'), color: ((typeof user.active === 'boolean' ? !user.active : user.status === 'BANNED') ? '#10b981' : '#ef4444') }}
                    onClick={() => handleStatusToggle(user)}
                  >
                    {(typeof user.active === 'boolean' ? !user.active : user.status === 'BANNED') ? tp('adminUsers.unban') : tp('adminUsers.ban')}
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
