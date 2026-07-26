import React, { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import type { RootState } from '../../store';
import { notificationApi } from '../../api/notificationApi';
import type { NotificationModel } from '../../types/index';
import styles from './NotificationBell.module.css';

const getIcon = (type?: string) => {
  switch (type) {
    case 'AUCTION_WON': return '🏆';
    case 'OUTBID': return '⚠️';
    case 'PAYMENT_SUCCESS': return '💰';
    case 'PAYMENT_FAILED': return '❌';
    default: return '📢';
  }
};

const formatTime = (dateStr?: string) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 60000);
  if (diff < 1) return 'Vừa xong';
  if (diff < 60) return `${diff} phút trước`;
  if (diff < 1440) return `${Math.floor(diff / 60)} giờ trước`;
  return date.toLocaleDateString('vi-VN');
};

export const NotificationBell: React.FC = () => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<NotificationModel[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isAuthenticated) {
      notificationApi.getUnreadCount().then((count) => {
        setUnreadCount(Number(count) || 0);
      }).catch(() => {});
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

  const toggleDropdown = async () => {
    const next = !isOpen;
    setIsOpen(next);
    if (next) {
      try {
        const data = await notificationApi.getNotifications({ page: 0, size: 5 });
        setNotifications(Array.isArray(data) ? data.slice(0, 5) : []);
      } catch {
        // silent
      }
    }
  };

  const handleMarkAsRead = async (id?: string, e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (!id) return;
    try {
      await notificationApi.markAsRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // silent
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className={styles.container} ref={dropdownRef}>
      <button className={styles.bellButton} onClick={toggleDropdown} aria-label="Thông báo">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unreadCount > 0 && (
          <span className={styles.badge}>{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          <div className={styles.dropdownHeader}>
            <h3>Thông báo</h3>
            {unreadCount > 0 && <span className={styles.unreadText}>{unreadCount} chưa đọc</span>}
          </div>

          <div className={styles.list}>
            {notifications.length === 0 ? (
              <div className={styles.empty}>Chưa có thông báo nào.</div>
            ) : (
              notifications.map((notif) => (
                <div key={notif.id} className={`${styles.item} ${!notif.read ? styles.unreadItem : ''}`}>
                  <div className={styles.itemIcon}>{getIcon(notif.type)}</div>
                  <div className={styles.itemContent}>
                    <p className={styles.message}>{notif.content ?? notif.title ?? 'Thông báo mới'}</p>
                    <span className={styles.time}>{formatTime(notif.createdAt)}</span>
                  </div>
                  {!notif.read && (
                    <button
                      className={styles.markReadBtn}
                      onClick={(e) => handleMarkAsRead(notif.id, e)}
                      title="Đánh dấu đã đọc"
                    >
                      <div className={styles.readDot} />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          <div className={styles.dropdownFooter}>
            <Link to="/user/notifications" onClick={() => setIsOpen(false)}>
              Xem tất cả thông báo
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
