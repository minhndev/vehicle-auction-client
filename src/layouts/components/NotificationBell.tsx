import React, { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import type { RootState } from '../../store';
import { notificationApi, type Notification } from '../../api/notificationApi';
import styles from './NotificationBell.module.css';

export const NotificationBell: React.FC = () => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUnreadCount();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const response = await notificationApi.getUnreadCount();
      // Assume API returns a number directly or an object { count: number }
      const count = typeof response === 'number' ? response : (response.data?.count || 0);
      setUnreadCount(count);
    } catch {
      // Ignore silently
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await notificationApi.getNotifications({ page: 0, size: 5 });
      if (response && response.content) {
        setNotifications(response.content);
      } else if (Array.isArray(response)) {
        setNotifications(response.slice(0, 5));
      }
    } catch {
      // Ignore silently
    }
  };

  const toggleDropdown = async () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    if (nextState) {
      await fetchNotifications();
    }
  };

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await notificationApi.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {
      // Ignore
    }
  };

  const getIcon = (type: Notification['type']) => {
    switch(type) {
      case 'AUCTION_WON': return '🏆';
      case 'OUTBID': return '⚠️';
      case 'PAYMENT_SUCCESS': return '💰';
      default: return '📢';
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 60000); // in minutes
    
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return date.toLocaleDateString();
  };

  if (!isAuthenticated) return null;

  return (
    <div className={styles.container} ref={dropdownRef}>
      <button className={styles.bellButton} onClick={toggleDropdown} aria-label="Notifications">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>
        {unreadCount > 0 && (
          <span className={styles.badge}>{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          <div className={styles.dropdownHeader}>
            <h3>Notifications</h3>
            {unreadCount > 0 && <span className={styles.unreadText}>{unreadCount} unread</span>}
          </div>
          
          <div className={styles.list}>
            {notifications.length === 0 ? (
              <div className={styles.empty}>No notifications yet.</div>
            ) : (
              notifications.map((notif) => (
                <div key={notif.id} className={`${styles.item} ${!notif.read ? styles.unreadItem : ''}`}>
                  <div className={styles.itemIcon}>{getIcon(notif.type)}</div>
                  <div className={styles.itemContent}>
                    <p className={styles.message}>{notif.message}</p>
                    <span className={styles.time}>{formatTime(notif.createdAt)}</span>
                  </div>
                  {!notif.read && (
                    <button 
                      className={styles.markReadBtn} 
                      onClick={(e) => handleMarkAsRead(notif.id, e)}
                      title="Mark as read"
                    >
                      <div className={styles.readDot}></div>
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
          <div className={styles.dropdownFooter}>
            <Link to="/user/dashboard" onClick={() => setIsOpen(false)}>View all notifications</Link>
          </div>
        </div>
      )}
    </div>
  );
};
