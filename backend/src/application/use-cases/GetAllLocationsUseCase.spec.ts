import { GetAllLocationsUseCase } from './GetAllLocationsUseCase';
import { ILocationRepository } from '../../domain/repositories/ILocationRepository';
import { Location } from '../../domain/entities/Location';

describe('GetAllLocationsUseCase', () => {
  let getAllLocationsUseCase: GetAllLocationsUseCase;
  let mockLocationRepository: jest.Mocked<ILocationRepository>;

  beforeEach(() => {
    mockLocationRepository = {
      getAllLocations: jest.fn(),
    } as unknown as jest.Mocked<ILocationRepository>;

    getAllLocationsUseCase = new GetAllLocationsUseCase(mockLocationRepository);
  });

  it('debería delegar al repositorio para obtener todas las ubicaciones', async () => {
    const fakeLocations: Location[] = [
      { id: 1, locationCode: 'LOC1', name: 'Sede Principal', type: 'SEDE', city: 'Bogotá', country: 'Colombia', isActive: true }
    ];
    mockLocationRepository.getAllLocations.mockResolvedValue(fakeLocations);

    const result = await getAllLocationsUseCase.execute();

    expect(result).toEqual(fakeLocations);
    expect(mockLocationRepository.getAllLocations).toHaveBeenCalledTimes(1);
  });
});
