import { UnavailableEquipmentForm } from '../components/UnavailableEquipmentForm';

export const UnavailableEquipmentPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <div className="p-6 lg:p-8 max-w-5xl mx-auto">
        <div className="
          rounded-2xl p-8 shadow-sm backdrop-blur-xl border transition-colors duration-300
          bg-white border-slate-200
          dark:bg-slate-900/70 dark:border-slate-800 dark:shadow-2xl
        ">
          <UnavailableEquipmentForm />
        </div>
      </div>
    </div>
  );
};
