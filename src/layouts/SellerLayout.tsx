import React from 'react';
import { Outlet, Link } from 'react-router-dom';

export const SellerLayout: React.FC = () => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside style={{ width: '250px', backgroundColor: 'var(--color-primary)', color: 'white', padding: 'var(--space-lg)' }}>
        <h3 style={{ color: 'white', marginBottom: 'var(--space-xl)' }}>Seller Portal</h3>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <Link style={{ color: 'var(--color-secondary)' }} to="/seller/dashboard">Dashboard</Link>
          <Link style={{ color: 'var(--color-secondary)' }} to="/seller/auctions">My Auctions</Link>
          <Link style={{ color: 'var(--color-secondary)' }} to="/seller/settings">Account Settings</Link>
          <Link style={{ color: 'var(--color-secondary)', marginTop: 'auto' }} to="/logout">Logout</Link>
        </nav>
      </aside>
      <main style={{ flex: 1, backgroundColor: 'var(--color-background)' }}>
        <header style={{ padding: 'var(--space-md)', backgroundColor: 'white', borderBottom: '1px solid #ddd', display: 'flex', justifyContent: 'flex-end' }}>
          <span>Welcome, Seller</span>
        </header>
        <div style={{ padding: 'var(--space-xl)' }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};
