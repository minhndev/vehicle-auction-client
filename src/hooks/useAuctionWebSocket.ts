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

export interface DepositPaymentStatusMessage {
  type?: string;
  auctionId?: string;
  depositId?: string;
  transactionRef?: string;
  gatewayTransactionNo?: string;
  vnpResponseCode?: string;
  paymentStatus?: string;
  depositStatus?: string;
  occurredAt?: string;
  message?: string;
}

const toWebSocketUrl = (urlValue: string): string => {
  if (urlValue.startsWith('ws://') || urlValue.startsWith('wss://')) {
    return urlValue;
  }

  if (urlValue.startsWith('http://')) {
    return `ws://${urlValue.slice('http://'.length)}`;
  }

  if (urlValue.startsWith('https://')) {
    return `wss://${urlValue.slice('https://'.length)}`;
  }

  return `ws://${urlValue}`;
};

const toHttpUrl = (urlValue: string): string => {
  if (urlValue.startsWith('http://') || urlValue.startsWith('https://')) {
    return urlValue;
  }

  if (urlValue.startsWith('ws://')) {
    return `http://${urlValue.slice('ws://'.length)}`;
  }

  if (urlValue.startsWith('wss://')) {
    return `https://${urlValue.slice('wss://'.length)}`;
  }

  return `http://${urlValue}`;
};

const resolveWsEndpoints = (): { sockJsUrl: string; brokerUrl: string } => {
  const configured = import.meta.env.VITE_WS_URL;
  if (configured) {
    return {
      sockJsUrl: toHttpUrl(configured),
      brokerUrl: toWebSocketUrl(configured),
    };
  }

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';
  try {
    const url = new URL(apiBaseUrl);
    const base = `${url.origin}/api/v1/ws-auctions`;
    return {
      sockJsUrl: base,
      brokerUrl: toWebSocketUrl(base),
    };
  } catch {
    const fallback = 'http://localhost:8080/api/v1/ws-auctions';
    return {
      sockJsUrl: fallback,
      brokerUrl: toWebSocketUrl(fallback),
    };
  }
};

const { sockJsUrl: WS_SOCKJS_URL, brokerUrl: WS_BROKER_URL } = resolveWsEndpoints();

export const useAuctionWebSocket = (auctionId: string) => {
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [latestMessage, setLatestMessage] = useState<string | null>(null);
  const [notification, setNotification] = useState<NotificationMessage | null>(null);
  const [depositStatusMessage, setDepositStatusMessage] = useState<DepositPaymentStatusMessage | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [autoTransport, setAutoTransport] = useState<'websocket' | 'sockjs'>('websocket');
  const [hasAutoFallback, setHasAutoFallback] = useState(false);
  const clientRef = useRef<Client | null>(null);

  useEffect(() => {
    if (!auctionId) return;

    const token = store.getState().auth.accessToken ?? localStorage.getItem('accessToken');
    const accountId = store.getState().auth.user?.id;
    const configuredTransport = String(import.meta.env.VITE_WS_TRANSPORT || 'auto').toLowerCase();
    const transport = configuredTransport === 'auto'
      ? autoTransport
      : configuredTransport === 'sockjs'
        ? 'sockjs'
        : 'websocket';
    const useSockJs = transport === 'sockjs';

    if (import.meta.env.DEV) {
      console.log('[WS] Transport mode:', transport, '| configured:', configuredTransport);
    }

    const client = new Client({
      ...(useSockJs
        // @ts-ignore — SockJS is not typed for webSocketFactory
        ? { webSocketFactory: () => new SockJS(WS_SOCKJS_URL) }
        : { brokerURL: WS_BROKER_URL }),
      connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
      reconnectDelay: 3000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      debug: (msg: string) => {
        if (import.meta.env.DEV) {
          console.log('[WS]', msg);
        }
      },
    });

    client.onConnect = () => {
      setIsConnected(true);
      setHasAutoFallback(false);

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

      // 3. Subscribe to deposit payment status updates (user destination)
      client.subscribe('/user/queue/deposits/payment-status', (message) => {
        if (!message.body) return;
        try {
          const payload: DepositPaymentStatusMessage = JSON.parse(message.body);
          setDepositStatusMessage(payload);
        } catch (e) {
          console.error('[WS] Failed to parse deposit status message', e);
        }
      });
    };

    client.onStompError = (frame) => {
      console.error('[WS] STOMP error:', frame.headers['message']);
    };

    client.onWebSocketError = (event) => {
      if (configuredTransport === 'auto' && !useSockJs) {
        console.warn('[WS] Raw WebSocket failed, fallback to SockJS:', event);
      } else {
        console.error('[WS] WebSocket error:', event);
      }

      if (configuredTransport === 'auto' && !useSockJs && !hasAutoFallback) {
        setHasAutoFallback(true);
        setAutoTransport('sockjs');
      }
    };

    client.onWebSocketClose = () => {
      if (configuredTransport === 'auto' && !useSockJs) {
        console.warn('[WS] Raw WebSocket closed; switching to SockJS fallback.');
      }
      if (configuredTransport === 'auto' && !useSockJs && !hasAutoFallback) {
        setHasAutoFallback(true);
        setAutoTransport('sockjs');
      }
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
  }, [auctionId, autoTransport, hasAutoFallback]);

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

  return { currentPrice, latestMessage, notification, depositStatusMessage, isConnected, placeBidViaWS };
};
