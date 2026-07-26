import React from 'react';
import { Outlet } from 'react-router-dom';
import { ContactTopBar } from '../pages/Home/components/ContactTopBar';
import { HeaderNav } from './components/HeaderNav';
import { FooterTopBar } from './components/FooterTopBar';
import styles from './MainLayout.module.css';

export const MainLayout: React.FC = () => {
  return (
    <div className={styles.root}>
      <ContactTopBar />
      <HeaderNav />
      <main className={styles.main}>
        <Outlet />
      </main>
      <FooterTopBar />
    </div>
  );
};

