import { IPersonRepository } from '../../domain/repositories/IPersonRepository';
import { Person } from '../../domain/entities/Person';

export class GetAllPersonsUseCase {
  constructor(private personRepository: IPersonRepository) {}

  async execute(): Promise<Person[]> {
    return this.personRepository.getAllPersons();
  }
}