import { Database } from '../../infrastructure/database/Database';
import { ExcelParserService, ExcelRow } from '../../infrastructure/services/ExcelParserService';
import { PostgresLocationRepository } from '../../infrastructure/database/PostgresLocationRepository';
import { PostgresPersonRepository } from '../../infrastructure/database/PostgresPersonRepository';
import { PostgresAccessPointRepository } from '../../infrastructure/database/PostgresAccessPointRepository';
import { normalizeText } from '../utils/Normalizer';
import { ILocationRepository } from '../../domain/repositories/ILocationRepository';
import { IPersonRepository } from '../../domain/repositories/IPersonRepository';
import { IAccessPointRepository } from '../../domain/repositories/IAccessPointRepository';

export interface ImportError {
  sheet: string;
  row: number;
  reason: string;
}

export type ImportSummary = Record<string, { created: number; updated: number; rejected: number }>;

/**
 * Caso de uso encargado de la importación masiva de datos desde archivos Excel.
 *
 * Utiliza transacciones de base de datos (SAVEPOINTs) para asegurar que 
 * la importación sea parcialmente resiliente: si falla una fila, la transacción 
 * completa no se aborta, permitiendo insertar los registros correctos.
 */
export class ImportDataUseCase {
  constructor(private excelParser: ExcelParserService) {}

