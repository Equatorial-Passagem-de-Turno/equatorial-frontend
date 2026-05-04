import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from '@/routes/AppRoutes';
import { Toaster } from 'sonner';
import { ThemeProvider } from './contexts/ThemeContext';

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        {/* Estilos Globais */}
        <style>{`
          ::-webkit-scrollbar { width: 8px; }

          :root.light ::-webkit-scrollbar-track { background: #e2e8f0; }
          :root.light ::-webkit-scrollbar-thumb { background: #d5dbe3; border-radius: 4px; }
          :root.light ::-webkit-scrollbar-thumb:hover { background: #64748b; }

          :root.dark ::-webkit-scrollbar-track { background: #0f172a; }
          :root.dark ::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }
          :root.dark ::-webkit-scrollbar-thumb:hover { background: #475569; }
        `}</style>
        <AppRoutes />
        <Toaster position="top-center" richColors />
      </BrowserRouter>
    </ThemeProvider>
  );
}