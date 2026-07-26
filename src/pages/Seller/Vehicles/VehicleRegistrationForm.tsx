import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { catalogApi } from '../../../api/catalogApi';
import { sellerApi, type ProductRequest } from '../../../features/seller/api/sellerApi';
import { usePageI18n } from '../../../i18n/usePageI18n';
import type { CategoryResponse } from '../../../types/index';
import type { RootState } from '../../../store';
import { Car, Settings, ImageIcon, CheckCircle2, ChevronRight, ChevronLeft, UploadCloud, X, AlertCircle } from 'lucide-react';
import { CurrencyInput } from '../../../components/ui/CurrencyInput/CurrencyInput';

export const VehicleRegistrationForm: React.FC = () => {
  const { tp } = usePageI18n();
  const navigate = useNavigate();
  const authUser = useSelector((state: RootState) => state.auth.user);
  
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

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
    transmission: 'Số sàn (Manual)',
    fuelType: 'Xăng (Gasoline)',
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
      if (Array.isArray(listErrors) && listErrors.length > 0) return String(listErrors[0]);
      const msg = (data as Record<string, unknown>).message;
      if (typeof msg === 'string' && msg.trim().length > 0) return msg;
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: (name === 'year' || name === 'mileage' || name === 'basePrice') 
        ? Number(value) : value
    }));
  };

  const processFiles = (files: FileList | File[]) => {
    const validFiles = Array.from(files).filter(file => file.type.startsWith('image/')).slice(0, 8);
    if (validFiles.length > 0) {
      setImageFiles(prev => [...prev, ...validFiles].slice(0, 8));
      setImagePreviews(prev => {
        const newPreviews = validFiles.map(f => URL.createObjectURL(f));
        return [...prev, ...newPreviews].slice(0, 8);
      });
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) processFiles(e.target.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files) processFiles(e.dataTransfer.files);
  };

  const removeImageAt = (indexToRemove: number) => {
    setImageFiles(prev => prev.filter((_, index) => index !== indexToRemove));
    setImagePreviews(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const goToStepTwo = () => {
    if (!formData.brand.trim() || !formData.model.trim() || !formData.vinNumber.trim() || !formData.categoryId || !formData.year) {
      setError(tp('sellerVehicleRegistration.stepOneRequired') || 'Vui lòng điền đủ Hãng, Dòng xe, số VIN, Năm và Loại xe.');
      return;
    }
    if (!isValidVin(formData.vinNumber)) {
      setError(tp('sellerVehicleRegistration.vinInvalid') || 'Số VIN không hợp lệ (cần 17 ký tự).');
      return;
    }
    setError(null);
    setStep(2);
  };

  const goToStepThree = () => {
    if (!formData.color.trim() || !formData.engineNumber.trim() || !formData.licensePlate.trim() || formData.mileage < 0) {
      setError(tp('sellerVehicleRegistration.stepTwoRequired') || 'Vui lòng điền đủ Màu sắc, Số máy, Biển số và Số km.');
      return;
    }
    setError(null);
    setStep(3);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!Number.isFinite(formData.basePrice) || formData.basePrice < 1000000) {
      setError(tp('sellerVehicleRegistration.basePriceInvalid') || 'Giá sàn phải từ 1.000.000 VNĐ.');
      return;
    }

    if (imageFiles.length === 0) {
      setError(tp('sellerVehicleRegistration.imageRequired') || 'Cần ít nhất 1 hình ảnh xe.');
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
      for (const file of imageFiles) {
        const url = await sellerApi.uploadImage(file);
        if (url) uploadedImageUrls.push(url);
      }

      if (uploadedImageUrls.length === 0) {
        setError(tp('sellerVehicleRegistration.uploadFailed'));
        setLoading(false);
        return;
      }

      await sellerApi.registerVehicle({
        ...formData,
        vinNumber: formData.vinNumber.trim().toUpperCase(),
        images: uploadedImageUrls
      });

      alert(tp('sellerVehicleRegistration.registerSuccess') || 'Đăng ký xe thành công!');
      navigate('/seller/products');
      
    } catch (err: any) {
      setError(getValidationErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { num: 1, title: 'Cơ Bản', icon: Car },
    { num: 2, title: 'Thông Số', icon: Settings },
    { num: 3, title: 'Giá & Ảnh', icon: ImageIcon },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-[#2e3d83] mb-3">Đăng Ký Tài Sản Mới</h1>
        <p className="text-slate-500 max-w-2xl mx-auto">Vui lòng cung cấp đầy đủ thông tin phương tiện để hệ thống duyệt trước khi có thể đưa lên sàn đấu giá công khai. Hình ảnh rõ nét sẽ giúp tăng tương tác.</p>
      </div>

      {/* Modern Stepper */}
      <div className="flex items-center justify-center mb-12 relative z-10">
        {steps.map((s, idx) => {
          const isActive = step === s.num;
          const isPassed = step > s.num;
          const StepIcon = s.icon;
          return (
            <React.Fragment key={s.num}>
              <div className="flex flex-col items-center relative z-10 w-24">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center border-4 transition-all duration-300 shadow-md ${
                  isActive ? 'bg-[#2e3d83] border-[#2e3d83]/20 shadow-[#2e3d83]/30 text-white scale-110' : 
                  isPassed ? 'bg-[#f4c23d] border-[#f4c23d]/20 text-slate-900' : 
                  'bg-white border-slate-200 text-slate-400'
                }`}>
                  {isPassed ? <CheckCircle2 size={24} /> : <StepIcon size={24} />}
                </div>
                <span className={`mt-3 text-sm font-bold tracking-wide transition-colors ${
                  isActive ? 'text-[#2e3d83]' : isPassed ? 'text-slate-700' : 'text-slate-400'
                }`}>Bước {s.num}</span>
                <span className={`text-xs ${isActive ? 'text-slate-500' : 'text-slate-400/70'}`}>{s.title}</span>
              </div>
              {idx < steps.length - 1 && (
                <div className={`flex-1 h-1.5 mx-2 rounded-full transition-all duration-300 ${
                  step > s.num ? 'bg-[#f4c23d]' : 'bg-slate-200'
                }`} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {error && (
        <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-600 shadow-sm animate-pulse-once">
          <AlertCircle size={20} className="shrink-0" />
          <p className="font-semibold text-sm">{error}</p>
        </div>
      )}

      {/* Main Form Card */}
      <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden relative">
        <form onSubmit={step === 3 ? handleSubmit : (e) => e.preventDefault()}>
          
          {/* STEP 1 */}
          {step === 1 && (
            <div className="p-8 md:p-12 animate-in fade-in slide-in-from-right-8 duration-500 fill-mode-forwards">
              <h2 className="text-2xl font-extrabold text-[#2e3d83] mb-8 flex items-center gap-3"><Car className="text-[#f4c23d]" /> Thông Tin Cơ Bản</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 uppercase tracking-wide">Hãng xe (Brand) <span className="text-red-500">*</span></label>
                  <input type="text" name="brand" value={formData.brand} onChange={handleChange} required placeholder="VD: Toyota" 
                    className="w-full px-5 py-4 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:border-[#2e3d83] focus:ring-4 focus:ring-[#2e3d83]/10 outline-none transition-all font-medium" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 uppercase tracking-wide">Dòng xe (Model) <span className="text-red-500">*</span></label>
                  <input type="text" name="model" value={formData.model} onChange={handleChange} required placeholder="VD: Camry 2.0Q" 
                    className="w-full px-5 py-4 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:border-[#2e3d83] focus:ring-4 focus:ring-[#2e3d83]/10 outline-none transition-all font-medium" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 uppercase tracking-wide">Số khung (VIN) <span className="text-red-500">*</span></label>
                  <input type="text" name="vinNumber" value={formData.vinNumber} onChange={handleChange} required placeholder="Nhập đúng 17 ký tự VIN" maxLength={17}
                    className="w-full px-5 py-4 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:border-[#2e3d83] focus:ring-4 focus:ring-[#2e3d83]/10 outline-none transition-all font-mono uppercase" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 uppercase tracking-wide">Năm sản xuất <span className="text-red-500">*</span></label>
                  <input type="number" name="year" value={formData.year} onChange={handleChange} required min={1900} max={new Date().getFullYear() + 1}
                     className="w-full px-5 py-4 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:border-[#2e3d83] focus:ring-4 focus:ring-[#2e3d83]/10 outline-none transition-all font-medium" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-bold text-slate-700 uppercase tracking-wide">Phân khúc / Loại xe <span className="text-red-500">*</span></label>
                  <select name="categoryId" value={formData.categoryId} onChange={handleChange} required
                    className="w-full px-5 py-4 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:border-[#2e3d83] focus:ring-4 focus:ring-[#2e3d83]/10 outline-none transition-all font-medium appearance-none">
                    <option value="">-- Chọn danh mục xe --</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="p-8 md:p-12 animate-in fade-in slide-in-from-right-8 duration-500 fill-mode-forwards">
              <h2 className="text-2xl font-extrabold text-[#2e3d83] mb-8 flex items-center gap-3"><Settings className="text-[#f4c23d]" /> Cấu hình & Kỹ thuật</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 uppercase tracking-wide">Màu sắc <span className="text-red-500">*</span></label>
                  <input type="text" name="color" value={formData.color} onChange={handleChange} required placeholder="Đen, Trắng, Đỏ..." 
                    className="w-full px-5 py-4 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:border-[#2e3d83] focus:ring-4 focus:ring-[#2e3d83]/10 outline-none transition-all font-medium" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 uppercase tracking-wide">Biển kiểm soát <span className="text-red-500">*</span></label>
                  <input type="text" name="licensePlate" value={formData.licensePlate} onChange={handleChange} required placeholder="VD: 30A-123.45" 
                    className="w-full px-5 py-4 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:border-[#2e3d83] focus:ring-4 focus:ring-[#2e3d83]/10 outline-none transition-all font-medium" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 uppercase tracking-wide">Số Máy (Engine No) <span className="text-red-500">*</span></label>
                  <input type="text" name="engineNumber" value={formData.engineNumber} onChange={handleChange} required placeholder="Nhập số máy" 
                    className="w-full px-5 py-4 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:border-[#2e3d83] focus:ring-4 focus:ring-[#2e3d83]/10 outline-none transition-all font-medium" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 uppercase tracking-wide">Số KM đã đi <span className="text-red-500">*</span></label>
                  <input type="number" name="mileage" value={formData.mileage} onChange={handleChange} required min={0}
                    className="w-full px-5 py-4 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:border-[#2e3d83] focus:ring-4 focus:ring-[#2e3d83]/10 outline-none transition-all font-medium" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 uppercase tracking-wide">Hộp số <span className="text-red-500">*</span></label>
                  <select name="transmission" value={formData.transmission} onChange={handleChange} required
                    className="w-full px-5 py-4 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:border-[#2e3d83] focus:ring-4 focus:ring-[#2e3d83]/10 outline-none transition-all font-medium appearance-none">
                    <option value="Tự động (Automatic)">Tự động (Automatic)</option>
                    <option value="Số sàn (Manual)">Số sàn (Manual)</option>
                    <option value="Vô cấp (CVT)">Vô cấp (CVT)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 uppercase tracking-wide">Nhiên liệu <span className="text-red-500">*</span></label>
                  <select name="fuelType" value={formData.fuelType} onChange={handleChange} required
                    className="w-full px-5 py-4 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:border-[#2e3d83] focus:ring-4 focus:ring-[#2e3d83]/10 outline-none transition-all font-medium appearance-none">
                    <option value="Xăng (Gasoline)">Xăng (Gasoline)</option>
                    <option value="Dầu (Diesel)">Dầu (Diesel)</option>
                    <option value="Điện (Electric)">Điện (Electric)</option>
                    <option value="Xăng Lai Điện (Hybrid)">Xăng Lai Điện (Hybrid)</option>
                  </select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-bold text-slate-700 uppercase tracking-wide">Mô tả chi tiết tình trạng</label>
                  <textarea name="description" value={formData.description} onChange={handleChange} rows={4} placeholder="Mô tả các chi tiết, tình trạng xe, lịch sử bảo dưỡng để gây án tượng với người mua..." 
                    className="w-full px-5 py-4 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:border-[#2e3d83] focus:ring-4 focus:ring-[#2e3d83]/10 outline-none transition-all font-medium resize-none" />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="p-8 md:p-12 animate-in fade-in slide-in-from-right-8 duration-500 fill-mode-forwards">
              <h2 className="text-2xl font-extrabold text-[#2e3d83] mb-8 flex items-center gap-3"><ImageIcon className="text-[#f4c23d]" /> Định giá & Hình ảnh</h2>
              
              <div className="space-y-10">
                <div className="space-y-4">
                  <CurrencyInput
                    label="Mức Giá Sàn (VND)"
                    value={formData.basePrice}
                    onChange={(val) => setFormData(prev => ({ ...prev, basePrice: val }))}
                    required
                    placeholder="VD: 500.000.000"
                  />
                  <p className="text-sm text-slate-500">Giá sàn là mốc giá tham chiếu để bạn thiết lập phiên đấu giá sau này. Nên sát với giá thị trường.</p>
                </div>

                <div className="space-y-4">
                  <label className="text-sm font-bold text-slate-700 uppercase tracking-wide flex justify-between items-end">
                    <span>Đăng tải hình ảnh ({imagePreviews.length}/8) <span className="text-red-500">*</span></span>
                  </label>
                  
                  {/* Drag-Drop Zone */}
                  <div 
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-slate-300 hover:border-[#2e3d83] hover:bg-slate-50 transition-colors rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer group"
                  >
                    <input type="file" multiple accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageChange} />
                    <div className="w-16 h-16 bg-slate-100 group-hover:bg-[#2e3d83]/10 rounded-full flex items-center justify-center mb-4 transition-colors">
                      <UploadCloud className="text-slate-400 group-hover:text-[#2e3d83] transition-colors" size={32} />
                    </div>
                    <p className="text-lg font-bold text-[#2e3d83] mb-1">Kéo thả ảnh vào đây</p>
                    <p className="text-sm text-slate-500">hoặc bấm vào để chọn file (Hỗ trợ JPG, PNG)</p>
                  </div>

                  {/* Image Grid */}
                  {imagePreviews.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                      {imagePreviews.map((url, idx) => (
                        <div key={idx} onClick={() => setZoomedImage(url)} className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 group shadow-sm bg-slate-100 cursor-zoom-in">
                          <img src={url} alt={`Preview ${idx}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          <button type="button" onClick={(e) => { e.stopPropagation(); removeImageAt(idx); }} className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-xl">
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Form Navigation Controls */}
          <div className="px-8 md:px-12 py-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            {step === 1 ? (
              <button type="button" onClick={() => navigate('/seller/products')} className="px-6 py-3 font-bold text-slate-500 hover:text-slate-800 transition-colors">Hủy & Quay Lại</button>
            ) : (
              <button type="button" onClick={() => setStep(step - 1 as 1 | 2)} className="flex items-center gap-2 px-6 py-3 font-bold text-slate-600 hover:text-[#2e3d83] transition-colors rounded-xl hover:bg-[#2e3d83]/5">
                <ChevronLeft size={20} /> Quay lại
              </button>
            )}
            
            {step === 1 && (
              <button type="button" onClick={goToStepTwo} className="flex items-center gap-2 px-8 py-3.5 bg-[#2e3d83] text-white rounded-xl shadow-lg shadow-[#2e3d83]/30 hover:bg-[#1a2350] hover:-translate-y-0.5 transition-all font-bold uppercase tracking-wider">
                Tiếp Tục <ChevronRight size={18} />
              </button>
            )}
            {step === 2 && (
              <button type="button" onClick={goToStepThree} className="flex items-center gap-2 px-8 py-3.5 bg-[#2e3d83] text-white rounded-xl shadow-lg shadow-[#2e3d83]/30 hover:bg-[#1a2350] hover:-translate-y-0.5 transition-all font-bold uppercase tracking-wider">
                Tiếp Tục <ChevronRight size={18} />
              </button>
            )}
            {step === 3 && (
              <button type="submit" disabled={loading} className={`flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-[#f4c23d] to-yellow-500 text-slate-900 rounded-xl shadow-xl shadow-yellow-500/30 font-black uppercase tracking-wider transition-all ${loading ? 'opacity-70 cursor-wait' : 'hover:-translate-y-0.5 hover:shadow-yellow-500/50'}`}>
                {loading ? 'Đang Xử Lý...' : 'Hoàn Tất Đăng Ký'} <CheckCircle2 size={18} />
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Zoom Modal */}
      {zoomedImage && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setZoomedImage(null)}>
          <button onClick={() => setZoomedImage(null)} className="absolute top-6 right-6 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-colors"><X size={24}/></button>
          <img src={zoomedImage} alt="Zoomed" className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl animate-in zoom-in-95 duration-300" />
        </div>
      )}

    </div>
  );
};
