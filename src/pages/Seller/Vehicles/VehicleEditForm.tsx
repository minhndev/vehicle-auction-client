import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { catalogApi } from '../../../api/catalogApi';
import { Button } from '../../../components/ui/Button/Button';
import { sellerApi, type ProductRequest } from '../../../features/seller/api/sellerApi';
import { usePageI18n } from '../../../i18n/usePageI18n';
import type { CategoryResponse, ProductResponse } from '../../../types/index';
import styles from './VehicleRegistrationForm.module.css';

const toNumber = (value?: number | string) => {
  if (typeof value === 'number') return value;
  const parsed = Number(value || 0);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const VehicleEditForm: React.FC = () => {
  const { tp } = usePageI18n();
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
        setError(tp('sellerVehicleEdit.missingProductId'));
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
        setError(err?.response?.data?.message || err?.message || tp('sellerVehicleEdit.loadError'));
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
      setError(tp('sellerVehicleEdit.categoryRequired'));
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

      alert(tp('sellerVehicleEdit.updateSuccess'));
      navigate('/seller/products');
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || tp('sellerVehicleEdit.updateError'));
    } finally {
      setLoading(false);
    }
  };

  if (initializing) {
    return <div className={styles.container}>{tp('sellerVehicleEdit.loading')}</div>;
  }

  if (isEditLocked) {
    return (
      <div className={styles.container}>
        <div className={styles.heroBlock}>
          <p className={styles.eyebrow}>{tp('sellerVehicleEdit.eyebrow')}</p>
          <h1 className={styles.title}>{tp('sellerVehicleEdit.cannotEditTitle')}</h1>
          <p className={styles.subtitle}>
            {tp('sellerVehicleEdit.cannotEditSubtitle', { status: lockedStatus })}
          </p>
        </div>
        <div className={styles.actions} style={{ justifyContent: 'flex-start' }}>
          <Link to="/seller/products" style={{ textDecoration: 'none' }}>
            <Button variant="primary">{tp('sellerVehicleEdit.backToList')}</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.heroBlock}>
        <p className={styles.eyebrow}>{tp('sellerVehicleEdit.eyebrow')}</p>
        <h1 className={styles.title}>{tp('sellerVehicleEdit.title')}</h1>
        <p className={styles.subtitle}>{tp('sellerVehicleEdit.subtitle')}</p>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.layout}>
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.section}>
            <h2>{tp('sellerVehicleEdit.basicInfo')}</h2>
            <div className={styles.grid}>
              <div className={styles.formGroup}>
                <label>{tp('sellerVehicleEdit.brand')} *</label>
                <input type="text" name="brand" required value={formData.brand} onChange={handleChange} />
              </div>
              <div className={styles.formGroup}>
                <label>{tp('sellerVehicleEdit.model')} *</label>
                <input type="text" name="model" required value={formData.model} onChange={handleChange} />
              </div>
              <div className={styles.formGroup}>
                <label>{tp('sellerVehicleEdit.color')} *</label>
                <input type="text" name="color" required value={formData.color} onChange={handleChange} />
              </div>
              <div className={styles.formGroup}>
                <label>{tp('sellerVehicleEdit.engineNumber')} *</label>
                <input type="text" name="engineNumber" required value={formData.engineNumber} onChange={handleChange} />
              </div>
              <div className={styles.formGroup}>
                <label>{tp('sellerVehicleEdit.licensePlate')} *</label>
                <input type="text" name="licensePlate" required value={formData.licensePlate} onChange={handleChange} />
              </div>
              <div className={styles.formGroup}>
                <label>{tp('sellerVehicleEdit.year')} *</label>
                <input type="number" name="year" required value={formData.year} onChange={handleChange} min={1900} max={new Date().getFullYear() + 1} />
              </div>
              <div className={styles.formGroup}>
                <label>{tp('sellerVehicleEdit.vin')} *</label>
                <input type="text" name="vinNumber" required value={formData.vinNumber} onChange={handleChange} />
              </div>
              <div className={styles.formGroup}>
                <label>{tp('sellerVehicleEdit.category')} *</label>
                <select name="categoryId" value={formData.categoryId} onChange={handleChange} required>
                  <option value="">{tp('sellerVehicleEdit.selectCategory')}</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <h2>{tp('sellerVehicleEdit.specAndPrice')}</h2>
            <div className={styles.grid}>
              <div className={styles.formGroup}>
                <label>{tp('sellerVehicleEdit.mileage')} *</label>
                <input type="number" name="mileage" required value={formData.mileage} onChange={handleChange} min={0} />
              </div>
              <div className={styles.formGroup}>
                <label>{tp('sellerVehicleEdit.transmission')} *</label>
                <select name="transmission" value={formData.transmission} onChange={handleChange} required>
                  <option value="Automatic">{tp('sellerVehicleEdit.transmissionAutomatic')}</option>
                  <option value="Manual">{tp('sellerVehicleEdit.transmissionManual')}</option>
                  <option value="CVT">{tp('sellerVehicleEdit.transmissionCvt')}</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>{tp('sellerVehicleEdit.fuelType')} *</label>
                <select name="fuelType" value={formData.fuelType} onChange={handleChange} required>
                  <option value="Gasoline">{tp('sellerVehicleEdit.fuelGasoline')}</option>
                  <option value="Diesel">{tp('sellerVehicleEdit.fuelDiesel')}</option>
                  <option value="Electric">{tp('sellerVehicleEdit.fuelElectric')}</option>
                  <option value="Hybrid">{tp('sellerVehicleEdit.fuelHybrid')}</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>{tp('sellerVehicleEdit.basePrice')} *</label>
                <input type="number" name="basePrice" required value={formData.basePrice || ''} onChange={handleChange} min={1000000} />
              </div>
              <div className={styles.formGroup}>
                <label>{tp('sellerVehicleEdit.description')}</label>
                <input type="text" name="description" value={formData.description || ''} onChange={handleChange} />
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <h2>{tp('sellerVehicleEdit.images')}</h2>
            <div className={styles.formGroup}>
              <label>{tp('sellerVehicleEdit.uploadNewImages')}</label>
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
              <Button type="button" variant="outline">{tp('sellerVehicleEdit.cancel')}</Button>
            </Link>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? tp('sellerVehicleEdit.saving') : tp('sellerVehicleEdit.saveChanges')}
            </Button>
          </div>
        </form>

        <aside className={styles.summaryCard}>
          <h3>{tp('sellerVehicleEdit.summaryTitle')}</h3>
          <div className={styles.summaryItem}>
            <span>{tp('sellerVehicleEdit.vehicle')}</span>
            <strong>{formData.brand && formData.model ? `${formData.brand} ${formData.model}` : tp('sellerVehicleEdit.notUpdated')}</strong>
          </div>
          <div className={styles.summaryItem}>
            <span>{tp('sellerVehicleEdit.year')}</span>
            <strong>{formData.year || tp('sellerVehicleEdit.notAvailable')}</strong>
          </div>
          <div className={styles.summaryItem}>
            <span>{tp('sellerVehicleEdit.category')}</span>
            <strong>{selectedCategory?.name || tp('sellerVehicleEdit.notSelected')}</strong>
          </div>
          <div className={styles.summaryItem}>
            <span>{tp('sellerVehicleEdit.basePrice')}</span>
            <strong>{formData.basePrice ? `${formData.basePrice.toLocaleString('vi-VN')} VND` : tp('sellerVehicleEdit.notUpdated')}</strong>
          </div>
        </aside>
      </div>
    </div>
  );
};
