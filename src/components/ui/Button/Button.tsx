import React, { type ButtonHTMLAttributes } from 'react';
import styles from './Button.module.css';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Trạng thái/biến thể của component theo Figma variant
   */
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  /**
   * Kích thước của component (nếu có đa dạng size trong hệ thống thiết kế)
   */
  size?: 'sm' | 'md' | 'lg' | 'small' | 'medium' | 'large';
  /**
   * Giúp button chiếm toàn bộ chiều rộng (100%) của parent container
   */
  fullWidth?: boolean;

  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  disabled,
  className = '',
  children,
  ...props
}) => {
  const normalizedSize = size === 'small' ? 'sm' : size === 'medium' ? 'md' : size === 'large' ? 'lg' : size;

  const rootClassName = [
    styles.base,
    styles[variant],
    styles[normalizedSize],
    fullWidth ? styles.fullWidth : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button className={rootClassName} disabled={disabled || isLoading} {...props}>
      {isLoading ? 'Loading...' : children}
    </button>
  );
};
