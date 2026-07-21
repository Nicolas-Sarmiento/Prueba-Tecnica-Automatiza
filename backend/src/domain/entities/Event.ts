export interface Event {
  eventId?: number;
  accessPointId: number;
  personId: number;
  timestamp: Date;
  eventType: 'ENTRADA' | 'SALIDA';
  biostar_eventId: string;
}
