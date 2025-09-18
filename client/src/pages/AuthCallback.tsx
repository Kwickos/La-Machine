import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setAuthToken } = useAuth() as any;

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (token) {
      // Save token and redirect
      localStorage.setItem('token', token);
      if (setAuthToken) {
        setAuthToken(token);
      }
      navigate('/');
    } else {
      // No token, redirect to login
      navigate('/login');
    }
  }, [searchParams, navigate, setAuthToken]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-darker">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-light">Connexion en cours...</p>
      </div>
    </div>
  );
}