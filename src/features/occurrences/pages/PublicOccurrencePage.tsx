import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PublicOccurrenceForm } from '../components/PublicOccurrenceForm';

export const PublicOccurrencePage = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f3f6ff] text-slate-900 selection:bg-emerald-200 selection:text-emerald-900 dark:bg-[#070b18] dark:text-slate-100 [font-family:'Poppins',sans-serif]">
      <div
        className="pointer-events-none absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/moks/login-bg.jpg')" }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[#070b18]/55 backdrop-blur-[1px] dark:bg-[#070b18]/72" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_18%,rgba(16,185,129,0.24),transparent_34%),radial-gradient(circle_at_88%_10%,rgba(5,150,105,0.24),transparent_38%),radial-gradient(circle_at_72%_92%,rgba(13,148,136,0.2),transparent_45%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-45 dark:opacity-20 bg-[linear-gradient(to_right,rgba(100,116,139,0.16)_1px,transparent_1px),linear-gradient(to_bottom,rgba(100,116,139,0.16)_1px,transparent_1px)] bg-[size:30px_30px]" />

      <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl items-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="w-full">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-600 shadow-md shadow-emerald-200/40 backdrop-blur transition hover:-translate-y-0.5 hover:border-emerald-400 hover:text-emerald-700 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao login
          </button>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.2fr]">
            <div className="rounded-[30px] border border-white/60 bg-white/70 p-6 shadow-[0_24px_70px_rgba(6,95,70,0.2)] backdrop-blur dark:border-emerald-900/30 dark:bg-slate-900/60 dark:shadow-[0_24px_70px_rgba(2,6,23,0.85)] sm:p-8">
              <p className="text-xs font-extrabold uppercase tracking-[0.28em] text-emerald-600 dark:text-emerald-300">
                Ocorrência externa
              </p>
              <h1 className="mt-3 text-3xl font-black leading-tight text-slate-900 dark:text-white sm:text-4xl">
                Registre sua ocorrência
                <span className="mt-2 block text-emerald-600 dark:text-emerald-400">
                  sem precisar de acesso ao sistema
                </span>
              </h1>
              <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                Suas informações serão encaminhadas diretamente para a supervisão, que fará o direcionamento da mesa responsável.
              </p>

              <div className="mt-6 rounded-2xl border border-emerald-200/70 bg-emerald-50/80 p-4 text-sm text-emerald-800 shadow-sm dark:border-emerald-900/40 dark:bg-emerald-900/20 dark:text-emerald-200">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600/10 text-emerald-600 dark:text-emerald-300">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-semibold">Atendimento assistido</p>
                    <p className="mt-1 text-xs text-emerald-700/80 dark:text-emerald-200/80">
                      Se preferir, informe um contato para que a equipe possa retornar com atualizações.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[30px] border border-slate-200/80 bg-white/90 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.2)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/75 dark:shadow-[0_24px_70px_rgba(2,6,23,0.8)] sm:p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Dados da ocorrência</h2>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">
                  Informe apenas o essencial. Campos marcados com * são obrigatórios.
                </p>
              </div>

              <PublicOccurrenceForm onSuccess={() => navigate('/')} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
