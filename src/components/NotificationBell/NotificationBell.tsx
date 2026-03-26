import React, { useEffect, useRef, useState } from 'react';
import { Bell, Trophy, ChevronUp, Package, AlertCircle, CheckCircle2, X } from 'lucide-react';
import { notificationApi } from '../../api/notificationApi';
import type { NotificationModel } from '../../types/index';
import { useAppSelector } from '../../store';

const TYPE_CONFIG: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  OUTBID: {
    icon: <ChevronUp size={16} />,
    color: 'bg-red-500 text-white',
    label: 'Bị vượt giá',
  },
  AUCTION_WON: {
    icon: <Trophy size={16} />,
    color: 'bg-amber-500 text-white',
    label: 'Thắng đấu giá',
  },
  BID_SUCCESSFUL: {
    icon: <CheckCircle2 size={16} />,
    color: 'bg-emerald-500 text-white',
    label: 'Đặt giá thành công',
  },
  DEPOSIT_FORFEITED: {
    icon: <AlertCircle size={16} />,
    color: 'bg-orange-500 text-white',
    label: 'Cọc bị tịch thu',
  },
  CREATE_PRODUCT: {
    icon: <Package size={16} />,
    color: 'bg-blue-500 text-white',
    label: 'Xe mới',
  },
};

const getConfig = (type?: string) =>
  TYPE_CONFIG[String(type || '').toUpperCase()] ?? {
    icon: <Bell size={16} />,
    color: 'bg-slate-500 text-white',
    label: 'Thông báo',
  };

const timeAgo = (dateStr?: string): string => {
  if (!dateStr) return '';
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return 'vừa xong';
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
  return `${Math.floor(diff / 86400)} ngày trước`;
};

interface NotificationBellProps {
  /** Inject a WS notification so the bell lights up in real-time */
  liveNotification?: { id?: string; type?: string; title?: string; content?: string; createdAt?: string } | null;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ liveNotification }) => {
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationModel[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      const [list, count] = await Promise.all([
        notificationApi.getNotifications({ size: 20 }),
        notificationApi.getUnreadCount(),
      ]);
      setNotifications(Array.isArray(list) ? list : []);
      setUnread(typeof count === 'number' ? count : 0);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  // Fetch on mount and every 60s
  useEffect(() => {
    fetchNotifications();
    const iv = setInterval(fetchNotifications, 60000);
    return () => clearInterval(iv);
  }, [isAuthenticated]);

  // Real-time WS notification: prepend and bump unread
  useEffect(() => {
    if (!liveNotification) return;
    setNotifications((prev) => [liveNotification as NotificationModel, ...prev].slice(0, 30));
    setUnread((u) => u + 1);
  }, [liveNotification]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const markRead = async (id?: string) => {
    if (!id) return;
    try {
      await notificationApi.markAsRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
      setUnread((u) => Math.max(0, u - 1));
    } catch {
      // ignore
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => { setOpen((v) => !v); if (!open) fetchNotifications(); }}
        className="relative p-2 text-slate-500 hover:text-[#2e3d83] transition-colors rounded-full hover:bg-slate-100"
        aria-label="Thông báo"
      >
        <Bell size={20} strokeWidth={2} />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[10px] font-black rounded-full px-1 animate-pulse">
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-[360px] bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <div>
              <h3 className="font-black text-slate-800 text-sm">Thông Báo</h3>
              {unread > 0 && <p className="text-xs text-slate-400">{unread} chưa đọc</p>}
            </div>
            <button onClick={() => setOpen(false)} className="p-1 hover:bg-slate-100 rounded-full text-slate-400">
              <X size={16} />
            </button>
          </div>

          {/* List */}
          <div className="overflow-y-auto max-h-[420px]">
            {loading && notifications.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-sm">Đang tải...</div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-sm">Chưa có thông báo nào</div>
            ) : (
              notifications.map((n) => {
                const cfg = getConfig(String(n.type || ''));
                return (
                  <div
                    key={n.id}
                    onClick={() => markRead(n.id)}
                    className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors border-b border-slate-50 last:border-0 ${n.read ? 'bg-white hover:bg-slate-50' : 'bg-blue-50/60 hover:bg-blue-50'}`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${cfg.color}`}>
                      {cfg.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-[13px] font-semibold truncate ${n.read ? 'text-slate-600' : 'text-slate-800'}`}>
                        {n.title || cfg.label}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{n.content}</p>
                      <p className="text-[10px] text-slate-400 mt-1">{timeAgo(n.createdAt)}</p>
                    </div>
                    {!n.read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full shrink-0 mt-1.5" />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
