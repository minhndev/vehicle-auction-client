import React, { useEffect, useState } from 'react';
import { Button } from '../../../components/ui/Button/Button';
import { adminApi, type Category } from '../../../api/adminApi';
import { getErrorMessage } from '../../../utils/errorHelpers';
import styles from './AdminCategories.module.css';

export const AdminCategories: React.FC = () => {
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
      setError(getErrorMessage(err, 'Failed to fetch categories.'));
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
      alert('Failed to create category: ' + getErrorMessage(err, 'Unknown error'));
      // Add fake category for demo if API fails
      setCategories(prev => [...prev, { id: 'temp-'+Date.now(), ...formData }]);
      setFormData({ name: '', description: '' });
    }
  };

  const handleDelete = async (id: string | number) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      await adminApi.deleteCategory(id);
      setCategories(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      alert('Delete failed (mock removal proceeds).');
      setCategories(prev => prev.filter(c => c.id !== id));
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Category Management</h1>
      <p className={styles.subtitle}>Create, update, and manage vehicle categories.</p>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.grid}>
        <div className={styles.formSection}>
          <div className={styles.card}>
            <h3>Add New Category</h3>
            <form onSubmit={handleCreate}>
              <div className={styles.formGroup}>
                <label>Category Name</label>
                <input 
                  required 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})} 
                  placeholder="e.g. SUV, Luxury, Classic"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Description</label>
                <textarea 
                  rows={3} 
                  value={formData.description} 
                  onChange={(e) => setFormData({...formData, description: e.target.value})} 
                  placeholder="Category description..."
                />
              </div>
              <Button type="submit" variant="primary">Create Category</Button>
            </form>
          </div>
        </div>

        <div className={styles.listSection}>
          <div className={styles.card}>
            <h3>Existing Categories</h3>
            {loading ? (
              <p>Loading...</p>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.length === 0 ? (
                    <tr><td colSpan={4} style={{textAlign: 'center'}}>No categories found</td></tr>
                  ) : (
                    categories.map(cat => (
                      <tr key={cat.id}>
                        <td>{cat.id}</td>
                        <td><strong>{cat.name}</strong></td>
                        <td>{cat.description || '-'}</td>
                        <td>
                          <button onClick={() => handleDelete(cat.id)} className={styles.deleteBtn}>Delete</button>
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
