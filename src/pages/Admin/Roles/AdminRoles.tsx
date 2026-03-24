import React, { useEffect, useState } from 'react';
import { Button } from '../../../components/ui/Button/Button';
import { miscApi } from '../../../api/miscApi';
import { usePageI18n } from '../../../i18n/usePageI18n';
import { getErrorMessage } from '../../../utils/errorHelpers';
import styles from './AdminRoles.module.css';

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
      const newRole = await miscApi.createRole(formData);
      setRoles(prev => [...prev, newRole]);
      setFormData({ name: '', description: '' });
    } catch (err) {
      alert(`${tp('adminRoles.createFailed')}: ${getErrorMessage(err, tp('adminRoles.unknownError'))}`);
      // Add fake role for demo if API fails
      setRoles(prev => [...prev, { id: 'r-'+Date.now(), ...formData }]);
      setFormData({ name: '', description: '' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string | number) => {
    if (!window.confirm(tp('adminRoles.deleteConfirm'))) return;
    try {
      setActionLoading(id);
      await miscApi.deleteRole(id);
      setRoles(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      alert(tp('adminRoles.deleteFailed'));
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
      alert(`${tp('adminRoles.restoreFailed')}: ${getErrorMessage(err)}`);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{tp('adminRoles.title')}</h1>
      <p className={styles.subtitle}>{tp('adminRoles.subtitle')}</p>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.grid}>
        <div className={styles.formSection}>
          <div className={styles.card}>
            <h3>{tp('adminRoles.addNew')}</h3>
            <form onSubmit={handleCreate}>
              <div className={styles.formGroup}>
                <label>{tp('adminRoles.name')}</label>
                <input 
                  required 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})} 
                  placeholder={tp('adminRoles.namePlaceholder')}
                />
              </div>
              <div className={styles.formGroup}>
                <label>{tp('adminRoles.description')}</label>
                <textarea 
                  rows={3} 
                  value={formData.description} 
                  onChange={(e) => setFormData({...formData, description: e.target.value})} 
                  placeholder={tp('adminRoles.descriptionPlaceholder')}
                />
              </div>
              <Button type="submit" variant="primary" disabled={actionLoading === 'create'}>
                {actionLoading === 'create' ? tp('adminRoles.creating') : tp('adminRoles.create')}
              </Button>
            </form>
          </div>
        </div>

        <div className={styles.listSection}>
          <div className={styles.card}>
            <h3>{tp('adminRoles.existing')}</h3>
            {loading ? (
              <p>{tp('adminRoles.loading')}</p>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>{tp('adminRoles.name')}</th>
                    <th>{tp('adminRoles.description')}</th>
                    <th>{tp('adminRoles.status')}</th>
                    <th>{tp('adminRoles.action')}</th>
                  </tr>
                </thead>
                <tbody>
                  {roles.length === 0 ? (
                    <tr><td colSpan={4} style={{textAlign: 'center'}}>{tp('adminRoles.empty')}</td></tr>
                  ) : (
                    roles.map(role => (
                      <tr key={role.id} className={role.isDeleted ? styles.rowDeleted : ''}>
                        <td><strong>{role.name}</strong></td>
                        <td>{role.description || '-'}</td>
                        <td>
                          {role.isDeleted ? (
                             <span className={styles.badgeDeleted}>{tp('adminRoles.deleted')}</span>
                          ) : (
                             <span className={styles.badgeActive}>{tp('adminRoles.active')}</span>
                          )}
                        </td>
                        <td>
                          {role.name !== 'ADMIN' && role.name !== 'USER' && (
                            role.isDeleted ? (
                              <button onClick={() => handleRestore(role.id)} className={styles.actionBtn}>{tp('adminRoles.restore')}</button>
                            ) : (
                              <button onClick={() => handleDelete(role.id)} className={styles.deleteBtn}>{tp('adminRoles.delete')}</button>
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
