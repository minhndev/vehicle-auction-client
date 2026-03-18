import React from 'react';
import { Button } from '../../../components/ui/Button/Button';
import styles from './AdminUsers.module.css';

export const AdminUsers: React.FC = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>User Management</h1>
      <p className={styles.subtitle}>View, manage, and assign roles to users in the system.</p>

      <div className={styles.filters}>
        <input type="text" placeholder="Search by name or email..." className={styles.searchInput} />
        <select className={styles.filterSelect}>
          <option value="all">All Roles</option>
          <option value="user">USER</option>
          <option value="buyer">BUYER</option>
          <option value="seller">SELLER</option>
          <option value="admin">ADMIN</option>
        </select>
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>#USR-8821</td>
            <td>John Doe</td>
            <td>john@example.com</td>
            <td><span className={styles.roleBadge}>BUYER</span></td>
            <td><span className={styles.statusActive}>Active</span></td>
            <td>
              <Button variant="outline" size="small">Edit Role</Button>
            </td>
          </tr>
          <tr>
            <td>#USR-8822</td>
            <td>Jane Smith</td>
            <td>jane.seller@example.com</td>
            <td><span className={styles.roleBadge}>SELLER</span></td>
            <td><span className={styles.statusActive}>Active</span></td>
            <td>
              <Button variant="outline" size="small">Edit Role</Button>
            </td>
          </tr>
          <tr>
            <td>#USR-8823</td>
            <td>Mike Ross</td>
            <td>mike.new@example.com</td>
            <td><span className={styles.roleBadge}>USER</span></td>
            <td><span className={styles.statusBanned}>Banned</span></td>
            <td>
              <Button variant="outline" size="small">Restore</Button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};
