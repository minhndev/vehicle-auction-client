import React, { useState, useEffect } from 'react';

interface CurrencyInputProps {
  value: number;
  onChange: (value: number) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
  name?: string;
}

export const CurrencyInput: React.FC<CurrencyInputProps> = ({
  value,
  onChange,
  label,
  placeholder,
  required = false,
  className = '',
  name
}) => {
  const [displayValue, setDisplayValue] = useState('');

  useEffect(() => {
    if (value === 0) {
      setDisplayValue('');
    } else {
      setDisplayValue(formatNumber(value));
    }
  }, [value]);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('vi-VN').format(num);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    const numValue = rawValue ? parseInt(rawValue, 10) : 0;
    
    onChange(numValue);
    setDisplayValue(rawValue ? formatNumber(numValue) : '');
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-bold text-slate-700 uppercase tracking-wide">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          type="text"
          name={name}
          value={displayValue}
          onChange={handleTextChange}
          placeholder={placeholder}
          required={required}
          className={`w-full px-5 py-4 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:border-[#2e3d83] focus:ring-4 focus:ring-[#2e3d83]/10 outline-none transition-all font-bold text-lg text-[#2e3d83] ${className}`}
        />
        <span className="absolute right-5 top-1/2 -translate-y-1/2 font-extrabold text-slate-400">đ</span>
      </div>
    </div>
  );
};
