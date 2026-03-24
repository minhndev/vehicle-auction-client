import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { authService } from '../../../features/auth/api/authService';
import { setCredentials } from '../../../store/slices/authSlice';

const readFirstParam = (searchParams: URLSearchParams, keys: string[]): string => {
  for (const key of keys) {
    const value = searchParams.get(key);
    if (value) {
      return value;
    }
  }
  return '';
};

export const OAuth2Redirect: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string>('');

  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);

  useEffect(() => {
    const providerError = readFirstParam(params, ['error', 'message']);
    if (providerError) {
      setError(decodeURIComponent(providerError));
      return;
    }

    const accessToken = readFirstParam(params, ['accessToken', 'access_token', 'token']);
    const refreshToken = readFirstParam(params, ['refreshToken', 'refresh_token']);
    const tokenType = readFirstParam(params, ['tokenType', 'token_type']) || 'Bearer';

    if (!accessToken) {
      setError('OAuth2 callback is missing access token.');
      return;
    }

    const userProfile = authService.getCurrentUserFromToken(accessToken);
    dispatch(setCredentials({
      user: userProfile,
      tokens: {
        accessToken,
        refreshToken,
        tokenType,
      },
    }));

    const roleStr = (userProfile.role || 'USER').toUpperCase();
    const targetPath = roleStr === 'ADMIN' ? '/admin/dashboard' : roleStr === 'SELLER' ? '/seller/dashboard' : '/user/dashboard';
    navigate(targetPath, { replace: true });
  }, [dispatch, navigate, params]);

  if (error) {
    return (
      <div style={{ minHeight: '60vh', display: 'grid', placeItems: 'center', padding: '1rem' }}>
        <div style={{ maxWidth: 560, textAlign: 'center' }}>
          <h2>Google login failed</h2>
          <p>{error}</p>
          <Link to="/login">Back to login</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '60vh', display: 'grid', placeItems: 'center', padding: '1rem' }}>
      <div style={{ textAlign: 'center' }}>
        <h2>Signing you in...</h2>
        <p>Processing OAuth2 callback.</p>
      </div>
    </div>
  );
};
