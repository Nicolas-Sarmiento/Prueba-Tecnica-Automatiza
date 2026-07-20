export interface Document {
  documentId?: number;
  personId?: number;
  documentType: string;
  documentNumber: string;
  country?: string | null;
  main: boolean;
}
