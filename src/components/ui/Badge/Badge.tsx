import React, { type HTMLAttributes } from 'react';
import styles from './Badge.module.css';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /**
   * Nội dung hiển thị trong component
   */
  text: string;
  /**
   * Trạng thái giao diện từ Figma
   */
  variant?: 'primary' | 'secondary' | 'success' | 'warning';
}

export const Badge: React.FC<BadgeProps> = ({
  text,
  variant = 'primary',
  className = '',
  ...props
}) => {
  const rootClassName = [
    styles.base,
    styles[variant],
    className,
  ].filter(Boolean).join(' ');

  return (
    <span className={rootClassName} {...props}>
      {text}
    </span>
  );
};
