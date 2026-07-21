export interface Location {
  locationId?: number;
  locationCode: string;
  name: string;
  type?: string | null;
  isActive: boolean;
  capacity?: number | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
}
