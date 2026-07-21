import { IEventRepository } from '../../domain/repositories/IEventRepository';

export class GetOccupancyUseCase {
  constructor(private eventRepository: IEventRepository) {}

  async execute(): Promise<any[]> {
    return this.eventRepository.getOccupancy();
  }
}
