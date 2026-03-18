import { useEffect, useState, useCallback, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { store } from '../store';

export const useAuctionWebSocket = (auctionId: string) => {
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [bidsCount, setBidsCount] = useState<number | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const clientRef = useRef<Client | null>(null);

  useEffect(() => {
    if (!auctionId) return;

    // Thay thế WS_URL bằng VITE_WS_URL thực tế, mặc định fallback về localhost:8080/ws
    const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:8080/ws';
    const token = store.getState().auth.accessToken || localStorage.getItem('token');

    const client = new Client({
      // @ts-ignore
      webSocketFactory: () => new SockJS(WS_URL),
      connectHeaders: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      debug: () => {
        // console.log('STOMP: ', str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = () => {
      setIsConnected(true);
      // Subscribe to the specific auction updates
      client.subscribe(`/topic/auction/${auctionId}`, (message) => {
        if (message.body) {
          try {
            const data = JSON.parse(message.body);
            if (data.currentPrice !== undefined) {
              setCurrentPrice(data.currentPrice);
            }
            if (data.totalBids !== undefined) {
              setBidsCount(data.totalBids);
            }
          } catch (e) {
            console.error('Failed to parse websocket message', e);
          }
        }
      });
    };

    client.onStompError = (frame) => {
      console.error('Broker reported error: ' + frame.headers['message']);
      console.error('Additional details: ' + frame.body);
    };

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
      setIsConnected(false);
    };
  }, [auctionId]);

  const placeBid = useCallback((amount: number) => {
    if (clientRef.current && clientRef.current.connected) {
      // Endpoint gửi bid qua STOMP, có thể sửa đổi theo BE yêu cầu
      clientRef.current.publish({
        destination: `/app/auction/${auctionId}/bid`,
        body: JSON.stringify({ amount })
      });
      return true;
    } else {
      console.error('WebSocket is not connected');
      return false;
    }
  }, [auctionId]);

  return { currentPrice, bidsCount, isConnected, placeBid };
};
