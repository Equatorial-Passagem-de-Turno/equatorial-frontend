import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';

// Layouts & Auth
import { MainLayout } from '@/components/layout/MainLayout';
import { AuthPage } from '@/features/auth/pages/AuthPage'; 
import { RoleSelector } from '@/features/auth/components/RoleSelector';
import { TableSelector } from "@/features/auth/components/TableSelector";

// Pages - Operator
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage';
import { NewOccurrencePage } from '@/features/occurrences/pages/NewOccurrencePage';
import { OccurrenceDetailPage } from '@/features/occurrences/pages/OccurrenceDetailPage';
import { MyShiftOccurrencesPage } from '@/features/occurrences/pages/MyShiftOccurrencesPage';
import { ShiftControlPage } from '@/features/shifts/pages/ShiftControlPage';
import { ShiftPreviousPage } from '@/features/shifts/pages/ShiftPreviousPage';

// Pages - Others
import { ConstructionPage } from '@/pages/ConstructionPage';

export const AppRoutes = () => {
  const { isAuthenticated, role, table } = useAuth();

  if (!isAuthenticated) return <AuthPage />;
  if (!role) return <RoleSelector />;
  if (!table) return <TableSelector />;

  switch (role) {
    // AGRUPAMOS TODAS AS FUNÇÕES OPERACIONAIS AQUI
    // Isso significa que BT, MT, AT e Pré-Op verão o mesmo layout,
    // mas os dados dentro das páginas serão filtrados pelo 'role'
    case 'bt':
    case 'mt':
    case 'at':
    case 'pre_op':
      return (
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<DashboardPage />} />
            
            <Route path="occurrences">
              <Route path="new" element={<NewOccurrencePage />} />
              <Route path="my-shift" element={<MyShiftOccurrencesPage />} />
              <Route path=":id" element={<OccurrenceDetailPage />} />
            </Route>

            <Route path="shifts">
              <Route path="control" element={<ShiftControlPage />} />
              <Route path="previous" element={<ShiftPreviousPage />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      );

    case 'admin':
       // return <AdminRoutes />; // Se tiver rotas de admin
       return <ConstructionPage />;

    default:
      return <ConstructionPage />;
  }
};