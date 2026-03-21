import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button/Button';
import { sellerApi, type ProductRequest } from '../../../features/seller/api/sellerApi';
import axiosClient from '../../../api/axiosClient';
import type { CategoryResponse } from '../../../types/index';
import styles from './VehicleRegistrationForm.module.css';

export const VehicleRegistrationForm: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

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
    
    if (!formData.categoryId) {
      setError('Vui lòng chọn danh mục xe');
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

      await sellerApi.registerVehicle({
        ...formData,
        categoryId: Number(formData.categoryId), // Convert categoryId to number for payload
        images: uploadedImageUrls
      });

      alert('Đăng ký xe thành công! Chờ Admin duyệt.');
      navigate('/seller/auctions');
      
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Lỗi đăng ký xe');
    } finally {
      setLoading(false);
    }
  };

  const goToStepTwo = () => {
    if (!formData.brand || !formData.model || !formData.vinNumber || !formData.categoryId || !formData.year) {
      setError('Vui long nhap day du thong tin bat buoc truoc khi tiep tuc');
      return;
    }

    setError(null);
    setStep(2);
  };

  const selectedCategory = categories.find((category) => String(category.id) === String(formData.categoryId));

  const recentSales = [
    { model: 'BMW X5 2020', soldTime: 'Sold in 4 days', price: '1.48B VND', trend: '+12%' },
    { model: 'Mercedes C300 2019', soldTime: 'Sold in 5 days', price: '1.27B VND', trend: '+9%' },
    { model: 'Ford Everest 2021', soldTime: 'Sold in 3 days', price: '1.08B VND', trend: '+15%' },
  ];

  const howItWorksItems = [
    {
      title: 'Create listing',
      desc: 'Nhap thong tin xe va bo anh de doi ngu kiem duyet.',
    },
    {
      title: 'Admin verification',
      desc: 'Ho so duoc xac minh nhanh de dua len san dau gia.',
    },
    {
      title: 'Receive bids',
      desc: 'Theo doi gia theo thoi gian thuc va chot giao dich an toan.',
    },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.heroBlock}>
        <p className={styles.eyebrow}>Sell Your Car</p>
        <h1 className={styles.title}>Dang ky xe dau gia trong 2 buoc</h1>
        <p className={styles.subtitle}>Hoan tat thong tin co ban, thong so va gia de Admin kiem duyet nhanh hon.</p>
      </div>

      <div className={styles.stepper}>
        <div className={`${styles.stepItem} ${step === 1 ? styles.stepActive : ''}`}>
          <span>01</span>
          <p>Thong tin xe</p>
        </div>
        <div className={`${styles.stepItem} ${step === 2 ? styles.stepActive : ''}`}>
          <span>02</span>
          <p>Gia va hinh anh</p>
        </div>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.layout}>
        <form className={styles.form} onSubmit={handleSubmit}>
          {step === 1 && (
            <>
              <div className={styles.section}>
                <h2>Thong tin co ban</h2>
                <div className={styles.grid}>
                  <div className={styles.formGroup}>
                    <label>Hang xe *</label>
                    <input type="text" name="brand" required value={formData.brand} onChange={handleChange} placeholder="VD: Toyota" />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Mau xe (Model) *</label>
                    <input type="text" name="model" required value={formData.model} onChange={handleChange} placeholder="VD: Camry" />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Nam san xuat *</label>
                    <input type="number" name="year" required value={formData.year} onChange={handleChange} min={1900} max={new Date().getFullYear() + 1} />
                  </div>
                  <div className={styles.formGroup}>
                    <label>So Khung (VIN) *</label>
                    <input type="text" name="vinNumber" required value={formData.vinNumber} onChange={handleChange} placeholder="17 ky tu VIN" />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Danh muc (Category) *</label>
                    <select name="categoryId" value={formData.categoryId} onChange={handleChange} required>
                      <option value="">-- Chon Danh Muc --</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className={styles.actions}>
                <Button type="button" variant="outline" onClick={() => navigate('/seller/dashboard')}>Huy bo</Button>
                <Button type="button" variant="primary" onClick={goToStepTwo}>Tiep tuc</Button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className={styles.section}>
                <h2>Thong so ky thuat va gia</h2>
                <div className={styles.grid}>
                  <div className={styles.formGroup}>
                    <label>So ODO (mileage) *</label>
                    <input type="number" name="mileage" required value={formData.mileage} onChange={handleChange} min={0} />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Hop so *</label>
                    <select name="transmission" value={formData.transmission} onChange={handleChange} required>
                      <option value="Automatic">Tu dong (Automatic)</option>
                      <option value="Manual">So san (Manual)</option>
                      <option value="CVT">Vo cap (CVT)</option>
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Nhien lieu *</label>
                    <select name="fuelType" value={formData.fuelType} onChange={handleChange} required>
                      <option value="Gasoline">Xang (Gasoline)</option>
                      <option value="Diesel">Dau (Diesel)</option>
                      <option value="Electric">Dien (Electric)</option>
                      <option value="Hybrid">Lai (Hybrid)</option>
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Gia khoi diem de xuat (VND) *</label>
                    <input type="number" name="basePrice" required value={formData.basePrice || ''} onChange={handleChange} min={1000000} />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Buoc gia toi thieu (VND) *</label>
                    <input type="number" name="stepPrice" required value={formData.stepPrice || ''} onChange={handleChange} min={100000} />
                  </div>
                </div>
              </div>

              <div className={styles.section}>
                <h2>Add Photos</h2>
                <div className={styles.formGroup}>
                  <label>Tai len toi da 6 anh xe *</label>
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
                          Xoa
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {imagePreviews.length === 0 && (
                  <div className={styles.uploadHint}>If modified: ban co the xoa anh va tai lai de sap xep bo anh truoc khi gui.</div>
                )}
              </div>

              <div className={styles.section}>
                <h2>Recent Sales</h2>
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
                <Button type="button" variant="outline" onClick={() => setStep(1)}>Quay lai</Button>
                <Button type="submit" variant="primary" disabled={loading}>
                  {loading ? 'Dang gui...' : 'Xac nhan Dang ky'}
                </Button>
              </div>
            </>
          )}
        </form>

        <aside className={styles.summaryCard}>
          <h3>Tong quan ho so</h3>
          <div className={styles.summaryItem}>
            <span>Xe</span>
            <strong>{formData.brand && formData.model ? `${formData.brand} ${formData.model}` : 'Chua cap nhat'}</strong>
          </div>
          <div className={styles.summaryItem}>
            <span>Nam san xuat</span>
            <strong>{formData.year || 'N/A'}</strong>
          </div>
          <div className={styles.summaryItem}>
            <span>Danh muc</span>
            <strong>{selectedCategory?.name || 'Chua chon'}</strong>
          </div>
          <div className={styles.summaryItem}>
            <span>Gia khoi diem</span>
            <strong>{formData.basePrice ? `${formData.basePrice.toLocaleString('vi-VN')} VND` : 'Chua cap nhat'}</strong>
          </div>
          <div className={styles.summaryItem}>
            <span>Buoc gia</span>
            <strong>{formData.stepPrice ? `${formData.stepPrice.toLocaleString('vi-VN')} VND` : 'Chua cap nhat'}</strong>
          </div>
        </aside>
      </div>

      <section className={styles.howItWorksSection}>
        <h2>How it works!</h2>
        <p className={styles.howLead}>Learn more about how selling works on Car Deposit.</p>
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
