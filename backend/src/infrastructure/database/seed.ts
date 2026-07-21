import fs from 'fs';
import path from 'path';
import { Database } from './Database';
import { ImportDataUseCase } from '../../application/use-cases/ImportDataUseCase';
import { ExcelParserService } from '../services/ExcelParserService';

async function seed() {
  console.log('Iniciando poblado de base de datos...');
  
  const possiblePaths = [
    path.resolve(process.cwd(), 'data.xlsx'),
    path.resolve(__dirname, '../../../../data.xlsx')
  ];

  let targetPath = possiblePaths.find(p => fs.existsSync(p));

  if (!targetPath) {
    console.error(`No se encontro el archivo data.xlsx en las rutas: ${possiblePaths.join(', ')}`);
    process.exit(1);
  }

  try {
    const fileBuffer = fs.readFileSync(targetPath);
    const excelParser = new ExcelParserService();
    const useCase = new ImportDataUseCase(excelParser);
    const sheets = ['Ubicaciones', 'Empleados', 'Accesos'];
    const result = await useCase.execute(fileBuffer, sheets);
    
    console.log('Seeding exitoso. Resumen:');
    console.log(JSON.stringify(result.summary, null, 2));

    if (result.errors.length > 0) {
      console.log(`Hubo ${result.errors.length} errores de validacion de filas (omitidos).`);
    }
  } catch (error) {
    console.error('Error critico durante el seeding:', error);
  } finally {
    process.exit(0);
  }
}

seed();
