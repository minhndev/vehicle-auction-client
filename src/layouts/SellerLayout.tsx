import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../store/slices/authSlice';
import { authService } from '../features/auth/api/authService';

export const SellerLayout: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch {
      // ignore and clear local session anyway
    } finally {
      dispatch(logout());
      navigate('/');
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside style={{ width: '250px', backgroundColor: 'var(--color-primary)', color: 'white', padding: 'var(--space-lg)' }}>
        <h3 style={{ color: 'white', marginBottom: 'var(--space-xl)' }}>Seller Portal</h3>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <Link style={{ color: 'var(--color-secondary)' }} to="/seller/dashboard">Dashboard</Link>
          <Link style={{ color: 'var(--color-secondary)' }} to="/seller/products">My Products</Link>
          <Link style={{ color: 'var(--color-secondary)' }} to="/seller/auctions">My Auctions</Link>
          <Link style={{ color: 'var(--color-secondary)' }} to="/seller/settings">Account Settings</Link>
          <button
            type="button"
            onClick={handleLogout}
            style={{ color: 'var(--color-secondary)', marginTop: 'auto', background: 'transparent', border: 'none', textAlign: 'left', cursor: 'pointer', padding: 0 }}
          >
            Logout
          </button>
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
