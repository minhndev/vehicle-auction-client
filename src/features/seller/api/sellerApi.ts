import axiosClient from '../../../api/axiosClient';

export interface ProductRequest {
  brand: string;
  model: string;
  year: number;
  type: string;
  mileage: number;
  transmission: string;
  fuelType: string;
  description?: string;
  image?: string;
}

export const sellerApi = {
  uploadImage: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await axiosClient.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    // @ts-ignore
    return response.url || response.data?.url || response.data;
  },

  registerVehicle: async (data: ProductRequest) => {
    const response = await axiosClient.post('/products', data);
    return response.data || response;
  }
};
