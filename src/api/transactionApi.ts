import axiosClient from './axiosClient';

export interface TransactionItem {
  id?: string;
  type?: string;
  status?: string;
  amount?: number;
  description?: string;
  referenceId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TransactionPageResponse {
  totalElements?: number;
  totalPages?: number;
  first?: boolean;
  last?: boolean;
  size?: number;
  content?: TransactionItem[];
  number?: number;
  numberOfElements?: number;
  empty?: boolean;
}

export interface TransactionQueryParams {
  page?: number;
  size?: number;
  sort?: string;
}

export const transactionApi = {
  getMyTransactions: async (params?: TransactionQueryParams): Promise<TransactionPageResponse> => {
    return axiosClient.get('/transactions/me', { params });
  },
};
