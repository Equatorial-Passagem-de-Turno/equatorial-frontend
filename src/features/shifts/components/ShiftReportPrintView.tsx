import React from 'react';
import { format } from 'date-fns';
import type { Shift } from '../types/shift';

interface Props {
  turno: Shift;
  operatorEmail: string;
}

export const ShiftReportPrintView: React.FC<Props> = ({ turno, operatorEmail }) => {
  // Styles inline mantidos aqui por serem específicos para mídia de impressão
  return (
    <div className="print-container hidden">
      <style type="text/css" media="print">
        {`
          @page { size: A4; margin: 15mm; }
          html, body { background: white !important; height: auto !important; overflow: visible !important; }
          body * { visibility: hidden; }
          .print-container, .print-container * { visibility: visible; }
          .print-container { position: absolute !important; left: 0 !important; top: 0 !important; width: 100% !important; background-color: white; color: #334155; }
          .no-break { page-break-inside: avoid; }
        `}
      </style>

      <div className="p-4 bg-white">
        {/* Cabeçalho */}
        <div className="flex justify-between items-center mb-8 border-b-2 border-blue-600 pb-4">
          <div>
             <h1 className="text-2xl font-bold text-blue-600">GRUPO EQUATORIAL</h1>
          </div>
          <div className="text-right">
            <h2 className="text-lg font-bold text-blue-600 uppercase">Relatório de Turno</h2>
            <p className="text-sm text-slate-400 mt-1">{turno.data}</p>
          </div>
        </div>

        {/* Informações Básicas */}
        <div className="mb-6 no-break grid grid-cols-2 gap-4">
            <div><p className="text-[10px] text-slate-400 font-bold uppercase">ID</p><p className="font-bold">{turno.id}</p></div>
            <div><p className="text-[10px] text-slate-400 font-bold uppercase">Função</p><p className="font-bold">{turno.funcao}</p></div>
            <div><p className="text-[10px] text-slate-400 font-bold uppercase">Operador</p><p className="font-bold">{turno.operador}</p></div>
            <div><p className="text-[10px] text-slate-400 font-bold uppercase">Email</p><p className="font-bold">{operatorEmail}</p></div>
            <div className="col-span-2"><p className="text-[10px] text-slate-400 font-bold uppercase">Horário</p><p className="font-bold">{turno.inicio} às {turno.fim || format(new Date(), 'HH:mm')}</p></div>
        </div>

        {/* Briefing */}
        <div className="mb-8 no-break">
          <h3 className="text-sm font-bold text-blue-600 uppercase mb-3 border-b border-slate-200 pb-1">Briefing</h3>
          <div className="bg-slate-50 p-4 rounded border-l-4 border-slate-400 text-xs text-justify whitespace-pre-wrap">
            {turno.briefing || "Sem registro."}
          </div>
        </div>

        {/* Tabelas de Pendências (Simplificadas para brevidade) */}
        {/* ... Lógica de tabelas herdadas/deixadas aqui ... */}
        
        <div className="pt-8 text-center border-t border-slate-100 mt-8">
            <p className="text-[9px] text-slate-300">Gerado automaticamente pelo Sistema de Controle.</p>
        </div>
      </div>
    </div>
  );
};