import { jsPDF } from 'jspdf';
import { format } from 'date-fns';

interface ReportField {
  label: string;
  value: string;
}

interface ReportMetric {
  label: string;
  value: string;
}

interface ReportComment {
  author: string;
  type?: string;
  text: string;
  createdAt?: string;
}

interface ReportListItem {
  code?: string;
  title: string;
  description?: string;
  metadata?: string[];
  comments?: ReportComment[];
}

interface ReportListSection {
  title: string;
  emptyMessage: string;
  items: ReportListItem[];
}

interface StandardReportPayload {
  title: string;
  subtitle: string;
  reference: string;
  summaryFields: ReportField[];
  metrics?: ReportMetric[];
  narrativeTitle?: string;
  narrativeText?: string;
  listSections?: ReportListSection[];
  filePrefix: string;
}

export interface ShiftClosureReportPayload {
  shiftId: string;
  operator: string;
  role: string;
  deskTarget: string;
  start: string;
  end: string;
  status: string;
  workedDuration?: string;
  briefing?: string;
  resolvedItems: Array<{ id?: string; descricao?: string; prioridade?: string }>;
  handoverItems: Array<{ id?: string; descricao?: string; prioridade?: string }>;
}

export interface ShiftDetailReportPayload {
  shiftId: string;
  operator: string;
  role: string;
  desk?: string;
  status: string;
  start?: string | null;
  end?: string | null;
  workedDuration?: string;
  briefing?: string;
  totalOccurrences: number;
  openOccurrences: number;
  resolvedOccurrences: number;
  occurrences: Array<{
    id: string;
    title: string;
    description?: string;
    category?: string;
    priority?: string;
    status?: string;
    origin?: string;
    createdAt?: string | null;
    comments?: Array<{
      author?: string;
      type?: string;
      text?: string;
      createdAt?: string;
    }>;
    commentsCount?: number;
  }>;
}

export interface OccurrenceReportPayload {
  occurrenceId: string;
  title: string;
  status: string;
  priority: string;
  category?: string;
  createdAt?: string;
  createdBy?: string;
  location?: string;
  linkedTo?: string;
  description?: string;
  operatorEmail?: string;
  comments?: Array<{
    author?: string;
    type?: string;
    text?: string;
    createdAt?: string;
  }>;
}

const colors = {
  pageText: [15, 23, 42] as const,
  mutedText: [100, 116, 139] as const,
  titleBar: [15, 23, 42] as const,
  titleAccent: [16, 185, 129] as const,
  sectionTitle: [30, 41, 59] as const,
};

const safeValue = (value: unknown, fallback = '--') => {
  const parsed = String(value ?? '').trim();
  return parsed.length > 0 ? parsed : fallback;
};

const sanitizeFileSegment = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9_-]/g, '_');