  /**
   * Ejecuta la lectura e inserción de datos de las hojas de Excel.
   * 
   * @param fileBuffer - El buffer de memoria que contiene el archivo Excel.
   * @param sheetsToImport - Arreglo con los nombres de las hojas que se desean importar.
   * @returns Resumen de creación/actualización/rechazo y lista detallada de errores por fila.
   */
  async execute(fileBuffer: Buffer, sheetsToImport: string[]) {
    const data = this.excelParser.parse(fileBuffer);
    const summary: ImportSummary = {};
    const errors: ImportError[] = [];

    const client = await Database.getClient();
    
    try {
      await client.query('BEGIN');

      const locationRepo: ILocationRepository = new PostgresLocationRepository(client);
      const personRepo: IPersonRepository = new PostgresPersonRepository(client);
      const accessPointRepo: IAccessPointRepository = new PostgresAccessPointRepository(client);

      if (sheetsToImport.includes('Ubicaciones') && data['Ubicaciones']) {
        await this.processLocations(client, data['Ubicaciones'], locationRepo, summary, errors);
      }

      if (sheetsToImport.includes('Empleados') && data['Empleados']) {
        await this.processEmployees(client, data['Empleados'], personRepo, summary, errors);
      }

      if (sheetsToImport.includes('Accesos') && data['Accesos']) {
        await this.processAccessPoints(client, data['Accesos'], accessPointRepo, locationRepo, summary, errors);
      }

      await client.query('COMMIT');
      return { summary, errors };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  private translateError(errorMsg: string): string {
    if (errorMsg.includes('invalid input value for enum country_enum')) {
      return 'Valor invalido para el pais. Valores permitidos: COLOMBIA, PANAMA';
    }
    if (errorMsg.includes('invalid input value for enum document_type_enum')) {
      return 'Valor invalido para tipo de documento. Valores permitidos: CC, CE, PASAPORTE, CIP, PEP';
    }
    if (errorMsg.includes('invalid input value for enum location_type_enum')) {
      return 'Valor invalido para el tipo de ubicacion.';
    }
    if (errorMsg.includes('duplicate key value')) {
      return 'Ya existe un registro con ese identificador unico.';
    }
    return errorMsg;
  }

  private async processLocations(client: any, rows: ExcelRow[], repo: ILocationRepository, summary: ImportSummary, errors: ImportError[]) {
    let created = 0, updated = 0, rejected = 0;
    
    for (const [index, row] of rows.entries()) {
      const rowNumber = index + 2;
      const code = row['codigo_ubicacion'];
      const name = normalizeText(row['nombre_ubicacion']);
      const country = normalizeText(row['pais']);

      if (!code || !name || !country) {
        errors.push({ sheet: 'Ubicaciones', row: rowNumber, reason: 'codigo_ubicacion, nombre_ubicacion y pais son obligatorios' });
        rejected++;
        continue;
      }

      try {
        await client.query(`SAVEPOINT row_${rowNumber}`);
        const { isNew } = await repo.upsertLocation({
          locationCode: code.toString().trim(),
          name: name,
          city: normalizeText(row['ciudad']),
          country: country,
          address: row['direccion'],
          capacity: row['aforo_maximo'] || 0,
          isActive: row['activa'] !== 'NO',
          type: row['Tipo'] ? normalizeText(row['Tipo']) : 'SEDE'
        });

        isNew ? created++ : updated++;
        await client.query(`RELEASE SAVEPOINT row_${rowNumber}`);
      } catch (error: any) {
        await client.query(`ROLLBACK TO SAVEPOINT row_${rowNumber}`);
        const rawMsg = error instanceof Error ? error.message : String(error);
        errors.push({ sheet: 'Ubicaciones', row: rowNumber, reason: this.translateError(rawMsg) });
        rejected++;
      }
    }
    summary['Ubicaciones'] = { created, updated, rejected };
  }

  private async processEmployees(client: any, rows: ExcelRow[], repo: IPersonRepository, summary: ImportSummary, errors: ImportError[]) {
    let created = 0, updated = 0, rejected = 0;
    
    for (const [index, row] of rows.entries()) {
      const rowNumber = index + 2;
      const biostar_id = row['id_biostar'] || row['biostar_id'];
      const firstName = normalizeText(row['primer_nombre']);
      const firstLastName = normalizeText(row['primer_apellido']);
      const country = normalizeText(row['pais']);

      if (!biostar_id || !firstName || !firstLastName || !country) {
        errors.push({ sheet: 'Empleados', row: rowNumber, reason: 'id_biostar, primer_nombre, primer_apellido y pais son obligatorios' });
        rejected++;
        continue;
      }

      try {
        await client.query(`SAVEPOINT row_${rowNumber}`);
        const { personId, isNew } = await repo.upsertPerson({
          firstName,
          secondName: normalizeText(row['segundo_nombre']),
          firstLastName,
          secondLastName: normalizeText(row['segundo_apellido']),
          biostar_id: biostar_id.toString().trim()
        });

        if (row['tipo_doc'] && row['numero_documento'] && country) {
          await repo.upsertDocument(personId, {
            documentType: normalizeText(row['tipo_doc']),
            documentNumber: row['numero_documento'].toString().trim(),
            country: country,
            main: true
          });
        }

        isNew ? created++ : updated++;
        await client.query(`RELEASE SAVEPOINT row_${rowNumber}`);
      } catch (error: any) {
        await client.query(`ROLLBACK TO SAVEPOINT row_${rowNumber}`);
        const rawMsg = error instanceof Error ? error.message : String(error);
        errors.push({ sheet: 'Empleados', row: rowNumber, reason: this.translateError(rawMsg) });
        rejected++;
      }
    }
    summary['Empleados'] = { created, updated, rejected };
  }

  private async processAccessPoints(client: any, rows: ExcelRow[], accessPointRepo: IAccessPointRepository, locationRepo: ILocationRepository, summary: ImportSummary, errors: ImportError[]) {
    let created = 0, updated = 0, rejected = 0;
    
    for (const [index, row] of rows.entries()) {
      const rowNumber = index + 2;
      const biostar_id = row['biostar_id'];
      const locationCode = row['codigo_ubicacion'];
      const name = normalizeText(row['nombre']);

      if (!biostar_id || !locationCode || !name) {
        errors.push({ sheet: 'Accesos', row: rowNumber, reason: 'biostar_id, codigo_ubicacion y nombre son obligatorios' });
        rejected++;
        continue;
      }

      try {
        await client.query(`SAVEPOINT row_${rowNumber}`);
        const locationId = await locationRepo.getLocationIdByCode(locationCode.toString().trim());
        if (!locationId) {
          throw new Error(`No se encontro la ubicacion con codigo: ${locationCode}`);
        }

        const { isNew } = await accessPointRepo.upsertAccessPoint({
          biostar_id: biostar_id.toString().trim(),
          locationId: locationId,
          name: name
        });

        isNew ? created++ : updated++;
        await client.query(`RELEASE SAVEPOINT row_${rowNumber}`);
      } catch (error: any) {
        await client.query(`ROLLBACK TO SAVEPOINT row_${rowNumber}`);
        const rawMsg = error instanceof Error ? error.message : String(error);
        errors.push({ sheet: 'Accesos', row: rowNumber, reason: this.translateError(rawMsg) });
        rejected++;
      }
    }
    summary['Accesos'] = { created, updated, rejected };
  }
}
