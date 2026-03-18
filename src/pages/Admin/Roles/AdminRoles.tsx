import React, { useEffect, useState } from 'react';
import { Button } from '../../../components/ui/Button/Button';
import { miscApi } from '../../../api/miscApi';
import { getErrorMessage } from '../../../utils/errorHelpers';
import styles from './AdminRoles.module.css';

interface Role {
  id: string | number;
  name: string;
  description: string;
  isDeleted?: boolean;
}

export const AdminRoles: React.FC = () => {
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
      setError(getErrorMessage(err, 'Failed to fetch roles.'));
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setActionLoading('create');
      const newRole = await miscApi.createRole(formData);
      setRoles(prev => [...prev, newRole]);
      setFormData({ name: '', description: '' });
    } catch (err) {
      alert('Failed to create role: ' + getErrorMessage(err, 'Unknown error'));
      // Add fake role for demo if API fails
      setRoles(prev => [...prev, { id: 'r-'+Date.now(), ...formData }]);
      setFormData({ name: '', description: '' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string | number) => {
    if (!window.confirm('Are you sure you want to delete this role?')) return;
    try {
      setActionLoading(id);
      await miscApi.deleteRole(id);
      setRoles(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      alert('Delete failed (mock removal proceeds).');
      setRoles(prev => prev.filter(r => r.id !== id));
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
      alert('Restore failed: ' + getErrorMessage(err));
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Role Management</h1>
      <p className={styles.subtitle}>Manage system roles and permissions.</p>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.grid}>
        <div className={styles.formSection}>
          <div className={styles.card}>
            <h3>Add New Role</h3>
            <form onSubmit={handleCreate}>
              <div className={styles.formGroup}>
                <label>Role Name</label>
                <input 
                  required 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})} 
                  placeholder="e.g. MODERATOR, SUPPORT"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Description</label>
                <textarea 
                  rows={3} 
                  value={formData.description} 
                  onChange={(e) => setFormData({...formData, description: e.target.value})} 
                  placeholder="Role description..."
                />
              </div>
              <Button type="submit" variant="primary" disabled={actionLoading === 'create'}>
                {actionLoading === 'create' ? 'Creating...' : 'Create Role'}
              </Button>
            </form>
          </div>
        </div>

        <div className={styles.listSection}>
          <div className={styles.card}>
            <h3>Existing Roles</h3>
            {loading ? (
              <p>Loading...</p>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Role Name</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {roles.length === 0 ? (
                    <tr><td colSpan={4} style={{textAlign: 'center'}}>No roles found</td></tr>
                  ) : (
                    roles.map(role => (
                      <tr key={role.id} className={role.isDeleted ? styles.rowDeleted : ''}>
                        <td><strong>{role.name}</strong></td>
                        <td>{role.description || '-'}</td>
                        <td>
                          {role.isDeleted ? (
                             <span className={styles.badgeDeleted}>Deleted</span>
                          ) : (
                             <span className={styles.badgeActive}>Active</span>
                          )}
                        </td>
                        <td>
                          {role.name !== 'ADMIN' && role.name !== 'USER' && (
                            role.isDeleted ? (
                              <button onClick={() => handleRestore(role.id)} className={styles.actionBtn}>Restore</button>
                            ) : (
                              <button onClick={() => handleDelete(role.id)} className={styles.deleteBtn}>Delete</button>
                            )
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
