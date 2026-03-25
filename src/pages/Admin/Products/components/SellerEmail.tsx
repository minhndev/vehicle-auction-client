import React, { useState, useEffect } from 'react';
import { adminApi, type UserResponse } from '../../../../api/adminApi';

// Simple in-memory cache to avoid duplicate requests across the list
const emailCache: Record<string, string> = {};
const pendingRequests: Record<string, Promise<string>> = {};

interface SellerEmailProps {
  sellerId: string;
  fallback?: string;
}

export const SellerEmail: React.FC<SellerEmailProps> = ({ sellerId, fallback = 'N/A' }) => {
  const [email, setEmail] = useState<string | null>(emailCache[sellerId] || null);

  useEffect(() => {
    if (!sellerId || sellerId === 'N/A' || sellerId.includes('@')) {
      if (sellerId?.includes('@')) setEmail(sellerId);
      return;
    }

    if (emailCache[sellerId]) {
      setEmail(emailCache[sellerId]);
      return;
    }

    const fetchEmail = async () => {
      // Check if there's already a pending request for this ID to avoid redundant calls
      if (sellerId in pendingRequests) {
        try {
          const resolvedEmail = await pendingRequests[sellerId];
          setEmail(resolvedEmail);
        } catch (err) {
          // ignore
        }
        return;
      }

      try {
        pendingRequests[sellerId] = adminApi.getUserById(sellerId).then((user: UserResponse) => {
          emailCache[sellerId] = user.email;
          delete pendingRequests[sellerId];
          return user.email;
        });

        const result = await pendingRequests[sellerId];
        setEmail(result);
      } catch (err: any) {
        if (err?.response?.status !== 404) {
          console.error(`Failed to resolve email for ${sellerId}:`, err);
        }
        emailCache[sellerId] = fallback; // Cache the fallback to avoid retrying indefinitely
        setEmail(fallback);
        delete pendingRequests[sellerId];
      }
    };

    fetchEmail();
  }, [sellerId, fallback]);

  if (email) {
    return <span title={sellerId}>{email}</span>;
  }

  return <span className="text-slate-400 animate-pulse">Loading...</span>;
};
