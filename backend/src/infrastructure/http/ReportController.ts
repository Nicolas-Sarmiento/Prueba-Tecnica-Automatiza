import { Request, Response } from 'express';
import { GetOccupancyUseCase } from '../../application/use-cases/GetOccupancyUseCase';
import { GetEventsByDateRangeUseCase } from '../../application/use-cases/GetEventsByDateRangeUseCase';

export class ReportController {
  constructor(
    private getOccupancyUseCase: GetOccupancyUseCase,
    private getEventsByDateRangeUseCase: GetEventsByDateRangeUseCase
  ) {}

  async getOccupancy(req: Request, res: Response) {
    try {
      const data = await this.getOccupancyUseCase.execute();
      res.status(200).json(data);
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  }

  async getEventsByDateRange(req: Request, res: Response) {
    try {
      const { startDate, endDate, locationId } = req.query;
      if (!startDate || !endDate || !locationId) {
        return res.status(400).json({ error: 'startDate, endDate, y locationId son parámetros requeridos.' });
      }

      const locId = parseInt(locationId as string, 10);
      if (isNaN(locId)) {
        return res.status(400).json({ error: 'locationId debe ser un número válido.' });
      }

      const data = await this.getEventsByDateRangeUseCase.execute(
        new Date(startDate as string),
        new Date(endDate as string),
        locId
      );
      res.status(200).json(data);
    } catch (error: any) {
      console.error(error);
      if (error.message.includes('no existe')) {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  }
}
