import { Request, Response } from "express";
import { GetAllAccessPointsUseCase } from "../../application/use-cases/GetAllAccessPointsUseCase";

export class AccessPointController {
  constructor(private getAllAccessPointsUseCase: GetAllAccessPointsUseCase) {}

  public async getAllAccessPoints(req: Request, res: Response): Promise<void> {
    try {
      const accessPoints = await this.getAllAccessPointsUseCase.execute();
      res.status(200).json({
        message: 'Puntos de acceso obtenidos exitosamente',
        data: accessPoints
      });
    } catch (error: any) {
      res.status(500).json({
        error: 'Ocurrio un error interno durante la consulta de puntos de acceso.',
        details: error.message
      });
    }
  }
}
