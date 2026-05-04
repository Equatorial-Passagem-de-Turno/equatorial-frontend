import type { CircuitAttachment, CircuitDeadlineEntry } from '@/features/circuit-switching/types';

export interface UnavailableEquipmentRecord {
  id: string;
  equipmentNumber: string;
  equipmentType: string;
  feeder: string;
  equipment: string;
  affectedCustomers: string;
  responsibleSector: string;
  currentDeadline: string;
  deadlineHistory: CircuitDeadlineEntry[];
  description?: string;
  observations: string;
  cause: string;
  attachments: CircuitAttachment[];
  createdBy?: string;
  authorId?: string | number;
  createdAt: string;
}
