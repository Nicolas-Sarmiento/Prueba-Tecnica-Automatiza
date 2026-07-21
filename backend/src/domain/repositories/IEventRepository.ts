import { Event } from '../entities/Event';

export interface IEventRepository {
  upsertEvent(event: Event): Promise<{ isNew: boolean }>;
  getLatestEventTimestamp(): Promise<Date | null>;
  getOccupancy(): Promise<any[]>;
  getEventsByDateRange(startDate: Date, endDate: Date, locationId: number): Promise<any[]>;
  getLastPersonEventTypeAtLocation(personId: number, locationId: number): Promise<'ENTRADA' | 'SALIDA' | null>;
}
