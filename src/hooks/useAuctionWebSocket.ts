import { useEffect, useState, useCallback, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { store } from '../store';

export interface AuctionUpdateMessage {
  auctionId: string;
  currentPrice: number;
  highestBidderId: string;
  message: string;
}

export interface NotificationMessage {
  id?: string;
  type?: string;
  title?: string;
  content?: string;
  referenceId?: string;
  referenceType?: string;
  createdAt?: string;
}

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:8080/api/v1/ws-auctions';

export const useAuctionWebSocket = (auctionId: string) => {
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [latestMessage, setLatestMessage] = useState<string | null>(null);
  const [notification, setNotification] = useState<NotificationMessage | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const clientRef = useRef<Client | null>(null);

  useEffect(() => {
    if (!auctionId) return;

    const token = store.getState().auth.accessToken ?? localStorage.getItem('accessToken');
    const accountId = store.getState().auth.user?.id;

    const client = new Client({
      // @ts-ignore — SockJS is not typed for webSocketFactory
      webSocketFactory: () => new SockJS(WS_URL),
      connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = () => {
      setIsConnected(true);

      // 1. Subscribe to real-time auction price updates
      client.subscribe(`/topic/auctions/${auctionId}`, (message) => {
        if (!message.body) return;
        try {
          const data: AuctionUpdateMessage = JSON.parse(message.body);
          if (data.currentPrice !== undefined) setCurrentPrice(data.currentPrice);
          if (data.message) setLatestMessage(data.message);
        } catch (e) {
          console.error('[WS] Failed to parse auction update', e);
        }
      });

      // 2. Subscribe to personal notifications (outbid, won, etc.)
      if (accountId) {
        client.subscribe(`/queue/notifications/${accountId}`, (message) => {
          if (!message.body) return;
          try {
            const notif: NotificationMessage = JSON.parse(message.body);
            setNotification(notif);
          } catch (e) {
            console.error('[WS] Failed to parse notification', e);
          }
        });
      }
    };

    client.onStompError = (frame) => {
      console.error('[WS] STOMP error:', frame.headers['message']);
    };

    client.onDisconnect = () => {
      setIsConnected(false);
    };

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
      setIsConnected(false);
    };
  }, [auctionId]);

  // Place bid via WebSocket (preferred) — returns true if sent successfully
  const placeBidViaWS = useCallback((amount: number): boolean => {
    if (clientRef.current?.connected) {
      clientRef.current.publish({
        destination: `/app/auction/${auctionId}/bid`,
        body: JSON.stringify({ amount }),
      });
      return true;
    }
    return false;
  }, [auctionId]);

  return { currentPrice, latestMessage, notification, isConnected, placeBidViaWS };
};
