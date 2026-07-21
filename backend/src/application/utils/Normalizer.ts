export function normalizeText(text?: string | number): string {
  if (text === undefined || text === null) return '';
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9 ]/g, '')
    .trim()
    .toUpperCase();
}

/**
 * Normaliza identificadores (IDs, Códigos, Cédulas).
 * - Convierte notación científica (ej. 1.02E+09) a número completo.
 * - Elimina puntos, comas, guiones y espacios (dejando solo alfanuméricos contiguos).
 */
export function normalizeId(id?: string | number): string {
  if (id === undefined || id === null) return '';
  let idStr = id.toString().trim();
  
  if (/^-?[\d.]+e[+-]?\d+$/i.test(idStr)) {
    idStr = Number(idStr).toLocaleString('fullwide', { useGrouping: false });
  }
  
  return idStr.replace(/[^a-zA-Z0-9-]/g, '').toUpperCase();
}
