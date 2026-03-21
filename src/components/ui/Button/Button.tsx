import React, { type ButtonHTMLAttributes } from 'react';
import styles from './Button.module.css';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Trạng thái/biến thể của component theo Figma variant
   */
  variant?: 'primary' | 'secondary' | 'danger';
  /**
   * Kích thước của component (nếu có đa dạng size trong hệ thống thiết kế)
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Giúp button chiếm toàn bộ chiều rộng (100%) của parent container
   */
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  children,
  ...props
}) => {
  const rootClassName = [
    styles.base,
    styles[variant],
    styles[size],
    fullWidth ? styles.fullWidth : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button className={rootClassName} {...props}>
      {children}
    </button>
  );
};
