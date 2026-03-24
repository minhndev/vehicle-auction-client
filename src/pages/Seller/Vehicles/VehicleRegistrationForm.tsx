import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { catalogApi } from '../../../api/catalogApi';
import { Button } from '../../../components/ui/Button/Button';
import { sellerApi, type ProductRequest } from '../../../features/seller/api/sellerApi';
import { usePageI18n } from '../../../i18n/usePageI18n';
import type { CategoryResponse } from '../../../types/index';
import type { RootState } from '../../../store';
import styles from './VehicleRegistrationForm.module.css';

export const VehicleRegistrationForm: React.FC = () => {
  const { tp } = usePageI18n();
  const navigate = useNavigate();
  const authUser = useSelector((state: RootState) => state.auth.user);
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

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
    images: []
  });

  const isValidUuid = (value: string) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value.trim());

  const isValidVin = (value: string) =>
    /^[A-HJ-NPR-Z0-9]{17}$/i.test(value.trim());

  const getValidationErrorMessage = (err: any): string => {
    const data = err?.response?.data;

    if (data && typeof data === 'object') {
      const errors = (data as Record<string, unknown>).errors;
      if (errors && typeof errors === 'object' && !Array.isArray(errors)) {
        const entries = Object.entries(errors as Record<string, unknown>);
        if (entries.length > 0) {
          const [field, message] = entries[0];
          return tp('sellerVehicleRegistration.validationFieldError', { field, message: String(message) });
        }
      }

      const listErrors = (data as Record<string, unknown>).errorDetails;
      if (Array.isArray(listErrors) && listErrors.length > 0) {
        return String(listErrors[0]);
      }

      const msg = (data as Record<string, unknown>).message;
      if (typeof msg === 'string' && msg.trim().length > 0) {
        return msg;
      }
    }

    return err?.message || tp('sellerVehicleRegistration.registerError');
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response: any = await catalogApi.getCategories();
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
      [name]: (name === 'year' || name === 'mileage' || name === 'basePrice') 
        ? Number(value) : value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files).slice(0, 6);
      setImageFiles(files);
      setImagePreviews(files.map((file) => URL.createObjectURL(file)));
    }
  };

  const removeImageAt = (indexToRemove: number) => {
    setImageFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
    setImagePreviews((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const categoryId = String(formData.categoryId || '').trim();
    if (!categoryId) {
      setError(tp('sellerVehicleRegistration.categoryRequired'));
      return;
    }

    if (!isValidUuid(categoryId)) {
      setError(tp('sellerVehicleRegistration.categoryInvalid'));
      return;
    }

    const vin = formData.vinNumber.trim().toUpperCase();
        if (!formData.color.trim()) {
          setError(tp('sellerVehicleRegistration.colorRequired'));
          return;
        }

        if (!formData.engineNumber.trim()) {
          setError(tp('sellerVehicleRegistration.engineNumberRequired'));
          return;
        }

        if (!formData.licensePlate.trim()) {
          setError(tp('sellerVehicleRegistration.licensePlateRequired'));
          return;
        }

        if (!formData.transmission.trim() || !formData.fuelType.trim()) {
          setError(tp('sellerVehicleRegistration.transmissionFuelRequired'));
          return;
        }

    if (!isValidVin(vin)) {
      setError(tp('sellerVehicleRegistration.vinInvalid'));
      return;
    }

    if (!Number.isFinite(formData.basePrice) || formData.basePrice < 1000000) {
      setError(tp('sellerVehicleRegistration.basePriceInvalid'));
      return;
    }

    if (!Number.isFinite(formData.mileage) || formData.mileage < 0) {
      setError(tp('sellerVehicleRegistration.mileageInvalid'));
      return;
    }

    if (imageFiles.length === 0) {
      setError(tp('sellerVehicleRegistration.imageRequired'));
      return;
    }

    const role = String(authUser?.role || '').toUpperCase();
    if (role && role !== 'SELLER' && role !== 'ADMIN') {
      setError(tp('sellerVehicleRegistration.permissionError'));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const uploadedImageUrls: string[] = [];
      if (imageFiles.length > 0) {
        for (const file of imageFiles) {
          const url = await sellerApi.uploadImage(file);
          if (url) {
            uploadedImageUrls.push(url);
          }
        }
      }

      if (uploadedImageUrls.length === 0) {
        setError(tp('sellerVehicleRegistration.uploadFailed'));
        return;
      }

      await sellerApi.registerVehicle({
        ...formData,
        categoryId,
        vinNumber: vin,
        images: uploadedImageUrls
      });

      alert(tp('sellerVehicleRegistration.registerSuccess'));
      navigate('/seller/products');
      
    } catch (err: any) {
      setError(getValidationErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const goToStepTwo = () => {
    if (
      !formData.brand ||
      !formData.model ||
      !formData.color ||
      !formData.engineNumber ||
      !formData.licensePlate ||
      !formData.vinNumber ||
      !formData.categoryId ||
      !formData.year
    ) {
      setError(tp('sellerVehicleRegistration.stepOneRequired'));
      return;
    }

    setError(null);
    setStep(2);
  };

  const selectedCategory = categories.find((category) => String(category.id) === String(formData.categoryId));

  const recentSales = [
    { model: 'BMW X5 2020', soldTime: 'Bán trong 4 ngày', price: '1.48 tỷ VND', trend: '+12%' },
    { model: 'Mercedes C300 2019', soldTime: 'Bán trong 5 ngày', price: '1.27 tỷ VND', trend: '+9%' },
    { model: 'Ford Everest 2021', soldTime: 'Bán trong 3 ngày', price: '1.08 tỷ VND', trend: '+15%' },
  ];

  const howItWorksItems = [
    {
      title: tp('sellerVehicle.step1Title'),
      desc: tp('sellerVehicle.step1Description'),
    },
    {
      title: tp('sellerVehicle.step2Title'),
      desc: tp('sellerVehicle.step2Description'),
    },
    {
      title: tp('sellerVehicle.step3Title'),
      desc: tp('sellerVehicle.step3Description'),
    },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.heroBlock}>
        <p className={styles.eyebrow}>{tp('sellerVehicleRegistration.eyebrow')}</p>
        <h1 className={styles.title}>{tp('sellerVehicleRegistration.title')}</h1>
        <p className={styles.subtitle}>{tp('sellerVehicleRegistration.subtitle')}</p>
      </div>

      <div className={styles.stepper}>
        <div className={`${styles.stepItem} ${step === 1 ? styles.stepActive : ''}`}>
          <span>01</span>
          <p>{tp('sellerVehicleRegistration.stepOne')}</p>
        </div>
        <div className={`${styles.stepItem} ${step === 2 ? styles.stepActive : ''}`}>
          <span>02</span>
          <p>{tp('sellerVehicleRegistration.stepTwo')}</p>
        </div>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.layout}>
        <form className={styles.form} onSubmit={handleSubmit}>
          {step === 1 && (
            <>
              <div className={styles.section}>
                <h2>{tp('sellerVehicleRegistration.basicInfo')}</h2>
                <div className={styles.grid}>
                  <div className={styles.formGroup}>
                    <label>{tp('sellerVehicleRegistration.brand')} *</label>
                    <input type="text" name="brand" required value={formData.brand} onChange={handleChange} placeholder={tp('sellerVehicleRegistration.brandPlaceholder')} />
                  </div>
                  <div className={styles.formGroup}>
                    <label>{tp('sellerVehicleRegistration.model')} *</label>
                    <input type="text" name="model" required value={formData.model} onChange={handleChange} placeholder={tp('sellerVehicleRegistration.modelPlaceholder')} />
                  </div>
                  <div className={styles.formGroup}>
                    <label>{tp('sellerVehicleRegistration.color')} *</label>
                    <input type="text" name="color" required value={formData.color} onChange={handleChange} placeholder={tp('sellerVehicleRegistration.colorPlaceholder')} />
                  </div>
                  <div className={styles.formGroup}>
                    <label>{tp('sellerVehicleRegistration.engineNumber')} *</label>
                    <input type="text" name="engineNumber" required value={formData.engineNumber} onChange={handleChange} placeholder={tp('sellerVehicleRegistration.engineNumberPlaceholder')} />
                  </div>
                  <div className={styles.formGroup}>
                    <label>{tp('sellerVehicleRegistration.licensePlate')} *</label>
                    <input type="text" name="licensePlate" required value={formData.licensePlate} onChange={handleChange} placeholder={tp('sellerVehicleRegistration.licensePlatePlaceholder')} />
                  </div>
                  <div className={styles.formGroup}>
                    <label>{tp('sellerVehicleRegistration.year')} *</label>
                    <input type="number" name="year" required value={formData.year} onChange={handleChange} min={1900} max={new Date().getFullYear() + 1} />
                  </div>
                  <div className={styles.formGroup}>
                    <label>{tp('sellerVehicleRegistration.vin')} *</label>
                    <input type="text" name="vinNumber" required value={formData.vinNumber} onChange={handleChange} placeholder={tp('sellerVehicleRegistration.vinPlaceholder')} />
                  </div>
                  <div className={styles.formGroup}>
                    <label>{tp('sellerVehicleRegistration.category')} *</label>
                    <select name="categoryId" value={formData.categoryId} onChange={handleChange} required>
                      <option value="">{tp('sellerVehicleRegistration.selectCategory')}</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className={styles.actions}>
                <Button type="button" variant="outline" onClick={() => navigate('/seller/dashboard')}>{tp('sellerVehicleRegistration.cancel')}</Button>
                <Button type="button" variant="primary" onClick={goToStepTwo}>{tp('sellerVehicleRegistration.continue')}</Button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className={styles.section}>
                <h2>{tp('sellerVehicleRegistration.specAndPrice')}</h2>
                <div className={styles.grid}>
                  <div className={styles.formGroup}>
                    <label>{tp('sellerVehicleRegistration.mileage')} *</label>
                    <input type="number" name="mileage" required value={formData.mileage} onChange={handleChange} min={0} />
                  </div>
                  <div className={styles.formGroup}>
                    <label>{tp('sellerVehicleRegistration.transmission')} *</label>
                    <select name="transmission" value={formData.transmission} onChange={handleChange} required>
                      <option value="Automatic">{tp('sellerVehicleRegistration.transmissionAutomatic')}</option>
                      <option value="Manual">{tp('sellerVehicleRegistration.transmissionManual')}</option>
                      <option value="CVT">{tp('sellerVehicleRegistration.transmissionCvt')}</option>
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label>{tp('sellerVehicleRegistration.fuelType')} *</label>
                    <select name="fuelType" value={formData.fuelType} onChange={handleChange} required>
                      <option value="Gasoline">{tp('sellerVehicleRegistration.fuelGasoline')}</option>
                      <option value="Diesel">{tp('sellerVehicleRegistration.fuelDiesel')}</option>
                      <option value="Electric">{tp('sellerVehicleRegistration.fuelElectric')}</option>
                      <option value="Hybrid">{tp('sellerVehicleRegistration.fuelHybrid')}</option>
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label>{tp('sellerVehicleRegistration.basePrice')} *</label>
                    <input type="number" name="basePrice" required value={formData.basePrice || ''} onChange={handleChange} min={1000000} />
                  </div>
                  <div className={styles.formGroup}>
                    <label>{tp('sellerVehicleRegistration.description')}</label>
                    <input type="text" name="description" value={formData.description || ''} onChange={handleChange} placeholder={tp('sellerVehicleRegistration.descriptionPlaceholder')} />
                  </div>
                </div>
              </div>

              <div className={styles.section}>
                <h2>{tp('sellerVehicleRegistration.photos')}</h2>
                <div className={styles.formGroup}>
                  <label>{tp('sellerVehicleRegistration.uploadPhotos')} *</label>
                  <input type="file" accept="image/*" onChange={handleImageChange} multiple required={imageFiles.length === 0} />
                </div>

                {imagePreviews.length > 0 && (
                  <div className={styles.photoGrid}>
                    {imagePreviews.map((preview, index) => (
                      <div key={`${preview}-${index}`} className={styles.photoCard}>
                        <img src={preview} alt={`Vehicle ${index + 1}`} className={styles.imagePreview} />
                        <button
                          type="button"
                          className={styles.removePhotoBtn}
                          onClick={() => removeImageAt(index)}
                        >
                          {tp('sellerVehicleRegistration.removePhoto')}
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {imagePreviews.length === 0 && (
                  <div className={styles.uploadHint}>{tp('sellerVehicleRegistration.uploadHint')}</div>
                )}
              </div>

              <div className={styles.section}>
                <h2>{tp('sellerVehicleRegistration.recentSales')}</h2>
                <div className={styles.recentSalesGrid}>
                  {recentSales.map((sale) => (
                    <article key={sale.model} className={styles.saleCard}>
                      <div className={styles.saleMetaRow}>
                        <strong>{sale.model}</strong>
                        <span className={styles.saleBadge}>{sale.trend}</span>
                      </div>
                      <span>{sale.soldTime}</span>
                      <p>{sale.price}</p>
                    </article>
                  ))}
                </div>
              </div>

              <div className={styles.actions}>
                <Button type="button" variant="outline" onClick={() => setStep(1)}>{tp('sellerVehicleRegistration.back')}</Button>
                <Button type="submit" variant="primary" disabled={loading}>
                  {loading ? tp('sellerVehicleRegistration.submitting') : tp('sellerVehicleRegistration.confirmRegister')}
                </Button>
              </div>
            </>
          )}
        </form>

        <aside className={styles.summaryCard}>
          <h3>{tp('sellerVehicleRegistration.summaryTitle')}</h3>
          <div className={styles.summaryItem}>
            <span>{tp('sellerVehicleRegistration.vehicle')}</span>
            <strong>{formData.brand && formData.model ? `${formData.brand} ${formData.model}` : tp('sellerVehicleRegistration.notUpdated')}</strong>
          </div>
          <div className={styles.summaryItem}>
            <span>{tp('sellerVehicleRegistration.year')}</span>
            <strong>{formData.year || tp('sellerVehicleRegistration.notAvailable')}</strong>
          </div>
          <div className={styles.summaryItem}>
            <span>{tp('sellerVehicleRegistration.category')}</span>
            <strong>{selectedCategory?.name || tp('sellerVehicleRegistration.notSelected')}</strong>
          </div>
          <div className={styles.summaryItem}>
            <span>{tp('sellerVehicleRegistration.basePrice')}</span>
            <strong>{formData.basePrice ? `${formData.basePrice.toLocaleString('vi-VN')} VND` : tp('sellerVehicleRegistration.notUpdated')}</strong>
          </div>
        </aside>
      </div>

      <section className={styles.howItWorksSection}>
        <h2>{tp('sellerVehicle.howItWorksTitle')}</h2>
        <p className={styles.howLead}>{tp('sellerVehicle.howItWorksDescription')}</p>
        <div className={styles.howGrid}>
          {howItWorksItems.map((item, index) => (
            <article key={item.title} className={styles.howCard}>
              <span>{`0${index + 1}`}</span>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};
