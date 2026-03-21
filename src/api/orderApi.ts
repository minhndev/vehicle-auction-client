import axiosClient from './axiosClient';
import type { OrderResponse, PageOrderResponse } from '../types/index';

export interface CheckoutRequest {
  recipientName: string;
  recipientPhone: string;
  shippingAddress: string;
  shippingNote?: string;
}

export interface PaymentUrlResponse {
  paymentUrl?: string;
  paymentURL?: string; // backend may return either casing
}

export const orderApi = {
  getMyOrders: async (params?: { page?: number; size?: number; sort?: string }): Promise<PageOrderResponse> => {
    return axiosClient.get('/orders/my-orders', { params });
  },

  getOrderById: async (id: string): Promise<OrderResponse> => {
    return axiosClient.get(`/orders/${id}`);
  },

  /**
   * POST /orders/{id}/pay
   * Submits shipping info and initiates VNPay payment.
   * Returns paymentUrl to redirect the user.
   */
  payOrder: async (id: string, shippingInfo: CheckoutRequest): Promise<PaymentUrlResponse> => {
    return axiosClient.post(`/orders/${id}/pay`, shippingInfo);
  },
};
