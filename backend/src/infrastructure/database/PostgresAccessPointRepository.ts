import { Pool, PoolClient } from 'pg';
import { IAccessPointRepository } from '../../domain/repositories/IAccessPointRepository';
import { AccessPoint } from '../../domain/entities/AccessPoint';

export class PostgresAccessPointRepository implements IAccessPointRepository {
  constructor(private db: Pool | PoolClient) {}

  async upsertAccessPoint(accessPoint: AccessPoint): Promise<{ isNew: boolean }> {
    const checkQuery = `SELECT "accessPointId" FROM "AccessPoint" WHERE "biostar_id" = $1`;
    const checkRes = await this.db.query(checkQuery, [accessPoint.biostar_id]);
    const isNew = checkRes.rowCount === 0;

    const query = `
      INSERT INTO "AccessPoint" ("biostar_id", "locationId", "name")
      VALUES ($1, $2, $3)
      ON CONFLICT ("biostar_id") 
      DO UPDATE SET 
        "locationId" = EXCLUDED."locationId",
        "name" = EXCLUDED."name"
    `;
    const values = [accessPoint.biostar_id, accessPoint.locationId, accessPoint.name];
    await this.db.query(query, values);
    
    return { isNew };
  }

  async getAllAccessPoints(): Promise<AccessPoint[]> {
    const query = `
      SELECT ap.*, l."name" as "locationName" 
      FROM "AccessPoint" ap
      LEFT JOIN "Location" l ON ap."locationId" = l."locationId"
    `;
    const res = await this.db.query(query);
    return res.rows.map(row => ({
      accessPointId: row.accessPointId,
      biostar_id: row.biostar_id,
      locationId: row.locationId,
      name: row.name,
      locationName: row.locationName // opcional, super util para el frontend
    }));
  }

  async getAccessPointIdByBiostarId(biostar_id: string): Promise<number | null> {
    const query = `SELECT "accessPointId" FROM "AccessPoint" WHERE "biostar_id" = $1`;
    const res = await this.db.query(query, [biostar_id]);
    if (res.rowCount === 0) return null;
    return res.rows[0].accessPointId;
  }

  async getLocationIdByAccessPointId(accessPointId: number): Promise<number | null> {
    const query = `SELECT "locationId" FROM "AccessPoint" WHERE "accessPointId" = $1`;
    const res = await this.db.query(query, [accessPointId]);
    if (res.rowCount === 0) return null;
    return res.rows[0].locationId;
  }
}
