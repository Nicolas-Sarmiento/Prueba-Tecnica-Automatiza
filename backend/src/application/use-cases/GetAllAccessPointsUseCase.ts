import { IAccessPointRepository } from "../../domain/repositories/IAccessPointRepository";
import { AccessPoint } from "../../domain/entities/AccessPoint";

export class GetAllAccessPointsUseCase {
    constructor(
        private accessPointRepository: IAccessPointRepository
    ) {}

    async execute(): Promise<AccessPoint[]> {
        return this.accessPointRepository.getAllAccessPoints();
    }
}
