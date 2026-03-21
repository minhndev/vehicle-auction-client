import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button/Button';
import { sellerApi, type ProductRequest } from '../../../features/seller/api/sellerApi';
import axiosClient from '../../../api/axiosClient';
import type { CategoryResponse } from '../../../types/index';
import styles from './VehicleRegistrationForm.module.css';

export const VehicleRegistrationForm: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [formData, setFormData] = useState<ProductRequest>({
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    vinNumber: '',
    categoryId: '',
    mileage: 0,
    transmission: 'Automatic',
    fuelType: 'Gasoline',
    basePrice: 0,
    stepPrice: 0,
    images: []
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response: any = await axiosClient.get('/categories');
        setCategories(response?.content || response || []);
      } catch (err) {
        // silent fail
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: (name === 'year' || name === 'mileage' || name === 'basePrice' || name === 'stepPrice') 
        ? Number(value) : value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.categoryId) {
      setError('Vui lòng chọn danh mục xe');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let imageUrl = '';
      if (imageFile) {
        imageUrl = await sellerApi.uploadImage(imageFile);
      }

      await sellerApi.registerVehicle({
        ...formData,
        categoryId: Number(formData.categoryId), // Convert categoryId to number for payload
        images: imageUrl ? [imageUrl] : []
      });

      alert('Đăng ký xe thành công! Chờ Admin duyệt.');
      navigate('/seller/auctions');
      
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Lỗi đăng ký xe');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Đăng Ký Đấu Giá Xe Mới</h1>
      <p className={styles.subtitle}>Cung cấp thông tin đầy đủ để được Admin kiểm duyệt lên sàn đấu giá.</p>

      {error && <div className={styles.error}>{error}</div>}

      <form className={styles.form} onSubmit={handleSubmit}>
        
        <div className={styles.section}>
          <h2>Thông Tin Cơ Bản</h2>
          <div className={styles.grid}>
            <div className={styles.formGroup}>
              <label>Hãng xe *</label>
              <input type="text" name="brand" required value={formData.brand} onChange={handleChange} placeholder="VD: Toyota" />
            </div>
            <div className={styles.formGroup}>
              <label>Mẫu xe (Model) *</label>
              <input type="text" name="model" required value={formData.model} onChange={handleChange} placeholder="VD: Camry" />
            </div>
            <div className={styles.formGroup}>
              <label>Năm sản xuất *</label>
              <input type="number" name="year" required value={formData.year} onChange={handleChange} min={1900} max={new Date().getFullYear() + 1} />
            </div>
            <div className={styles.formGroup}>
              <label>Số Khung (VIN) *</label>
              <input type="text" name="vinNumber" required value={formData.vinNumber} onChange={handleChange} placeholder="17 ký tự VIN..." />
            </div>
            <div className={styles.formGroup}>
              <label>Danh mục (Category) *</label>
              <select name="categoryId" value={formData.categoryId} onChange={handleChange} required>
                <option value="">-- Chọn Danh Mục --</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <h2>Thông Số Kỹ Thuật & Giá</h2>
          <div className={styles.grid}>
            <div className={styles.formGroup}>
              <label>Số ODO (mileage) *</label>
              <input type="number" name="mileage" required value={formData.mileage} onChange={handleChange} min={0} />
            </div>
            <div className={styles.formGroup}>
              <label>Hộp số *</label>
              <select name="transmission" value={formData.transmission} onChange={handleChange} required>
                <option value="Automatic">Tự động (Automatic)</option>
                <option value="Manual">Số sàn (Manual)</option>
                <option value="CVT">Vô cấp (CVT)</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>Nhiên liệu *</label>
              <select name="fuelType" value={formData.fuelType} onChange={handleChange} required>
                <option value="Gasoline">Xăng (Gasoline)</option>
                <option value="Diesel">Dầu (Diesel)</option>
                <option value="Electric">Điện (Electric)</option>
                <option value="Hybrid">Lai (Hybrid)</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>Giá khởi điểm đề xuất (VNĐ) *</label>
              <input type="number" name="basePrice" required value={formData.basePrice || ''} onChange={handleChange} min={1000000} />
            </div>
            <div className={styles.formGroup}>
              <label>Bước giá tối thiểu (VNĐ) *</label>
              <input type="number" name="stepPrice" required value={formData.stepPrice || ''} onChange={handleChange} min={100000} />
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <h2>Hình Ảnh Phương Tiện</h2>
          <div className={styles.formGroup}>
            <label>Tải lên ảnh xe *</label>
            <input type="file" accept="image/*" onChange={handleImageChange} required />
            {imagePreview && (
              <img src={imagePreview} alt="Preview" className={styles.imagePreview} style={{ marginTop: '10px', maxHeight: '200px', objectFit: 'contain' }} />
            )}
          </div>
        </div>

        <div className={styles.actions}>
          <Button type="button" variant="outline" onClick={() => navigate('/seller/dashboard')}>Hủy bỏ</Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? 'Đang gửi...' : 'Xác nhận Đăng ký'}
          </Button>
        </div>
      </form>
    </div>
  );
};
