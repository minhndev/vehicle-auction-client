import axiosClient from '../../../api/axiosClient';
import { catalogApi } from '../../../api/catalogApi';
import { userApi } from '../../../api/userApi';
import type { ProductResponse } from '../../../types/index';

export interface ProductRequest {
  brand: string;
  model: string;
  color: string;
  engineNumber: string;
  licensePlate: string;
  year: number;
  vinNumber: string;
  categoryId: number | string;
  mileage: number;
  transmission: string;
  fuelType: string;
  description?: string;
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
    const categoryId = String(data.categoryId || '').trim();
    if (!categoryId || categoryId.toLowerCase() === 'nan') {
      throw new Error('Danh mục xe không hợp lệ. Vui lòng chọn lại danh mục.');
    }

    return catalogApi.createProduct({
      categoryId,
      name: `${data.brand} ${data.model} ${data.year}`,
      brand: data.brand.trim(),
      model: data.model.trim(),
      color: data.color.trim(),
      engineNumber: data.engineNumber.trim(),
      licensePlate: data.licensePlate.trim(),
      transmission: data.transmission.trim(),
      fuelType: data.fuelType.trim(),
      description: data.description?.trim() || undefined,
      vinNumber: data.vinNumber.trim().toUpperCase(),
      manufactureYear: String(data.year),
      mileage: String(data.mileage),
      startPrice: String(data.basePrice),
      imageUrls: data.images || [],
    });
  },

  getVehicleById: async (id: string): Promise<ProductResponse> => {
    return catalogApi.getProductById(id);
  },

  updateVehicle: async (id: string, data: ProductRequest): Promise<ProductResponse> => {
    return catalogApi.updateProduct(id, {
      categoryId: String(data.categoryId),
      name: `${data.brand} ${data.model} ${data.year}`,
      brand: data.brand.trim(),
      model: data.model.trim(),
      color: data.color.trim(),
      engineNumber: data.engineNumber.trim(),
      licensePlate: data.licensePlate.trim(),
      transmission: data.transmission.trim(),
      fuelType: data.fuelType.trim(),
      description: data.description?.trim() || undefined,
      vinNumber: data.vinNumber.trim().toUpperCase(),
      manufactureYear: String(data.year),
      mileage: String(data.mileage),
      startPrice: String(data.basePrice),
      imageUrls: data.images || [],
    });
  },

  deleteVehicle: async (id: string): Promise<void> => {
    return catalogApi.deleteProduct(id);
  },

  restoreVehicle: async (id: string): Promise<ProductResponse> => {
    return catalogApi.restoreProduct(id);
  },

  getMyVehicles: async (): Promise<ProductResponse[]> => {
    // Prefer exact sellerId filter to avoid leaking other sellers' products.
    const me = await userApi.getMe().catch(() => null);
    const sellerId = me?.id;

    if (sellerId) {
      const filtered = await catalogApi.getProducts({ sellerId });
      return filtered.content || [];
    }

    // Fallback for backends supporting semantic "me" query.
    const response = await catalogApi.getProducts({ sellerId: 'me' });
    return response.content || [];
  }
};
