import { Person } from '../entities/Person';
import { Document } from '../entities/Document';

export interface IPersonRepository {
  upsertPerson(person: Person): Promise<{ personId: number; isNew: boolean }>;
  upsertDocument(personId: number, document: Omit<Document, 'personId'>): Promise<void>;
  getAllPersons(): Promise<Person[]>;
  getPersonIdByBiostarId(biostar_id: string): Promise<number | null>;
}
