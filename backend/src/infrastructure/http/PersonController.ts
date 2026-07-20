import { Request, Response } from "express";
import { GetAllPersonsUseCase } from "../../application/use-cases/GetAllPersonsUseCase";

export class PersonController {
  constructor(private getAllPersonsUseCase: GetAllPersonsUseCase) {}

  public async getAllPersons(req: Request, res: Response): Promise<void> {
    try {
      const persons = await this.getAllPersonsUseCase.execute();
      res.status(200).json({
        message: 'Personas obtenidas exitosamente',
        data: persons
      });
    } catch (error: any) {
      res.status(500).json({
        error: 'Ocurrio un error interno durante la consulta.',
        details: error.message
      });
    }
  }
}