import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Shift } from '../types/shift';
import { type HistoryItem } from '../components/history/HistoryTable';
import { api } from '@/services/api'; 
import { useAuth } from '@/features/auth/hooks/useAuth'; 

export const useShiftControl = () => {
  const navigate = useNavigate();
  const { user, logout: authLogout } = useAuth();
  
  const [turnoAtual, setTurnoAtual] = useState<Shift | null>(null);
  const [todaysShifts, setTodaysShifts] = useState<HistoryItem[]>([]);
  const [briefing, setBriefing] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActiveShiftAndToday = async () => {
      try {
        setLoading(true);
        const responseCurrent = await api.get('/shifts/current'); 
        if (responseCurrent.data) {
          setTurnoAtual(responseCurrent.data);
          setBriefing(responseCurrent.data.briefing || '');
        }

        const responseToday = await api.get('/shifts/by-date');
        if (responseToday.data) {
            setTodaysShifts(responseToday.data);
        }

      } catch (error) {
        console.error("Erro ao buscar dados do turno:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchActiveShiftAndToday();
    }
  }, [user]);

  const encerrarTurno = () => setShowSuccessModal(true);
  const finalizarNavegacao = () => navigate('/');
  const imprimirRelatorio = () => window.print();
  const logout = () => {
    authLogout();
    navigate('/login');
  };

  return {
    user,
    turnoAtual,
    setTurnoAtual,
    todaysShifts,
    briefing,
    setBriefing,
    showSuccessModal,
    loading,
    encerrarTurno,
    finalizarNavegacao,
    imprimirRelatorio,
    logout
  };
};