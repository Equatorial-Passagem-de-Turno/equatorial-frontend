
export interface OccurrenceLocation {
  alimentador?: string;
  subestacao?: string;
  city?: string;
  neighborhood?: string;
  zone?: string;
  address?: string;
  reference?: string;
}

export interface InheritedOccurrence {
  id: string;
  title: string;
  category: string;
  priority: 'crítica' | 'alta' | 'média' | 'baixa';
  status: 'Aberta' | 'Em Andamento' | 'Resolvida' | 'Pendente' | 'Em Análise';
  description: string;
  location: OccurrenceLocation;
  osNumero?: string;
  reportedBy: string;
  createdAt: string;
  timestamp: string;
  attachments?: string[];
  comments?: string[];
  linkType?: string;
  linkValue?: string;
  reminders?: string[];
}

export interface ShiftHandoverData {
  previousOperator: string;
  shiftTime: string;
  date: string;
  reportText: string;
  criticalCount: number;
  occurrences: InheritedOccurrence[];
}

export const getShiftHandoverData = async (): Promise<ShiftHandoverData> => {
  // Simula delay da API
  await new Promise(resolve => setTimeout(resolve, 500));

return {
    previousOperator: 'JOÃO MENDES (MT)',
    shiftTime: '19:00 - 07:00',
    date: '04/12/2025',
    reportText: 'Turno com manobras programadas na região central. Atenção para pendências na SE-Centro.',
    criticalCount: 2, // Atualizei para 2 pois adicionei mais uma crítica abaixo
    occurrences: [
      // 1. Ocorrência Original
      {
        id: 'OC-202512-7327',
        title: 'Manobra para manutenção preventiva',
        category: 'Manobra Programada',
        priority: 'crítica',
        status: 'Em Andamento',
        createdAt: '04/12/2025, 17:34:05',
        timestamp: 'Há 20 min',
        reportedBy: 'Operador 2',
        location: {
            alimentador: 'AL-03',
            subestacao: 'SE-CENTRO',
            city: 'MACEIO',
            neighborhood: 'CENTRO',
            zone: 'Urbana',
            address: 'Rua do Comércio, 500',
            reference: 'Ao lado do banco'
        },
        description: 'Manobra iniciada conforme programação. Aguardando equipe de linha viva.',
        linkType: 'OS',
        linkValue: '1111',
        attachments: [],
        comments: [],
        reminders: []
      },
      // 2. NOVA: Ocorrência Alta Prioridade
      {
        id: 'OC-202512-7328',
        title: 'Cabo Partido na via pública',
        category: 'Emergencial',
        priority: 'alta',
        status: 'Pendente',
        createdAt: '04/12/2025, 18:10:00',
        timestamp: 'Há 10 min',
        reportedBy: 'Call Center',
        location: {
            alimentador: 'AL-05',
            subestacao: 'SE-TABULEIRO',
            city: 'MACEIO',
            neighborhood: 'TABULEIRO',
            address: 'Av. Durval de Góes Monteiro',
        },
        description: 'Popular informou cabo faiscando no chão. Risco iminente.',
        linkType: 'OS',
        linkValue: '1112',
        attachments: [],
        comments: [],
        reminders: []
      },
      // 3. NOVA: Ocorrência Média Prioridade
      {
        id: 'OC-202512-7329',
        title: 'Oscilação de Tensão',
        category: 'Qualidade',
        priority: 'média',
        status: 'Em Análise',
        createdAt: '04/12/2025, 16:00:00',
        timestamp: 'Há 2h',
        reportedBy: 'Sistema SCADA',
        location: {
            alimentador: 'AL-02',
            subestacao: 'SE-CENTRO',
            reference: 'Fábrica de Gelo'
        },
        description: 'Variação de tensão reportada por cliente industrial.',
        attachments: [],
        comments: [],
        reminders: []
      },
      // 4. NOVA: Outra Crítica para testar cores
      {
        id: 'OC-202512-7330',
        title: 'Desligamento Acidental AL-01',
        category: 'Interrupção',
        priority: 'crítica',
        status: 'Aberta',
        createdAt: '04/12/2025, 18:55:00',
        timestamp: 'Há 5 min',
        reportedBy: 'Sistema de Proteção',
        location: {
            alimentador: 'AL-01',
            subestacao: 'SE-CENTRO',
        },
        description: 'Atuação da proteção de retaguarda. Causa desconhecida.',
        attachments: [],
        comments: [],
        reminders: []
      },
      // 5. NOVA: Ocorrência Baixa
      {
        id: 'OC-202512-7331',
        title: 'Solicitação de Poda',
        category: 'Manutenção',
        priority: 'baixa',
        status: 'Pendente',
        createdAt: '04/12/2025, 10:00:00',
        timestamp: 'Há 8h',
        reportedBy: 'Cliente',
        location: {
            city: 'MACEIO',
            neighborhood: 'PONTA VERDE',
            address: 'Rua das Ostras'
        },
        description: 'Galhos próximos à rede de baixa tensão.',
        attachments: [],
        comments: [],
        reminders: []
      }
    ]
  }
};