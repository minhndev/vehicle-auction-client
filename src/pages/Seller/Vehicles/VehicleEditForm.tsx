import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { catalogApi } from '../../../api/catalogApi';
import { Button } from '../../../components/ui/Button/Button';
import { sellerApi, type ProductRequest } from '../../../features/seller/api/sellerApi';
import type { CategoryResponse, ProductResponse } from '../../../types/index';
import styles from './VehicleRegistrationForm.module.css';

const toNumber = (value?: number | string) => {
  if (typeof value === 'number') return value;
  const parsed = Number(value || 0);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const VehicleEditForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);
  const [isEditLocked, setIsEditLocked] = useState(false);
  const [lockedStatus, setLockedStatus] = useState<string | null>(null);

  const [formData, setFormData] = useState<ProductRequest>({
    brand: '',
    model: '',
    color: '',
    engineNumber: '',
    licensePlate: '',
    year: new Date().getFullYear(),
    vinNumber: '',
    categoryId: '',
    mileage: 0,
    transmission: 'Automatic',
    fuelType: 'Gasoline',
    description: '',
    basePrice: 0,
    stepPrice: 0,
    images: [],
  });

  useEffect(() => {
    const loadData = async () => {
      if (!id) {
        setError('Thiếu mã sản phẩm.');
        setInitializing(false);
        return;
      }

      try {
        setInitializing(true);
        setError(null);

        const [categoryRes, product] = await Promise.all([
          catalogApi.getCategories(),
          sellerApi.getVehicleById(id),
        ]);

        const categoryItems = (categoryRes as any)?.content || categoryRes || [];
        setCategories(Array.isArray(categoryItems) ? categoryItems : []);

        const typedProduct = product as ProductResponse;
        if (typedProduct.status === 'IN_AUCTION' || typedProduct.status === 'SOLD') {
          setIsEditLocked(true);
          setLockedStatus(typedProduct.status || null);
        }
        const urls = Array.isArray(typedProduct.images)
          ? typedProduct.images.map((img) => img?.url).filter(Boolean) as string[]
          : [];

        setExistingImageUrls(urls);
        setImagePreviews(urls);

        setFormData({
          brand: typedProduct.brand || '',
          model: typedProduct.model || '',
          color: typedProduct.color || '',
          engineNumber: typedProduct.engineNumber || '',
          licensePlate: typedProduct.licensePlate || '',
          year: toNumber(typedProduct.manufactureYear || typedProduct.year) || new Date().getFullYear(),
          vinNumber: typedProduct.vinNumber || '',
          categoryId: typedProduct.categoryId || '',
          mileage: toNumber(typedProduct.mileage),
          transmission: typedProduct.transmission || 'Automatic',
          fuelType: typedProduct.fuelType || 'Gasoline',
          description: typedProduct.description || '',
          basePrice: toNumber(typedProduct.basePrice || typedProduct.startPrice),
          stepPrice: 0,
          images: urls,
        });
      } catch (err: any) {
        setError(err?.response?.data?.message || err?.message || 'Không thể tải dữ liệu sản phẩm.');
      } finally {
        setInitializing(false);
      }
    };

    loadData();
  }, [id]);

  const selectedCategory = useMemo(
    () => categories.find((category) => String(category.id) === String(formData.categoryId)),
    [categories, formData.categoryId]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'year' || name === 'mileage' || name === 'basePrice' ? Number(value) : value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files).slice(0, 6);
      setImageFiles(files);
      setImagePreviews(files.map((file) => URL.createObjectURL(file)));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    if (!formData.categoryId) {
      setError('Vui lòng chọn danh mục xe');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let imageUrls = existingImageUrls;
      if (imageFiles.length > 0) {
        const uploaded: string[] = [];
        for (const file of imageFiles) {
          const url = await sellerApi.uploadImage(file);
          if (url) uploaded.push(url);
        }
        imageUrls = uploaded;
      }

      await sellerApi.updateVehicle(id, {
        ...formData,
        categoryId: String(formData.categoryId),
        images: imageUrls,
      });

      alert('Cập nhật sản phẩm thành công!');
      navigate('/seller/products');
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Lỗi cập nhật sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  if (initializing) {
    return <div className={styles.container}>Đang tải dữ liệu sản phẩm...</div>;
  }

  if (isEditLocked) {
    return (
      <div className={styles.container}>
        <div className={styles.heroBlock}>
          <p className={styles.eyebrow}>Sell Your Car</p>
          <h1 className={styles.title}>Không thể chỉnh sửa sản phẩm</h1>
          <p className={styles.subtitle}>
            Sản phẩm đang ở trạng thái <strong>{lockedStatus}</strong>. Theo rule nghiệp vụ, sản phẩm IN_AUCTION/SOLD không được phép chỉnh sửa.
          </p>
        </div>
        <div className={styles.actions} style={{ justifyContent: 'flex-start' }}>
          <Link to="/seller/products" style={{ textDecoration: 'none' }}>
            <Button variant="primary">Quay lại danh sách</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.heroBlock}>
        <p className={styles.eyebrow}>Sell Your Car</p>
        <h1 className={styles.title}>Chỉnh sửa sản phẩm</h1>
        <p className={styles.subtitle}>Cập nhật thông tin xe để tiếp tục quy trình duyệt hoặc đấu giá.</p>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.layout}>
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.section}>
            <h2>Thông tin cơ bản</h2>
            <div className={styles.grid}>
              <div className={styles.formGroup}>
                <label>Hãng xe *</label>
                <input type="text" name="brand" required value={formData.brand} onChange={handleChange} />
              </div>
              <div className={styles.formGroup}>
                <label>Mẫu xe *</label>
                <input type="text" name="model" required value={formData.model} onChange={handleChange} />
              </div>
              <div className={styles.formGroup}>
                <label>Màu xe *</label>
                <input type="text" name="color" required value={formData.color} onChange={handleChange} />
              </div>
              <div className={styles.formGroup}>
                <label>Số máy *</label>
                <input type="text" name="engineNumber" required value={formData.engineNumber} onChange={handleChange} />
              </div>
              <div className={styles.formGroup}>
                <label>Biển số *</label>
                <input type="text" name="licensePlate" required value={formData.licensePlate} onChange={handleChange} />
              </div>
              <div className={styles.formGroup}>
                <label>Năm sản xuất *</label>
                <input type="number" name="year" required value={formData.year} onChange={handleChange} min={1900} max={new Date().getFullYear() + 1} />
              </div>
              <div className={styles.formGroup}>
                <label>Số khung (VIN) *</label>
                <input type="text" name="vinNumber" required value={formData.vinNumber} onChange={handleChange} />
              </div>
              <div className={styles.formGroup}>
                <label>Danh mục *</label>
                <select name="categoryId" value={formData.categoryId} onChange={handleChange} required>
                  <option value="">-- Chọn danh mục --</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <h2>Thông số & Giá</h2>
            <div className={styles.grid}>
              <div className={styles.formGroup}>
                <label>ODO (km) *</label>
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
                <label>Giá khởi điểm (VND) *</label>
                <input type="number" name="basePrice" required value={formData.basePrice || ''} onChange={handleChange} min={1000000} />
              </div>
              <div className={styles.formGroup}>
                <label>Mô tả xe</label>
                <input type="text" name="description" value={formData.description || ''} onChange={handleChange} />
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <h2>Hình ảnh</h2>
            <div className={styles.formGroup}>
              <label>Tải ảnh mới (tuỳ chọn, thay thế toàn bộ ảnh cũ)</label>
              <input type="file" accept="image/*" multiple onChange={handleImageChange} />
            </div>

            {imagePreviews.length > 0 && (
              <div className={styles.photoGrid}>
                {imagePreviews.map((preview, index) => (
                  <div key={`${preview}-${index}`} className={styles.photoCard}>
                    <img src={preview} alt={`Vehicle ${index + 1}`} className={styles.imagePreview} />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className={styles.actions}>
            <Link to="/seller/products" style={{ textDecoration: 'none' }}>
              <Button type="button" variant="outline">Hủy</Button>
            </Link>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
          </div>
        </form>

        <aside className={styles.summaryCard}>
          <h3>Tổng quan</h3>
          <div className={styles.summaryItem}>
            <span>Xe</span>
            <strong>{formData.brand && formData.model ? `${formData.brand} ${formData.model}` : 'Chưa cập nhật'}</strong>
          </div>
          <div className={styles.summaryItem}>
            <span>Năm</span>
            <strong>{formData.year || 'N/A'}</strong>
          </div>
          <div className={styles.summaryItem}>
            <span>Danh mục</span>
            <strong>{selectedCategory?.name || 'Chưa chọn'}</strong>
          </div>
          <div className={styles.summaryItem}>
            <span>Giá khởi điểm</span>
            <strong>{formData.basePrice ? `${formData.basePrice.toLocaleString('vi-VN')} VND` : 'Chưa cập nhật'}</strong>
          </div>
        </aside>
      </div>
    </div>
  );
};
