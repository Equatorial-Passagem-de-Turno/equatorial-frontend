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
            const normalizedShifts: HistoryItem[] = (Array.isArray(responseToday.data) ? responseToday.data : []).map((item: any) => {
              const parsedFromDisplayId = Number(String(item?.id ?? '').replace(/\D/g, ''));
              const normalizedShiftId = Number(item?.shiftId ?? item?.shift_id ?? parsedFromDisplayId);

              return {
                shiftId: Number.isFinite(normalizedShiftId) ? normalizedShiftId : 0,
                id: String(item?.id ?? ''),
                operador: String(item?.operador ?? 'Desconhecido'),
                horario: String(item?.horario ?? '--:-- - --:--'),
                tipo: String(item?.tipo ?? 'BT'),
                status: item?.status === 'Aberto' ? 'Aberto' : 'Fechado',
                workedDuration: String(item?.workedDuration ?? item?.tempo_trabalhado ?? '--'),
              };
            });

            setTodaysShifts(normalizedShifts);
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