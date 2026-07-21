import { PoolClient, Pool } from 'pg';
import { IEventRepository } from '../../domain/repositories/IEventRepository';
import { Event } from '../../domain/entities/Event';

export class PostgresEventRepository implements IEventRepository {
  constructor(private client: Pool | PoolClient) {}

  async upsertEvent(event: Event): Promise<{ isNew: boolean }> {
    const query = `
      INSERT INTO "Event" ("accessPointId", "personId", "timestamp", "eventType", "biostar_eventId")
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT ("biostar_eventId") DO NOTHING
    `;
    const values = [
      event.accessPointId,
      event.personId,
      event.timestamp,
      event.eventType,
      event.biostar_eventId
    ];
    const res = await this.client.query(query, values);
    return { isNew: res.rowCount !== null && res.rowCount > 0 };
  }

  async getLatestEventTimestamp(): Promise<Date | null> {
    const query = `SELECT MAX("timestamp") as "latest" FROM "Event"`;
    const res = await this.client.query(query);
    if (res.rowCount === 0 || !res.rows[0].latest) return null;
    return res.rows[0].latest;
  }

  async getOccupancy(): Promise<any[]> {
    // Occupancy level can be tracked by 'Location' entity.
    // We update Location's occupancyLevel based on events, or we can just calculate it from events directly.
    // The requirement says: "ocupación casi en tiempo real de cada ubicación, para eso es el atributo occupancyLevel".
    // This implies we should fetch the `occupancyLevel` from `Location`.
    const query = `
      SELECT "locationId", "name", "locationCode", "capacity", "occupancyLevel"
      FROM "Location"
      WHERE "type" = 'EDIFICIO' OR "type" = 'SEDE' OR "type" = 'PISO' OR "type" = 'OFICINA' OR "type" = 'ZONA'
    `;
    const res = await this.client.query(query);
    return res.rows;
  }

  async getEventsByDateRange(startDate: Date, endDate: Date, locationId: number): Promise<any[]> {
    const query = `
      SELECT e."eventId", e."timestamp", e."eventType", e."biostar_eventId",
             p."firstName", p."firstLastName", p."biostar_id" as "person_biostar_id",
             d."documentType", d."documentNumber",
             a."name" as "accessPointName", l."name" as "locationName"
      FROM "Event" e
      JOIN "Person" p ON e."personId" = p."personId"
      LEFT JOIN "Document" d ON p."personId" = d."personId" AND d."main" = true
      JOIN "AccessPoint" a ON e."accessPointId" = a."accessPointId"
      JOIN "Location" l ON a."locationId" = l."locationId"
      WHERE e."timestamp" >= $1 AND e."timestamp" <= $2 AND l."locationId" = $3
      ORDER BY e."timestamp" DESC
    `;
    const res = await this.client.query(query, [startDate, endDate, locationId]);
    return res.rows;
  }

  async getLastPersonEventTypeAtLocation(personId: number, locationId: number): Promise<'ENTRADA' | 'SALIDA' | null> {
    const query = `
      SELECT e."eventType"
      FROM "Event" e
      JOIN "AccessPoint" a ON e."accessPointId" = a."accessPointId"
      WHERE e."personId" = $1 AND a."locationId" = $2
      ORDER BY e."timestamp" DESC
      LIMIT 1
    `;
    const res = await this.client.query(query, [personId, locationId]);
    if (res.rowCount === 0) return null;
    return res.rows[0].eventType as 'ENTRADA' | 'SALIDA';
  }
}
