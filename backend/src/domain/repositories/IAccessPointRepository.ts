import { AccessPoint } from '../entities/AccessPoint';

export interface IAccessPointRepository {
  upsertAccessPoint(accessPoint: AccessPoint): Promise<{ isNew: boolean }>;
  getAllAccessPoints(): Promise<AccessPoint[]>;
  getAccessPointIdByBiostarId(biostar_id: string): Promise<number | null>;
}