const drawStandardPdf = (payload: StandardReportPayload) => {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const setColor = (rgb: readonly [number, number, number]) => {
    doc.setTextColor(rgb[0], rgb[1], rgb[2]);
  };

  const drawHeader = () => {
    doc.setFillColor(colors.titleBar[0], colors.titleBar[1], colors.titleBar[2]);
    doc.rect(0, 0, pageWidth, 76, 'F');

    doc.setDrawColor(colors.titleAccent[0], colors.titleAccent[1], colors.titleAccent[2]);
    doc.setLineWidth(3);
    doc.line(margin, 74, pageWidth - margin, 74);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(17);
    doc.setTextColor(255, 255, 255);
    doc.text(payload.title, margin, 34);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(209, 213, 219);
    doc.text(payload.subtitle, margin, 52);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(226, 232, 240);
    doc.text(`Ref: ${payload.reference}`, pageWidth - margin, 52, { align: 'right' });

    y = 96;
  };

  const ensureSpace = (requiredHeight: number) => {
    if (y + requiredHeight > pageHeight - margin - 34) {
      doc.addPage();
      y = margin;
    }
  };

  const writeSectionTitle = (title: string) => {
    ensureSpace(24);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    setColor(colors.sectionTitle);
    doc.text(title, margin, y);
    y += 14;

    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(1);
    doc.line(margin, y, pageWidth - margin, y);
    y += 10;
  };

  const writeField = (label: string, value: string) => {
    ensureSpace(22);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    setColor(colors.mutedText);
    doc.text(label, margin, y);
    y += 12;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    setColor(colors.pageText);
    const lines = doc.splitTextToSize(safeValue(value), contentWidth);
    doc.text(lines, margin, y);
    y += lines.length * 13 + 6;
  };

  const writeMetricLine = (metrics: ReportMetric[]) => {
    if (!metrics.length) return;

    ensureSpace(18 + metrics.length * 12);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    setColor(colors.pageText);

    metrics.forEach((metric) => {
      const text = `${safeValue(metric.label)}: ${safeValue(metric.value)}`;
      const lines = doc.splitTextToSize(text, contentWidth);
      doc.text(lines, margin, y);
      y += lines.length * 12 + 2;
    });

    y += 6;
  };

  const writeNarrative = (title: string, text: string) => {
    writeSectionTitle(title);

    const normalized = safeValue(text, 'Sem registro para este item.');
    const lines = doc.splitTextToSize(normalized, contentWidth);
    ensureSpace(lines.length * 12 + 10);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    setColor(colors.pageText);
    doc.text(lines, margin, y);
    y += lines.length * 12 + 10;
  };

  const writeComments = (comments: ReportComment[]) => {
    comments.forEach((comment) => {
      const header = `${safeValue(comment.author, 'Sistema')} | ${safeValue(comment.type, 'Geral')} | ${safeValue(comment.createdAt, '--')}`;
      const bodyLines = doc.splitTextToSize(safeValue(comment.text, 'Sem texto.'), contentWidth - 16);

      ensureSpace(14 + bodyLines.length * 12 + 6);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      setColor(colors.mutedText);
      doc.text(header, margin + 12, y);
      y += 11;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      setColor(colors.pageText);
      doc.text(bodyLines, margin + 12, y);
      y += bodyLines.length * 12 + 5;
    });
  };

  const writeListSections = (sections: ReportListSection[]) => {
    sections.forEach((section) => {
      writeSectionTitle(section.title);

      if (!section.items.length) {
        ensureSpace(16);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        setColor(colors.mutedText);
        doc.text(section.emptyMessage, margin, y);
        y += 18;
        return;
      }

      section.items.forEach((item, index) => {
        const fullTitle = `${index + 1}. ${item.code ? `[${item.code}] ` : ''}${safeValue(item.title, 'Sem titulo')}`;
        const titleLines = doc.splitTextToSize(fullTitle, contentWidth);

        ensureSpace(titleLines.length * 13 + 6);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        setColor(colors.pageText);
        doc.text(titleLines, margin, y);
        y += titleLines.length * 13 + 2;

        if (item.description) {
          const descriptionLines = doc.splitTextToSize(item.description, contentWidth - 8);
          ensureSpace(descriptionLines.length * 12 + 4);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(10);
          setColor(colors.pageText);
          doc.text(descriptionLines, margin + 8, y);
          y += descriptionLines.length * 12 + 2;
        }

        if (item.metadata?.length) {
          const metadataLines = doc.splitTextToSize(item.metadata.join(' | '), contentWidth - 8);
          ensureSpace(metadataLines.length * 11 + 4);
          doc.setFont('helvetica', 'italic');
          doc.setFontSize(9);
          setColor(colors.mutedText);
          doc.text(metadataLines, margin + 8, y);
          y += metadataLines.length * 11 + 2;
        }

        if (item.comments?.length) {
          ensureSpace(14);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(9);
          setColor(colors.sectionTitle);
          doc.text('Comentarios', margin + 8, y);
          y += 11;
          writeComments(item.comments);
        }

        y += 8;
      });
    });
  };

  drawHeader();
  writeSectionTitle('Resumo operacional');
  payload.summaryFields.forEach((field) => writeField(field.label, field.value));
  writeMetricLine(payload.metrics || []);

  if (payload.narrativeTitle) {
    writeNarrative(payload.narrativeTitle, payload.narrativeText || 'Sem registro para este item.');
  }

  if (payload.listSections?.length) {
    writeListSections(payload.listSections);
  }

  ensureSpace(24);
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(1);
  doc.line(margin, pageHeight - 56, pageWidth - margin, pageHeight - 56);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  setColor(colors.mutedText);
  doc.text(`Gerado automaticamente em ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, margin, pageHeight - 40);

  const fileId = sanitizeFileSegment(payload.reference || 'registro');
  const stamp = format(new Date(), 'yyyyMMdd-HHmm');
  doc.save(`${payload.filePrefix}-${fileId}-${stamp}.pdf`);
};

export const generateShiftClosureReportPdf = (data: ShiftClosureReportPayload) => {
  drawStandardPdf({
    title: 'Relatorio de Encerramento de Turno',
    subtitle: 'Padrao operacional de repasse',
    reference: safeValue(data.shiftId, 'turno'),
    filePrefix: 'relatorio-turno',
    summaryFields: [
      { label: 'Turno', value: safeValue(data.shiftId) },
      { label: 'Operador', value: safeValue(data.operator) },
      { label: 'Funcao', value: safeValue(data.role) },
      { label: 'Destino', value: safeValue(data.deskTarget) },
      { label: 'Status', value: safeValue(data.status) },
      { label: 'Periodo', value: `${safeValue(data.start)} - ${safeValue(data.end)}` },
      { label: 'Total trabalhado', value: safeValue(data.workedDuration, '--') },
    ],
    metrics: [
      { label: 'Pendencias resolvidas', value: String(data.resolvedItems.length) },
      { label: 'Pendencias repassadas', value: String(data.handoverItems.length) },
      {
        label: 'Pendencias totais no fechamento',
        value: String(data.resolvedItems.length + data.handoverItems.length),
      },
    ],
    narrativeTitle: 'Briefing final',
    narrativeText: safeValue(data.briefing, 'Sem briefing registrado.'),
    listSections: [
      {
        title: 'Pendencias resolvidas',
        emptyMessage: 'Nenhuma pendencia resolvida registrada.',
        items: data.resolvedItems.map((item) => ({
          code: safeValue(item.id, ''),
          title: safeValue(item.descricao, 'Item sem descricao'),
          metadata: [`Prioridade: ${safeValue(item.prioridade, '--')}`, 'Situacao: Resolvida'],
        })),
      },
      {
        title: 'Pendencias repassadas',
        emptyMessage: 'Nenhuma pendencia repassada para o proximo turno.',
        items: data.handoverItems.map((item) => ({
          code: safeValue(item.id, ''),
          title: safeValue(item.descricao, 'Item sem descricao'),
          metadata: [`Prioridade: ${safeValue(item.prioridade, '--')}`, 'Situacao: Repassada'],
        })),
      },
    ],
  });
};

export const generateShiftDetailReportPdf = (data: ShiftDetailReportPayload) => {
  drawStandardPdf({
    title: 'Relatorio de Detalhes do Turno',
    subtitle: 'Padrao operacional de acompanhamento',
    reference: safeValue(data.shiftId, 'turno'),
    filePrefix: 'detalhes-turno',
    summaryFields: [
      { label: 'Turno', value: safeValue(data.shiftId) },
      { label: 'Operador', value: safeValue(data.operator) },
      { label: 'Funcao', value: safeValue(data.role) },
      { label: 'Mesa', value: safeValue(data.desk, '--') },
      { label: 'Status', value: safeValue(data.status) },
      {
        label: 'Periodo',
        value: `${safeValue(data.start, '--')} - ${safeValue(data.end, '--')}`,
      },
      { label: 'Total trabalhado', value: safeValue(data.workedDuration, '--') },
    ],
    metrics: [
      { label: 'Ocorrencias totais', value: String(data.totalOccurrences) },
      { label: 'Ocorrencias em aberto', value: String(data.openOccurrences) },
      { label: 'Ocorrencias resolvidas', value: String(data.resolvedOccurrences) },
    ],
    narrativeTitle: 'Briefing final',
    narrativeText: safeValue(data.briefing, 'Nenhum briefing foi registrado para este turno.'),
    listSections: [
      {
        title: 'Ocorrencias do turno',
        emptyMessage: 'Nenhuma ocorrencia vinculada a este turno.',
        items: data.occurrences.map((occurrence) => ({
          code: safeValue(occurrence.id, ''),
          title: safeValue(occurrence.title, 'Ocorrencia sem titulo'),
          description: safeValue(occurrence.description, 'Sem observacao adicional.'),
          metadata: [
            `Categoria: ${safeValue(occurrence.category, '--')}`,
            `Prioridade: ${safeValue(occurrence.priority, '--')}`,
            `Status: ${safeValue(occurrence.status, '--')}`,
            `Origem: ${safeValue(occurrence.origin, '--')}`,
            `Criada em: ${safeValue(occurrence.createdAt, '--')}`,
            `Comentarios: ${String(occurrence.comments?.length || occurrence.commentsCount || 0)}`,
          ],
          comments: (occurrence.comments || [])
            .filter((comment) => safeValue(comment.text, '').length > 0)
            .map((comment) => ({
              author: safeValue(comment.author, 'Sistema'),
              type: safeValue(comment.type, 'Geral'),
              text: safeValue(comment.text, ''),
              createdAt: safeValue(comment.createdAt, '--'),
            })),
        })),
      },
    ],
  });
};

export const generateOccurrenceReportPdf = (data: OccurrenceReportPayload) => {
  drawStandardPdf({
    title: 'Relatorio de Ocorrencia',
    subtitle: 'Padrao operacional de ocorrencias',
    reference: safeValue(data.occurrenceId, 'ocorrencia'),
    filePrefix: 'relatorio-ocorrencia',
    summaryFields: [
      { label: 'Ocorrencia', value: safeValue(data.occurrenceId) },
      { label: 'Titulo', value: safeValue(data.title) },
      { label: 'Status', value: safeValue(data.status) },
      { label: 'Prioridade', value: safeValue(data.priority) },
      { label: 'Categoria', value: safeValue(data.category, '--') },
      { label: 'Criado em', value: safeValue(data.createdAt, '--') },
      { label: 'Criado por', value: safeValue(data.createdBy, '--') },
      { label: 'Localizacao', value: safeValue(data.location, '--') },
      { label: 'Vinculo', value: safeValue(data.linkedTo, 'Nenhum') },
      { label: 'Operador', value: safeValue(data.operatorEmail, '--') },
    ],
    metrics: [
      { label: 'Total de comentarios', value: String((data.comments || []).length) },
    ],
    narrativeTitle: 'Descricao da ocorrencia',
    narrativeText: safeValue(data.description, 'Sem descricao registrada.'),
    listSections: [
      {
        title: 'Comentarios e atualizacoes',
        emptyMessage: 'Nenhum comentario registrado para esta ocorrencia.',
        items: (data.comments || []).map((comment, index) => ({
          code: String(index + 1),
          title: safeValue(comment.type, 'Atualizacao'),
          description: safeValue(comment.text, 'Sem texto.'),
          metadata: [
            `Autor: ${safeValue(comment.author, 'Sistema')}`,
            `Data: ${safeValue(comment.createdAt, '--')}`,
          ],
        })),
      },
    ],
  });
};