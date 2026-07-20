export function normalizeText(text?: string | number): string {
  if (text === undefined || text === null) return '';
  return text
    .toString()
    .normalize('NFD') // Descompone acentos y tildes (ej. ñ -> n + ~)
    .replace(/[\u0300-\u036f]/g, '') // Remueve los símbolos diacríticos
    .replace(/[^a-zA-Z0-9 ]/g, '') // Restringe caracteres especiales dejandolo solo alfanumérico
    .trim()
    .toUpperCase();
}
