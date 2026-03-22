import axiosClient from './axiosClient';
import type { DepositRequest, PaymentCreateRequest, PaymentResponse } from '../types';

export interface PaymentQueryParams {
  page?: number;
  size?: number;
  sort?: string;
}

export const paymentApi = {
  createDepositPayment: async (data: DepositRequest): Promise<PaymentResponse> => {
    return axiosClient.post('/deposits', data);
  },

  createPaymentUrl: async (data: PaymentCreateRequest): Promise<PaymentResponse> => {
    return axiosClient.post('/payments/create', data);
  },

  createOrderPayment: async (orderId: string): Promise<PaymentResponse> => {
    return axiosClient.post(`/orders/${orderId}/pay`);
  },

  getVnPayReturn: async (queryString: string): Promise<unknown> => {
    return axiosClient.get(`/payments/vnpay-return${queryString}`);
  },

  getVnPayIpn: async (queryString: string): Promise<unknown> => {
    return axiosClient.get(`/payments/vnpay-ipn${queryString}`);
  },
};
