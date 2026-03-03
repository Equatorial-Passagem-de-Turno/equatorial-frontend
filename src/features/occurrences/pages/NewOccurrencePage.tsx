import { OccurrenceForm } from '../components/OcurrenceForm';

export const NewOccurrencePage = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      
      <div className="p-6 lg:p-8 max-w-5xl mx-auto">
        <div className="
          rounded-2xl p-8 shadow-sm backdrop-blur-xl border transition-colors duration-300
          
          /* Light Mode */
          bg-white border-slate-200
          
          /* Dark Mode */
          dark:bg-slate-900/70 dark:border-slate-800 dark:shadow-2xl
        ">
          <OccurrenceForm />
        </div>
      </div>
    </div>
  );
};