import { Location } from '../entities/Location';

export interface ILocationRepository {
  upsertLocation(location: Location): Promise<{ isNew: boolean }>;
  getLocationIdByCode(code: string): Promise<number | null>;
  getLocationById(locationId: number): Promise<boolean>;
  getAllLocations(): Promise<Location[]>;
  updateOccupancy(accessPointId: number, eventType: 'ENTRADA' | 'SALIDA'): Promise<void>;
}
