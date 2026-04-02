import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';

type ShiftFinishLockGuardProps = {
  children: ReactNode;
};

export const ShiftFinishLockGuard = ({ children }: ShiftFinishLockGuardProps) => {
  const { user } = useAuth();
  const location = useLocation();

  const lockKey = user?.id ? `shift_finish_locked_${user.id}` : null;
  const isLocked = lockKey ? localStorage.getItem(lockKey) === '1' : false;

  const isShiftControlRoute = location.pathname === '/shifts/control';

  if (isLocked && !isShiftControlRoute) {
    return <Navigate to="/shifts/control" replace />;
  }

  return <>{children}</>;
};
