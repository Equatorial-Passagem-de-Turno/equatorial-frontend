import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import type { Shift } from '../types/shift';

// Mock do Auth (Adicionado a função logout)
const useAuth = () => ({
  user: { name: 'OPERADOR', email: 'operador@demo.com' },
  logout: () => {
    console.log('Sessão encerrada');
    // Aqui limparia o localStorage/Cookies
  }
});

export const useShiftControl = () => {
  const navigate = useNavigate();
  const { user, logout: authLogout } = useAuth();
  
  // Mock Inicial
  const [turnoAtual, setTurnoAtual] = useState<Shift | null>({
    id: `TUR-${format(new Date(), 'yyyyMMdd')}-MT`,
    operador: user.name,
    funcao: 'MT',
    inicio: '14:32',
    data: format(new Date(), 'dd/MM/yyyy'),
    briefing: '',
    pendenciasHerdadas: [
      { id: 'OC-0345', descricao: 'Reintegração BT setor 7', prioridade: 'crítica', status: 'pendente' },
      { id: 'OC-0331', descricao: 'Ajuste de transformador', prioridade: 'média', status: 'em andamento' }
    ],
    pendenciasDeixadas: [
      { id: 'OC-0351', descricao: 'Verificar telemetria MT', prioridade: 'baixa', status: 'pendente' },
      { id: 'OC-0355', descricao: 'Atualizar relatório técnico AT', prioridade: 'média', status: 'pendente' }
    ]
  });

  const [briefing, setBriefing] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const encerrarTurno = () => {
    if (!turnoAtual || !briefing.trim()) {
      alert('Por favor, preencha o briefing antes de encerrar.');
      return;
    }
    
    const fim = format(new Date(), 'HH:mm');
    setTurnoAtual(prev => prev ? { ...prev, briefing, fim } : null);
    setShowSuccessModal(true);
  };

  const finalizarNavegacao = () => {
    navigate('/');
  };

  const imprimirRelatorio = () => {
    window.print();
  };

  // Nova função de Logout que redireciona
  const logout = () => {
    authLogout();
    navigate('/login'); // Ajuste a rota conforme seu roteamento
  };

  return {
    user,
    turnoAtual,
    briefing,
    setBriefing,
    showSuccessModal,
    encerrarTurno,
    finalizarNavegacao,
    imprimirRelatorio,
    logout // <--- Adicionado aqui para corrigir o erro TS2339
  };
};