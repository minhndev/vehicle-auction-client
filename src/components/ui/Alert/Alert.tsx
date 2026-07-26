import React from 'react';
import styles from './Alert.module.css';

interface AlertProps {
  /**
   * Title of the alert (optional)
   */
  title?: string;
  /**
   * Main text content of the alert
   */
  content: string;
  /**
   * Visual variant representing the alert state
   */
  variant?: 'info' | 'success' | 'warning' | 'error';
  /**
   * Optional close handler
   */
  onClose?: () => void;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  title,
  content,
  variant = 'info',
  onClose,
  className = '',
}) => {
  const rootClassName = [styles.base, styles[variant], className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={rootClassName} role="alert">
      <div className={styles.contentWrapper}>
        {title && <h4 className={styles.title}>{title}</h4>}
        <p className={styles.content}>{content}</p>
      </div>
      {onClose && (
        <button onClick={onClose} className={styles.closeBtn} aria-label="Close">
          &times;
        </button>
      )}
    </div>
  );
};
