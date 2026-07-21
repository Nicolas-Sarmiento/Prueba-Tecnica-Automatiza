import { IEventRepository } from '../../domain/repositories/IEventRepository';
import { ILocationRepository } from '../../domain/repositories/ILocationRepository';

export class GetEventsByDateRangeUseCase {
  constructor(
    private eventRepository: IEventRepository,
    private locationRepository: ILocationRepository
  ) {}

  async execute(startDate: Date, endDate: Date, locationId: number): Promise<any[]> {
    const locationExists = await this.locationRepository.getLocationById(locationId);
    if (!locationExists) {
      throw new Error(`La ubicación con ID ${locationId} no existe.`);
    }
    return this.eventRepository.getEventsByDateRange(startDate, endDate, locationId);
  }
}
