// src/features/auth/components/SessionSetup.tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { RoleSelector } from './RoleSelector';
import { TableSelector } from './TableSelector';

export const SessionSetup = () => {
  const navigate = useNavigate();
  // Puxando os nomes corretos da sua store
  const { user, role, table } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (role && table) {
      navigate('/dashboard'); // Ou a rota principal do seu painel
    }
  }, [user, role, table, navigate]);

  // Passo 1: Não tem Role?
  if (!role) {
    return <RoleSelector />;
  }

  // Passo 2: Tem Role, mas não tem Table?
  if (!table) {
    return <TableSelector />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-theme-bg text-theme-text">
      <p>Preparando seu ambiente...</p>
    </div>
  );
};