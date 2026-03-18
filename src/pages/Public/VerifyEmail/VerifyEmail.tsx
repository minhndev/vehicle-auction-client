import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button/Button';
import { miscApi } from '../../../api/miscApi';
import styles from './VerifyEmail.module.css';

export const VerifyEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'failed' | 'invalid'>('loading');

  useEffect(() => {
    if (!token) {
      setStatus('invalid');
      return;
    }
    
    const verifyToken = async () => {
      try {
        await miscApi.verifyAccount(token);
        setStatus('success');
      } catch (err) {
        setStatus('failed');
      }
    };

    verifyToken();
  }, [token]);

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {status === 'invalid' && (
          <div>
            <div className={styles.iconCircleWarning}>!</div>
            <h2>Invalid Verification Link</h2>
            <p>The link you clicked is missing a verification token.</p>
            <Button variant="primary" onClick={() => navigate('/')}>Return Home</Button>
          </div>
        )}

        {status === 'loading' && (
          <div>
            <div className="loadingSpinner" style={{ margin: '0 auto 1.5rem' }}></div>
            <h2>Verifying Account</h2>
            <p>Please wait while we verify your email address...</p>
          </div>
        )}

        {status === 'success' && (
          <div>
             <div className={styles.iconCircleSuccess}>✓</div>
            <h2>Account Verified!</h2>
            <p>Your email has been successfully verified. You can now access all features of the platform.</p>
            <Button variant="primary" onClick={() => navigate('/login')}>Login to your Account</Button>
          </div>
        )}

        {status === 'failed' && (
          <div>
             <div className={styles.iconCircleFailed}>✕</div>
            <h2>Verification Failed</h2>
            <p>Your verification link may have expired or is invalid. Please request a new verification email.</p>
            <Button variant="outline" onClick={() => navigate('/register')}>Sign Up Again</Button>
          </div>
        )}
      </div>
    </div>
  );
};
