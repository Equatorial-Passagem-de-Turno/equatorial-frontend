import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';

// Layouts & Auth
import { MainLayout } from '@/components/layout/MainLayout';
import { AuthPage } from '@/features/auth/pages/AuthPage'; 
import { RoleSelector } from '@/features/auth/components/RoleSelector';
import { TableSelector } from "@/features/auth/components/TableSelector";

// Pages
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage';
import { NewOccurrencePage } from '@/features/occurrences/pages/NewOccurrencePage';
import { MyShiftOccurrencesPage } from '@/features/occurrences/pages/MyShiftOccurrencesPage';
import { OccurrenceDetailPage } from '@/features/occurrences/pages/OccurrenceDetailPage';
import { ShiftControlPage } from '@/features/shifts/pages/ShiftControlPage';
import { ShiftPreviousPage } from '@/features/shifts/pages/ShiftPreviousPage';
import { ConstructionPage } from '@/pages/ConstructionPage';

export const AppRoutes = () => {
  const { isAuthenticated, role, table } = useAuth();

  if (!isAuthenticated) return <AuthPage />;

  if (!role) return <RoleSelector />;
  if (!table) return <TableSelector />;

  if (role.toLowerCase() === 'admin') {
    return <ConstructionPage />;
  }

  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        {/* Dashboard Principal */}
        <Route index element={<DashboardPage />} />
        
        {/* Módulo de Ocorrências */}
        <Route path="occurrences">
          <Route path="new" element={<NewOccurrencePage />} />
          <Route path="my-shift" element={<MyShiftOccurrencesPage />} />
          <Route path=":id" element={<OccurrenceDetailPage />} />
        </Route>

        {/* Módulo de Turnos */}
        <Route path="shifts">
          <Route path="control" element={<ShiftControlPage />} />
          <Route path="previous" element={<ShiftPreviousPage />} />
        </Route>
      </Route>

      {/* Redireciona qualquer rota inválida para a home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};