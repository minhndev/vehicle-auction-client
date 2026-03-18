import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../store';
import { logout } from '../../store/slices/authSlice';
import { Button } from '../../components/ui/Button/Button';
import { NotificationBell } from './NotificationBell';
import styles from './Navbar.module.css';

export const Navbar: React.FC = () => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // In a real application, navigate to search results
      console.log('Searching for:', searchQuery);
    }
  };

  return (
    <header className={styles.navbar}>
      <Link to="/" className={styles.logo}>
        <div>
          Auto<span className={styles.logoAccent}>Bid</span>
        </div>
      </Link>

      <nav className={styles.navLinks}>
        <Link to="/" className={styles.link}>Home</Link>
        <Link to="/auctions" className={styles.link}>Auctions</Link>
        <Link to="/how-it-works" className={styles.link}>How it Works</Link>
        <Link to="/about" className={styles.link}>About Us</Link>
      </nav>

      <form className={styles.searchBar} onSubmit={handleSearch}>
        <input 
          type="text" 
          placeholder="Search by brand, model..." 
          className={styles.searchInput}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </form>

      <div className={styles.userSection}>
        {!isAuthenticated ? (
          <>
            <Link to="/login" className={styles.link}>Login</Link>
            <Button variant="primary" size="small" onClick={() => navigate('/register')}>
              Register
            </Button>
          </>
        ) : (
          <>
            <NotificationBell />
            <div className={styles.avatar}>
              {user?.firstName?.charAt(0).toUpperCase() || 'U'}
            </div>
            <Link 
              to={`/${(user?.role || 'user').toLowerCase()}/dashboard`} 
              className={styles.dashboardLink}
            >
              Dashboard
            </Link>
            <Button variant="outline" size="small" onClick={handleLogout}>
              Logout
            </Button>
          </>
        )}
      </div>
    </header>
  );
};
