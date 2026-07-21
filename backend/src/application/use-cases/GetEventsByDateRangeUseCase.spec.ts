import { GetEventsByDateRangeUseCase } from './GetEventsByDateRangeUseCase';
import { IEventRepository } from '../../domain/repositories/IEventRepository';
import { ILocationRepository } from '../../domain/repositories/ILocationRepository';

describe('GetEventsByDateRangeUseCase', () => {
  let getEventsUseCase: GetEventsByDateRangeUseCase;
  let mockEventRepository: jest.Mocked<IEventRepository>;
  let mockLocationRepository: jest.Mocked<ILocationRepository>;

  beforeEach(() => {
    mockEventRepository = {
      getEventsByDateRange: jest.fn(),
    } as unknown as jest.Mocked<IEventRepository>;

    mockLocationRepository = {
      getLocationById: jest.fn(),
    } as unknown as jest.Mocked<ILocationRepository>;

    getEventsUseCase = new GetEventsByDateRangeUseCase(mockEventRepository, mockLocationRepository);
  });

  it('debería retornar eventos si la ubicación existe', async () => {
    // Arrange
    const startDate = new Date('2026-07-01');
    const endDate = new Date('2026-07-20');
    const locationId = 1;
    const fakeEvents = [{ eventId: 1, type: 'ENTRADA' }];
    
    mockLocationRepository.getLocationById.mockResolvedValue({ id: 1 } as any);
    mockEventRepository.getEventsByDateRange.mockResolvedValue(fakeEvents);

    // Act
    const result = await getEventsUseCase.execute(startDate, endDate, locationId);

    // Assert
    expect(result).toEqual(fakeEvents);
    expect(mockLocationRepository.getLocationById).toHaveBeenCalledWith(locationId);
    expect(mockEventRepository.getEventsByDateRange).toHaveBeenCalledWith(startDate, endDate, locationId);
  });

  it('debería lanzar un error si la ubicación no existe', async () => {
    const startDate = new Date('2026-07-01');
    const endDate = new Date('2026-07-20');
    const locationId = 99;

    mockLocationRepository.getLocationById.mockResolvedValue(null);

    await expect(getEventsUseCase.execute(startDate, endDate, locationId))
      .rejects.toThrow(`La ubicación con ID 99 no existe.`);
      
    expect(mockEventRepository.getEventsByDateRange).not.toHaveBeenCalled();
  });
});
