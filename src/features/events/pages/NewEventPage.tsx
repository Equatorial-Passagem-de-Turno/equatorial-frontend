import { useState } from 'react';
import { OccurrenceForm } from '@/features/occurrences/components/OcurrenceForm';
import { CircuitSwitchingForm } from '@/features/circuit-switching/components/CircuitSwitchingForm';
import { UnavailableEquipmentForm } from '@/features/unavailable-equipment/components/UnavailableEquipmentForm';
import { EventTypeSelector, type EventType } from '../components/EventTypeSelector';

export const NewEventPage = () => {
  const [eventType, setEventType] = useState<EventType>('occurrence');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <div className="p-6 lg:p-8 max-w-5xl mx-auto">
        <div className="
          rounded-2xl p-8 shadow-sm backdrop-blur-xl border transition-colors duration-300
          bg-white border-slate-200
          dark:bg-slate-900/70 dark:border-slate-800 dark:shadow-2xl
        ">
          <div className="space-y-8">
            <EventTypeSelector value={eventType} onChange={setEventType} />

            <div className="border-t border-slate-200 dark:border-slate-800 pt-8">
              {eventType === 'occurrence' && <OccurrenceForm />}
              {eventType === 'circuit-switching' && <CircuitSwitchingForm />}
              {eventType === 'unavailable-equipment' && <UnavailableEquipmentForm />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
