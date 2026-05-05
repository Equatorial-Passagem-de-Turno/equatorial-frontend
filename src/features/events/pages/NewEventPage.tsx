import { useState } from 'react';
import { OccurrenceForm } from '@/features/occurrences/components/OcurrenceForm';
import { CircuitSwitchingForm } from '@/features/circuit-switching/components/CircuitSwitchingForm';
import { UnavailableEquipmentForm } from '@/features/unavailable-equipment/components/UnavailableEquipmentForm';
import { EventTypeSelector, type EventType } from '../components/EventTypeSelector';

export const NewEventPage = () => {
  const [eventType, setEventType] = useState<EventType>('occurrence');

  return (
    <div className="eq-page">
      <div className="eq-form-container">
        <div className="eq-surface p-8 backdrop-blur-xl">
          <div className="space-y-8">
            <EventTypeSelector value={eventType} onChange={setEventType} />

            <div className="eq-section-divider">
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
