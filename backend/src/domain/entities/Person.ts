import { Document } from './Document';

export interface Person {
  personId?: number;
  firstName: string;
  secondName?: string | null;
  firstLastName: string;
  secondLastName?: string | null;
  biostar_id: string;
  document?: Omit<Document, 'personId' | 'main'>;
}
