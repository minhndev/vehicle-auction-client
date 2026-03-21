import React, { useEffect, useState } from 'react';
import { notificationApi } from '../../../api/notificationApi';
import type { NotificationModel } from '../../../types/index';

const notifTypeLabel: Record<string, string> = {
  AUCTION_WON: '🏆 Thắng đấu giá',
  OUTBID: '📢 Bị vượt giá',
  PAYMENT_SUCCESS: '✅ Thanh toán thành công',
  PAYMENT_FAILED: '❌ Thanh toán thất bại',
  SYSTEM: '🔔 Thông báo hệ thống',
};

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationApi.getNotifications({ page: 0, size: 20 });
      setNotifications(Array.isArray(data) ? data : []);
    } catch {
      setError('Không thể tải thông báo. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id?: string) => {
    if (!id) return;
    try {
      await notificationApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true, readAt: new Date().toISOString() } : n))
      );
    } catch {
      // silent
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: '#6b7280' }}>
        Đang tải thông báo...
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '2rem 1rem' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '0.5rem' }}>Thông báo</h1>
      <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
        {notifications.filter((n) => !n.read).length} thông báo chưa đọc
      </p>

      {error && (
        <div style={{ background: '#fee2e2', color: '#dc2626', padding: '12px', borderRadius: '8px', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      {notifications.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>
          <p style={{ fontSize: '48px' }}>🔔</p>
          <p>Chưa có thông báo nào</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {notifications.map((notif) => (
            <div
              key={notif.id}
              style={{
                background: notif.read ? '#f9fafb' : '#eff6ff',
                border: `1px solid ${notif.read ? '#e5e7eb' : '#bfdbfe'}`,
                borderRadius: '10px',
                padding: '16px',
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-start',
                cursor: notif.read ? 'default' : 'pointer',
                transition: 'background 0.15s',
              }}
              onClick={() => !notif.read && handleMarkRead(notif.id)}
            >
              <div style={{
                fontSize: '20px',
                minWidth: '32px',
                textAlign: 'center',
                marginTop: '2px',
              }}>
                {notif.type ? (notifTypeLabel[notif.type]?.split(' ')[0] ?? '🔔') : '🔔'}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: notif.read ? 400 : 700, fontSize: '14px', marginBottom: '4px' }}>
                  {notif.title || (notif.type && notifTypeLabel[notif.type]) || 'Thông báo'}
                </p>
                {notif.content && (
                  <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '6px' }}>{notif.content}</p>
                )}
                <p style={{ fontSize: '12px', color: '#9ca3af' }}>
                  {notif.createdAt ? new Date(notif.createdAt).toLocaleString('vi-VN') : ''}
                </p>
              </div>
              {!notif.read && (
                <div style={{
                  width: '10px', height: '10px', borderRadius: '50%',
                  background: '#3b82f6', flexShrink: 0, marginTop: '6px',
                }} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
