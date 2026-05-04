export interface CircuitDeadlineEntry {
  id: string;
  value: string;
  reason: string;
  registeredAt: string;
}

export interface CircuitAttachment {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'pdf' | 'video' | 'document';
}

export interface CircuitSwitchingRecord {
  id: string;
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
