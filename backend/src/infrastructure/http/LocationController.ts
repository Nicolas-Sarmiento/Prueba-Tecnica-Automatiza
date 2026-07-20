import { Request, Response } from "express";
import { GetAllLocationsUseCase } from "../../application/use-cases/GetAllLocationsUseCase";

export class LocationController {
  constructor(private getAllLocationsUseCase: GetAllLocationsUseCase) {}

  public async getAllLocations(req: Request, res: Response): Promise<void> {
    try {
      const locations = await this.getAllLocationsUseCase.execute();
      res.status(200).json({
        message: 'Ubicaciones obtenidas exitosamente',
        data: locations
      });
    } catch (error: any) {
      res.status(500).json({
        error: 'Ocurrio un error interno durante la consulta de ubicaciones.',
        details: error.message
      });
    }
  }
}
