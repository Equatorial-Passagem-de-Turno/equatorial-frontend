import { useState } from 'react';
import { LoginForm } from '@/features/auth/components/LoginForm';
import { ForgotPasswordForm } from '@/features/auth/components/ForgotPasswordForm';

export const AuthPage = () => {
  const [view, setView] = useState<'LOGIN' | 'FORGOT'>('LOGIN');

  if (view === 'FORGOT') {
    return <ForgotPasswordForm onBack={() => setView('LOGIN')} />;
  }

  return <LoginForm onForgotPassword={() => setView('FORGOT')} />;
};