import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button/Button';
import { sellerApi, type ProductRequest } from '../../../features/seller/api/sellerApi';
import styles from './VehicleRegistrationForm.module.css';

export const VehicleRegistrationForm: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [formData, setFormData] = useState<ProductRequest>({
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    type: 'SUV',
    mileage: 0,
    transmission: 'Automatic',
    fuelType: 'Gasoline',
    description: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'year' || name === 'mileage' ? Number(value) : value
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
    setLoading(true);
    setError(null);

    try {
      let imageUrl = '';
      if (imageFile) {
        imageUrl = await sellerApi.uploadImage(imageFile);
      }

      const payload = {
        ...formData,
        ...(imageUrl ? { image: imageUrl } : {})
      };

      await sellerApi.registerVehicle(payload);
      // alert('Vehicle registered successfully! Awaiting admin approval.');
      navigate('/seller/dashboard');
      
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to register vehicle');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Register New Vehicle</h1>
      <p className={styles.subtitle}>Enter the details of the vehicle you want to put up for auction. All vehicles require admin approval before going live.</p>

      {error && <div className={styles.error}>{error}</div>}

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.section}>
          <h2>Basic Information</h2>
          <div className={styles.grid}>
            <div className={styles.formGroup}>
              <label>Brand *</label>
              <input type="text" name="brand" required value={formData.brand} onChange={handleChange} placeholder="e.g. Toyota" />
            </div>
            <div className={styles.formGroup}>
              <label>Model *</label>
              <input type="text" name="model" required value={formData.model} onChange={handleChange} placeholder="e.g. Camry" />
            </div>
            <div className={styles.formGroup}>
              <label>Year *</label>
              <input type="number" name="year" required value={formData.year} onChange={handleChange} min={1900} max={new Date().getFullYear() + 1} />
            </div>
            <div className={styles.formGroup}>
              <label>Vehicle Type *</label>
              <select name="type" value={formData.type} onChange={handleChange} required>
                <option value="SUV">SUV</option>
                <option value="Sedan">Sedan</option>
                <option value="Truck">Truck</option>
                <option value="Hatchback">Hatchback</option>
                <option value="Coupe">Coupe</option>
                <option value="Luxury">Luxury</option>
                <option value="Electric">Electric</option>
              </select>
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <h2>Technical Specifications</h2>
          <div className={styles.grid}>
            <div className={styles.formGroup}>
              <label>Mileage (miles) *</label>
              <input type="number" name="mileage" required value={formData.mileage} onChange={handleChange} min={0} />
            </div>
            <div className={styles.formGroup}>
              <label>Transmission *</label>
              <select name="transmission" value={formData.transmission} onChange={handleChange} required>
                <option value="Automatic">Automatic</option>
                <option value="Manual">Manual</option>
                <option value="CVT">CVT</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>Fuel Type *</label>
              <select name="fuelType" value={formData.fuelType} onChange={handleChange} required>
                <option value="Gasoline">Gasoline</option>
                <option value="Diesel">Diesel</option>
                <option value="Electric">Electric</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <h2>Media & Description</h2>
          <div className={styles.formGroup}>
            <label>Vehicle Image *</label>
            <input type="file" accept="image/*" onChange={handleImageChange} required />
            {imagePreview && (
              <img src={imagePreview} alt="Preview" className={styles.imagePreview} />
            )}
          </div>
          <div className={styles.formGroup}>
            <label>Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows={4} placeholder="Condition, features, history..."></textarea>
          </div>
        </div>

        <div className={styles.actions}>
          <Button type="button" variant="outline" onClick={() => navigate('/seller/dashboard')}>Cancel</Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? 'Submitting...' : 'Register Vehicle'}
          </Button>
        </div>
      </form>
    </div>
  );
};
