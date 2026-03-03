import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';
import { format } from 'date-fns';

// 1. Atualizei a interface para incluir as listas de pendências
export interface ShiftReportData {
  id: string;
  operador: string;
  funcao: string;
  inicio: string;
  briefing: string;
  totalOcorrencias: number;
  criticas: number;
  // Adicionados para a segunda página:
  pendenciasHerdadas: Array<{ id: string; descricao: string; status: string }>;
  pendenciasDeixadas: Array<{ id: string; descricao: string; status: string }>;
}

const theme = {
  primary: '#10b981',
  secondary: '#064e3b',
  text: '#1e293b',
  lightText: '#64748b',
  bgHeader: '#f1f5f9',
};

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 40,
    fontFamily: 'Helvetica',
    paddingBottom: 60, // Espaço extra para o rodapé não cobrir o texto
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    borderBottomWidth: 2,
    borderBottomColor: theme.primary,
    paddingBottom: 10,
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.secondary,
    textTransform: 'uppercase',
  },
  headerInfo: { textAlign: 'right' },
  label: { fontSize: 10, color: theme.lightText, marginBottom: 2 },
  value: { fontSize: 12, color: theme.text, fontWeight: 'bold', marginBottom: 4 },
  sectionTitle: {
    fontSize: 14,
    color: theme.primary,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: theme.bgHeader,
    padding: 15,
    borderRadius: 4,
    marginBottom: 20,
  },
  statBox: { alignItems: 'center' },
  statValue: { fontSize: 18, fontWeight: 'bold', color: theme.secondary },
  statLabel: { fontSize: 10, color: theme.lightText },
  contentBox: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
    padding: 15,
    minHeight: 100, // Diminuí um pouco para caber melhor
    fontSize: 12,
    lineHeight: 1.5,
    color: theme.text,
    borderRadius: 4,
  },
  // Estilos novos para a Tabela da Pág 2
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingVertical: 5,
  },
  tableHeader: {
    fontSize: 10,
    fontWeight: 'bold',
    color: theme.lightText,
    textTransform: 'uppercase',
  },
  tableCell: { fontSize: 10, color: theme.text },
  
  // Rodapé ajustado para ser Fixo
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: { fontSize: 8, color: theme.lightText },
  
  signatureArea: {
    marginTop: 50,
    alignItems: 'center',
    width: 200,
    borderTopWidth: 1,
    borderTopColor: theme.text,
    paddingTop: 5,
    alignSelf: 'flex-end', // Garante alinhamento à direita
  },
});

export const ShiftReportDocument = ({ data }: { data: ShiftReportData }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      
      {/* CABEÇALHO FIXO 
          A prop 'fixed' faz o cabeçalho se repetir em TODAS as páginas automaticamente 
      */}
      <View style={styles.header} fixed>
        <View>
          <Text style={styles.logo}>CondoTech</Text>
          <Text style={{ fontSize: 10, color: theme.lightText }}>Relatório Operacional</Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.label}>ID DO RELATÓRIO</Text>
          <Text style={styles.value}>{data.id}</Text>
          <Text style={styles.label}>DATA DE EMISSÃO</Text>
          <Text style={styles.value}>{format(new Date(), 'dd/MM/yyyy')}</Text>
        </View>
      </View>

      {/* --- CONTEÚDO DA PÁGINA 1 --- */}

      {/* Info Operador */}
      <View style={{ flexDirection: 'row', marginBottom: 20 }}>
        <View style={{ width: '50%' }}>
          <Text style={styles.label}>OPERADOR RESPONSÁVEL</Text>
          <Text style={styles.value}>{data.operador}</Text>
        </View>
        <View style={{ width: '25%' }}>
          <Text style={styles.label}>FUNÇÃO</Text>
          <Text style={styles.value}>{data.funcao}</Text>
        </View>
        <View style={{ width: '25%' }}>
          <Text style={styles.label}>HORÁRIO</Text>
          <Text style={styles.value}>{data.inicio}</Text>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{data.totalOcorrencias}</Text>
          <Text style={styles.statLabel}>Total Ocorrências</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{data.criticas}</Text>
          <Text style={styles.statLabel}>Críticas</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>100%</Text>
          <Text style={styles.statLabel}>Disponibilidade</Text>
        </View>
      </View>

      {/* Briefing */}
      <Text style={styles.sectionTitle}>Briefing & Observações</Text>
      <View style={styles.contentBox}>
        <Text>{data.briefing}</Text>
      </View>

      {/* ================================================================
          AQUI É O SEGREDO: <View break>
          Isso força tudo o que estiver DENTRO ou APÓS esta view 
          a ir para a Página 2.
          ================================================================
      */}
      <View break>
        <Text style={styles.sectionTitle}>Detalhamento de Pendências</Text>
        
        {/* Exemplo de Tabela Simples para Pág 2 */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ ...styles.label, marginBottom: 5 }}>PENDÊNCIAS REGISTRADAS</Text>
          
          {/* Cabeçalho da Tabela */}
          <View style={{ flexDirection: 'row', backgroundColor: '#f1f5f9', padding: 5 }}>
            <Text style={{ ...styles.tableHeader, width: '15%' }}>ID</Text>
            <Text style={{ ...styles.tableHeader, width: '65%' }}>DESCRIÇÃO</Text>
            <Text style={{ ...styles.tableHeader, width: '20%' }}>STATUS</Text>
          </View>

          {/* Linhas da Tabela (Combinando os dois arrays para exemplo) */}
          {[...data.pendenciasHerdadas, ...data.pendenciasDeixadas].map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={{ ...styles.tableCell, width: '15%' }}>{item.id}</Text>
              <Text style={{ ...styles.tableCell, width: '65%' }}>{item.descricao}</Text>
              <Text style={{ ...styles.tableCell, width: '20%' }}>{item.status}</Text>
            </View>
          ))}
          
          {/* Mensagem caso não haja dados */}
          {(!data.pendenciasHerdadas.length && !data.pendenciasDeixadas.length) && (
             <Text style={{ fontSize: 10, color: theme.lightText, padding: 10, textAlign: 'center' }}>
               Nenhuma pendência registrada neste turno.
             </Text>
          )}
        </View>

        {/* Assinatura agora fica na página 2 */}
        <View style={styles.signatureArea}>
          <Text style={{ fontSize: 10, fontWeight: 'bold' }}>{data.operador}</Text>
          <Text style={styles.footerText}>Assinatura Digital / Operador</Text>
        </View>
      </View>

      {/* RODAPÉ FIXO 
          Usamos a render prop para pegar o número da página dinamicamente.
          A prop 'fixed' garante que aparece em todas as páginas.
      */}
      <View style={styles.footer} fixed>
        <Text style={styles.footerText}>CondoTech Solutions - Sistema de Gestão Inteligente</Text>
        <Text style={styles.footerText} render={({ pageNumber, totalPages }) => (
          `Página ${pageNumber} de ${totalPages}`
        )} />
      </View>

    </Page>
  </Document>
);