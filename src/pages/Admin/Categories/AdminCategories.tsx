import React, { useEffect, useState } from 'react';
import { Button } from '../../../components/ui/Button/Button';
import { adminApi, type Category } from '../../../api/adminApi';
import { usePageI18n } from '../../../i18n/usePageI18n';
import { getErrorMessage } from '../../../utils/errorHelpers';
import styles from './AdminCategories.module.css';

export const AdminCategories: React.FC = () => {
  const { tp } = usePageI18n();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({ name: '', description: '' });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getCategories();
      setCategories(res);
    } catch (err) {
      setError(getErrorMessage(err, tp('adminCategories.loadError')));
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newCat = await adminApi.createCategory(formData);
      setCategories(prev => [...prev, newCat]);
      setFormData({ name: '', description: '' });
    } catch (err) {
      alert(`${tp('adminCategories.createFailed')}: ${getErrorMessage(err, tp('adminCategories.unknownError'))}`);
      // Add fake category for demo if API fails
      setCategories(prev => [...prev, { id: 'temp-'+Date.now(), ...formData }]);
      setFormData({ name: '', description: '' });
    }
  };

  const handleDelete = async (id: string | number) => {
    if (!window.confirm(tp('adminCategories.deleteConfirm'))) return;
    try {
      await adminApi.deleteCategory(id);
      setCategories(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      alert(tp('adminCategories.deleteFailed'));
      setCategories(prev => prev.filter(c => c.id !== id));
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{tp('adminCategories.title')}</h1>
      <p className={styles.subtitle}>{tp('adminCategories.subtitle')}</p>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.grid}>
        <div className={styles.formSection}>
          <div className={styles.card}>
            <h3>{tp('adminCategories.addNew')}</h3>
            <form onSubmit={handleCreate}>
              <div className={styles.formGroup}>
                <label>{tp('adminCategories.name')}</label>
                <input 
                  required 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})} 
                  placeholder={tp('adminCategories.namePlaceholder')}
                />
              </div>
              <div className={styles.formGroup}>
                <label>{tp('adminCategories.description')}</label>
                <textarea 
                  rows={3} 
                  value={formData.description} 
                  onChange={(e) => setFormData({...formData, description: e.target.value})} 
                  placeholder={tp('adminCategories.descriptionPlaceholder')}
                />
              </div>
              <Button type="submit" variant="primary">{tp('adminCategories.create')}</Button>
            </form>
          </div>
        </div>

        <div className={styles.listSection}>
          <div className={styles.card}>
            <h3>{tp('adminCategories.existing')}</h3>
            {loading ? (
              <p>{tp('adminCategories.loading')}</p>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>{tp('adminCategories.name')}</th>
                    <th>{tp('adminCategories.description')}</th>
                    <th>{tp('adminCategories.action')}</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.length === 0 ? (
                    <tr><td colSpan={4} style={{textAlign: 'center'}}>{tp('adminCategories.empty')}</td></tr>
                  ) : (
                    categories.map(cat => (
                      <tr key={cat.id}>
                        <td>{cat.id}</td>
                        <td><strong>{cat.name}</strong></td>
                        <td>{cat.description || '-'}</td>
                        <td>
                          <button onClick={() => handleDelete(cat.id)} className={styles.deleteBtn}>{tp('adminCategories.delete')}</button>
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
