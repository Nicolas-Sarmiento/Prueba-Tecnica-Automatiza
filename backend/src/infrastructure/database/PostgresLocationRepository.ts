import { PoolClient, Pool } from 'pg';
import { ILocationRepository } from '../../domain/repositories/ILocationRepository';
import { Location } from '../../domain/entities/Location';

export class PostgresLocationRepository implements ILocationRepository {
  constructor(private client: Pool |  PoolClient) {}

  async upsertLocation(location: Location): Promise<{ isNew: boolean }> {
    const checkQuery = `SELECT "locationId" FROM "Location" WHERE "locationCode" = $1`;
    const checkRes = await this.client.query(checkQuery, [location.locationCode]);
    const isNew = checkRes.rowCount === 0;

    const query = `
      INSERT INTO "Location" ("locationCode", "name", "type", "isActive", "capacity", "address", "city", "country")
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT ("locationCode") 
      DO UPDATE SET
        "name" = EXCLUDED."name",
        "type" = EXCLUDED."type",
        "isActive" = EXCLUDED."isActive",
        "capacity" = EXCLUDED."capacity",
        "address" = EXCLUDED."address",
        "city" = EXCLUDED."city",
        "country" = EXCLUDED."country"
    `;
    const values = [
      location.locationCode,
      location.name,
      location.type || null,
      location.isActive !== undefined ? location.isActive : true,
      location.capacity || null,
      location.address || null,
      location.city || null,
      location.country || null
    ];
    
    await this.client.query(query, values);
    return { isNew };
  }

  async getLocationIdByCode(code: string): Promise<number | null> {
    const query = `SELECT "locationId" FROM "Location" WHERE "locationCode" = $1`;
    const res = await this.client.query(query, [code]);
    if (res.rowCount === 0) return null;
    return res.rows[0].locationId;
  }
  async getLocationById(locationId: number): Promise<boolean> {
    const query = `SELECT "locationId" FROM "Location" WHERE "locationId" = $1`;
    const res = await this.client.query(query, [locationId]);
    return res.rowCount !== null && res.rowCount > 0;
  }

  async getAllLocations(): Promise<Location[]> {
    const query = `SELECT * FROM "Location"`;
    const res = await this.client.query(query);
    return res.rows.map((row: any) => ({
      locationId: row.locationId,
      locationCode: row.locationCode,
      name: row.name,
      type: row.type,
      isActive: row.isActive,
      capacity: row.capacity,
      address: row.address,
      city: row.city,
      country: row.country,
    }));
  }

  async updateOccupancy(accessPointId: number, eventType: 'ENTRADA' | 'SALIDA'): Promise<void> {
    const increment = eventType === 'ENTRADA' ? 1 : -1;
    const query = `
      UPDATE "Location"
      SET "occupancyLevel" = GREATEST(0, "occupancyLevel" + $1)
      WHERE "locationId" = (
        SELECT "locationId" FROM "AccessPoint" WHERE "accessPointId" = $2
      )
    `;
    await this.client.query(query, [increment, accessPointId]);
  }
}
