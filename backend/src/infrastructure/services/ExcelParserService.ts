import * as xlsx from 'xlsx';

export type ExcelRow = Record<string, any>;

export class ExcelParserService {
  parse(buffer: Buffer): Record<string, ExcelRow[]> {
    const workbook = xlsx.read(buffer, { type: 'buffer' });
    const sheetsData: Record<string, ExcelRow[]> = {};
    
    for (const sheetName of workbook.SheetNames) {
      const sheet = workbook.Sheets[sheetName];
      if (sheet) {
        sheetsData[sheetName] = xlsx.utils.sheet_to_json<ExcelRow>(sheet);
      }
    }
    
    return sheetsData;
  }
}
