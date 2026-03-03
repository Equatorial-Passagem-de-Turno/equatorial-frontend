import React from 'react';
import type { Occurrence } from '../types/index';

export const OccurrenceReportPrintView: React.FC<{ occurrence: Occurrence; operatorEmail?: string }> = ({ occurrence, operatorEmail }) => {
  return (
    <div className="print-container hidden">
      <style type="text/css" media="print">
        {`
          @page { size: A4; margin: 15mm 15mm 15mm 15mm; }
          html, body { height: auto !important; overflow: visible !important; background: white !important; }
          body * { visibility: hidden; }
          .print-container, .print-container * { visibility: visible; }
          .print-container { position: absolute !important; left: 0 !important; top: 0 !important; width: 100% !important; margin: 0 !important; padding: 0 !important; display: block !important; background-color: white; font-family: ui-sans-serif, system-ui, sans-serif; color: #0f172a; }
          .no-break { page-break-inside: avoid; break-inside: avoid; }
          .quebra-pagina { page-break-before: always; break-before: page; display: block; height: 0; width: 100%; visibility: hidden; }
          h1,h2,h3,p,table { color: #0f172a; }
        `}
      </style>

      <div className="p-4 bg-white">
        <div className="flex justify-between items-center mb-6 border-b-2 border-blue-600 pb-3">
          <div>
            <img src="/logo-pdf.png" alt="Grupo Equatorial Energia" style={{ width: 220, objectFit: 'contain' }} onError={(e)=>{ (e.currentTarget as HTMLImageElement).style.display='none'; }} />
          </div>
          <div className="text-right">
            <h2 style={{ color: '#2563eb', textTransform: 'uppercase', margin: 0 }}>Relatório de Ocorrência</h2>
            <p style={{ margin: 0, color: '#475569' }}>{new Date().toLocaleString()}</p>
          </div>
        </div>

        <section style={{ marginBottom: 18 }}>
          <h3 style={{ color: '#2563eb', marginBottom: 8, textTransform: 'uppercase', fontSize: 12 }}>Informações da Ocorrência</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div>
              <p style={{ fontSize: 10, color: '#94a3b8', margin: 0 }}>ID</p>
              <p style={{ margin: '6px 0', fontWeight: 700 }}>{occurrence.id}</p>
            </div>
            <div>
              <p style={{ fontSize: 10, color: '#94a3b8', margin: 0 }}>Prioridade / Status</p>
              <p style={{ margin: '6px 0', fontWeight: 700 }}>{occurrence.priority} / {occurrence.status}</p>
            </div>
            <div>
              <p style={{ fontSize: 10, color: '#94a3b8', margin: 0 }}>Criado em</p>
              <p style={{ margin: '6px 0', fontWeight: 700 }}>{new Date(occurrence.createdAt).toLocaleString()}</p>
            </div>
            <div>
              <p style={{ fontSize: 10, color: '#94a3b8', margin: 0 }}>Criado por</p>
              <p style={{ margin: '6px 0', fontWeight: 700 }}>{occurrence.createdBy}</p>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <p style={{ fontSize: 10, color: '#94a3b8', margin: 0 }}>Localização</p>
              <p style={{ margin: '6px 0', fontWeight: 700 }}>
                {typeof occurrence.location === 'string' 
                  ? occurrence.location 
                  : occurrence.location 
                    ? `${occurrence.location.city}, ${occurrence.location.state}` 
                    : '—'}
              </p>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <p style={{ fontSize: 10, color: '#94a3b8', margin: 0 }}>Vínculo</p>
              <p style={{ margin: '6px 0', fontWeight: 700 }}>{occurrence.linkType ? `${occurrence.linkType} • ${occurrence.linkValue}` : 'Nenhum'}</p>
            </div>
          </div>
        </section>

        <section style={{ marginBottom: 18 }}>
          <h3 style={{ color: '#2563eb', marginBottom: 8, textTransform: 'uppercase', fontSize: 12 }}>Descrição</h3>
          <div style={{ background: '#f8fafc', padding: 12, borderLeft: '4px solid #cbd5e1' }}>
            <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{occurrence.description}</p>
          </div>
        </section>

        {occurrence.comments && occurrence.comments.length > 0 && (
          <section style={{ marginBottom: 18 }}>
            <h3 style={{ color: '#2563eb', marginBottom: 8, textTransform: 'uppercase', fontSize: 12 }}>Comentários / Atualizações</h3>
            <div>
              {occurrence.comments.map((c) => (
                <div key={c.id} style={{ marginBottom: 10, padding: 10, background: '#fff', border: '1px solid #e6edf3', borderRadius: 6 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <strong style={{ fontSize: 12 }}>{c.author}</strong>
                    <span style={{ fontSize: 11, color: '#64748b' }}>{new Date(c.createdAt).toLocaleString()}</span>
                  </div>
                  <div style={{ fontSize: 12, color: '#0f172a', whiteSpace: 'pre-wrap' }}>{c.text}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        <div style={{ borderTop: '1px solid #e6edf3', paddingTop: 12, textAlign: 'center', fontSize: 10, color: '#94a3b8' }}>
          <div>Relatório gerado pelo Sistema de Controle Operacional Equatorial</div>
          <div>Operador: {operatorEmail ?? '—'}</div>
          <div>© {new Date().getFullYear()} Grupo Equatorial Energia</div>
        </div>
      </div>
    </div>
  );
};

export default OccurrenceReportPrintView;