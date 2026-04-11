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

          const currentShiftAsTodayItem: HistoryItem = {
            shiftId: Number(responseCurrent.data.id ?? 0),
            id: `TUR-${String(responseCurrent.data.id ?? '').padStart(4, '0')}`,
            operador: String(responseCurrent.data.operador ?? user?.name ?? 'Desconhecido'),
            horario: `${String(responseCurrent.data.inicio ?? '--:--')} - ...`,
            tipo: String(responseCurrent.data.funcao ?? user?.role ?? 'BT'),
            status: 'Aberto',
            workedDuration: String(responseCurrent.data.workedDuration ?? responseCurrent.data.tempo_trabalhado ?? '--'),
          };

          setTodaysShifts([currentShiftAsTodayItem]);
        } else {
          setTurnoAtual(null);
          setBriefing('');
          setTodaysShifts([]);
        }
      } catch (error) {
        console.error("Erro ao buscar dados do turno:", error);
        setTurnoAtual(null);
        setBriefing('');
        setTodaysShifts([]);
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
    logout
  };
};