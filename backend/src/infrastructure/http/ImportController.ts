import { Request, Response } from 'express';
import { ImportDataUseCase } from '../../application/use-cases/ImportDataUseCase';

export class ImportController {
  constructor(private importDataUseCase: ImportDataUseCase) {}

  public async importData(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({ error: 'Archivo no proporcionado. Se esperaba un archivo .xlsx' });
        return;
      }

      // El usuario debe mandar las hojas que quiere importar, ej: formData = { hojas: 'Empleados,Ubicaciones' }
      const hojasStr = req.body.hojas || '';
      const sheetsToImport = hojasStr.split(',').map((h: string) => h.trim()).filter(Boolean);

      if (sheetsToImport.length === 0) {
        res.status(400).json({ error: 'Debe especificar al menos una hoja a importar en el parametro "hojas". Ejemplo: "Empleados,Ubicaciones,Accesos"' });
        return;
      }

      const result = await this.importDataUseCase.execute(req.file.buffer, sheetsToImport);

      res.status(200).json({
        message: 'Importacion finalizada con exito',
        data: result
      });
    } catch (error: any) {
      res.status(500).json({
        error: 'Ocurrio un error interno durante la importacion',
        details: error.message
      });
    }
  }
}
