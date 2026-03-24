import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button/Button';
import { miscApi } from '../../../api/miscApi';
import { usePageI18n } from '../../../i18n/usePageI18n';
import styles from './VerifyEmail.module.css';

const verifyPromiseByToken = new Map<string, Promise<void>>();

const resolveTokenFromQuery = (searchParams: URLSearchParams): string | null => {
  return (
    searchParams.get('token') ||
    searchParams.get('verificationToken') ||
    searchParams.get('code') ||
    null
  );
};

export const VerifyEmail: React.FC = () => {
  const { tp } = usePageI18n();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = resolveTokenFromQuery(searchParams);

  const [status, setStatus] = useState<'loading' | 'success' | 'failed' | 'invalid'>('loading');

  useEffect(() => {
    if (!token) {
      setStatus('invalid');
      return;
    }

    const verifyToken = async () => {
      try {
        let request = verifyPromiseByToken.get(token);
        if (!request) {
          request = miscApi.verifyAccount(token)
            .then(() => undefined);
          verifyPromiseByToken.set(token, request);
        }

        await request;
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
            <h2>{tp('verifyEmail.invalidTitle')}</h2>
            <p>{tp('verifyEmail.invalidDescription')}</p>
            <Button variant="primary" onClick={() => navigate('/')}>{tp('verifyEmail.home')}</Button>
          </div>
        )}

        {status === 'loading' && (
          <div>
            <div className="loadingSpinner" style={{ margin: '0 auto 1.5rem' }}></div>
            <h2>{tp('verifyEmail.loadingTitle')}</h2>
            <p>{tp('verifyEmail.loadingDescription')}</p>
          </div>
        )}

        {status === 'success' && (
          <div>
             <div className={styles.iconCircleSuccess}>✓</div>
            <h2>{tp('verifyEmail.successTitle')}</h2>
            <p>{tp('verifyEmail.successDescription')}</p>
            <Button variant="primary" onClick={() => navigate('/login')}>{tp('verifyEmail.login')}</Button>
          </div>
        )}

        {status === 'failed' && (
          <div>
             <div className={styles.iconCircleFailed}>✕</div>
            <h2>{tp('verifyEmail.failedTitle')}</h2>
            <p>{tp('verifyEmail.failedDescription')}</p>
            <Button variant="outline" onClick={() => navigate('/register')}>{tp('verifyEmail.registerAgain')}</Button>
          </div>
        )}
      </div>
    </div>
  );
};
