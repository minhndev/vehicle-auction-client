import React from 'react';
import { Outlet, Link } from 'react-router-dom';

export const AdminLayout: React.FC = () => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside style={{ width: '250px', backgroundColor: '#1a1a1a', color: 'white', padding: 'var(--space-lg)' }}>
        <h3 style={{ color: 'var(--color-error)', marginBottom: 'var(--space-xl)' }}>Admin System</h3>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <Link style={{ color: '#ccc' }} to="/admin/dashboard">Overview</Link>
          <Link style={{ color: '#ccc' }} to="/admin/users">Manage Users</Link>
          <Link style={{ color: '#ccc' }} to="/admin/auctions">Moderate Auctions</Link>
          <Link style={{ color: '#ccc', marginTop: 'auto' }} to="/logout">Logout</Link>
        </nav>
      </aside>
      <main style={{ flex: 1, backgroundColor: 'var(--color-background)' }}>
        <header style={{ padding: 'var(--space-md)', backgroundColor: 'white', borderBottom: '1px solid #ddd', display: 'flex', justifyContent: 'flex-end' }}>
          <span>System Administrator</span>
        </header>
        <div style={{ padding: 'var(--space-xl)' }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};
