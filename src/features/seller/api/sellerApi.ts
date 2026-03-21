import axiosClient from '../../../api/axiosClient';
import type { ProductResponse } from '../../../types/index';

export interface ProductRequest {
  brand: string;
  model: string;
  year: number;
  vinNumber: string;
  categoryId: number | string;
  mileage: number;
  transmission: string;
  fuelType: string;
  basePrice: number;
  stepPrice: number;
  images?: string[];
}

export const sellerApi = {
  uploadImage: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    
    // As per previous findings, backend returns the URL string directly or inside an object
    const response = await axiosClient.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    // @ts-ignore
    return response.url || response.data?.url || response.data || response;
  },

  registerVehicle: async (data: ProductRequest): Promise<ProductResponse> => {
    return axiosClient.post('/products', data);
  },

  getMyVehicles: async (): Promise<ProductResponse[]> => {
    // Standard approach if API has a dedicated endpoint or parameter for one's own products
    // Assuming backend filters by the authenticated user if we hit /products with no explicit params,
    // or we might need /products/my-products. We'll use /products?isMy=true or similar if backend supports it.
    // Spec §3: GET /products (có thể truyền sellerId, nhưng nếu gọi bt với Token Seller, backend nên filter hoặc auth service làm điều này)
    return axiosClient.get('/products');
  }
};
