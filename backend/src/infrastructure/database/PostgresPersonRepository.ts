import { Pool, PoolClient } from 'pg';
import { IPersonRepository } from '../../domain/repositories/IPersonRepository';
import { Person } from '../../domain/entities/Person';
import { Document } from '../../domain/entities/Document';

export class PostgresPersonRepository implements IPersonRepository {
  constructor(private db: Pool | PoolClient ) {}

  async upsertPerson(person: Person): Promise<{ personId: number; isNew: boolean }> {
    // Check if it exists to know if it's new or updated (for the summary metrics)
    const checkQuery = `SELECT "personId" FROM "Person" WHERE "biostar_id" = $1`;
    const checkRes = await this.db.query(checkQuery, [person.biostar_id]);
    const isNew = checkRes.rowCount === 0;

    const query = `
      INSERT INTO "Person" ("firstName", "secondName", "firstLastName", "secondLastName", "biostar_id")
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT ("biostar_id") 
      DO UPDATE SET
        "firstName" = EXCLUDED."firstName",
        "secondName" = EXCLUDED."secondName",
        "firstLastName" = EXCLUDED."firstLastName",
        "secondLastName" = EXCLUDED."secondLastName"
      RETURNING "personId";
    `;
    const values = [
      person.firstName, 
      person.secondName || null, 
      person.firstLastName, 
      person.secondLastName || null, 
      person.biostar_id
    ];
    
    const res = await this.db.query(query, values);
    return { personId: res.rows[0].personId, isNew };
  }

  async upsertDocument(personId: number, doc: Omit<Document, 'personId'>): Promise<void> {
    const query = `
      INSERT INTO "Document" ("personId", "documentType", "documentNumber", "country", "main")
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT ("documentType", "documentNumber") 
      DO UPDATE SET 
        "personId" = EXCLUDED."personId",
        "country" = EXCLUDED."country",
        "main" = EXCLUDED."main"
    `;
    const values = [
      personId, 
      doc.documentType, 
      doc.documentNumber, 
      doc.country || null, 
      doc.main || false
    ];
    await this.db.query(query, values);
  }

  async getAllPersons(): Promise<Person[]> {
    const query = `
      SELECT p.*, 
             d."documentType", 
             d."documentNumber", 
             d."country" as "documentCountry", 
             d."main" as "documentMain"
      FROM "Person" p
      LEFT JOIN "Document" d ON p."personId" = d."personId" AND d."main" = true;
    `;
    const res = await this.db.query(query);
    
    return res.rows.map(row => {
      const person: Person = {
        personId: row.personId,
        firstName: row.firstName,
        secondName: row.secondName,
        firstLastName: row.firstLastName,
        secondLastName: row.secondLastName,
        biostar_id: row.biostar_id,
      };
      if (row.documentType) {
        person.document = {
          documentType: row.documentType,
          documentNumber: row.documentNumber,
          country: row.documentCountry
        };
      }
      return person;
    });
  }

  async getPersonIdByBiostarId(biostar_id: string): Promise<number | null> {
    const query = `SELECT "personId" FROM "Person" WHERE "biostar_id" = $1`;
    const res = await this.db.query(query, [biostar_id]);
    if (res.rowCount === 0) return null;
    return res.rows[0].personId;
  }
}
