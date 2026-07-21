import { normalizeText, normalizeId } from './Normalizer';

describe('Normalizer Utility', () => {
  describe('normalizeText', () => {
    it('should remove accents and special characters', () => {
      expect(normalizeText('Bogotá')).toBe('BOGOTA');
      expect(normalizeText('Medellín')).toBe('MEDELLIN');
      expect(normalizeText('Chía')).toBe('CHIA');
      expect(normalizeText('¡Hola Mundo!')).toBe('HOLA MUNDO');
    });

    it('should convert text to uppercase', () => {
      expect(normalizeText('colombia')).toBe('COLOMBIA');
      expect(normalizeText('PaNaMa')).toBe('PANAMA');
    });

    it('should return empty string for null or undefined', () => {
      expect(normalizeText(null)).toBe('');
      expect(normalizeText(undefined)).toBe('');
    });

    it('should trim leading and trailing spaces', () => {
      expect(normalizeText('  Bogota  ')).toBe('BOGOTA');
    });

    it('should handle numeric inputs correctly', () => {
      expect(normalizeText(12345)).toBe('12345');
    });
  });

  describe('normalizeId', () => {
    it('should return empty string for null or undefined', () => {
      expect(normalizeId(null)).toBe('');
      expect(normalizeId(undefined)).toBe('');
    });

    it('should remove dots, commas, spaces and underscores', () => {
      expect(normalizeId('1.234.567')).toBe('1234567');
      expect(normalizeId('ID, 123_456.')).toBe('ID123456');
      expect(normalizeId(' 1 2 3 ')).toBe('123');
    });

    it('should preserve dashes for Panamanian IDs and passports', () => {
      expect(normalizeId('8-123-4567')).toBe('8-123-4567');
      expect(normalizeId('PE-12-345')).toBe('PE-12-345');
    });

    it('should convert scientific notation to full string (Uppercase E)', () => {
      expect(normalizeId('1.02E+09')).toBe('1020000000');
    });

    it('should convert scientific notation to full string (Lowercase e)', () => {
      expect(normalizeId('1.02e9')).toBe('1020000000');
      expect(normalizeId('-1.5e6')).toBe('-1500000');
    });

    it('should convert to uppercase', () => {
      expect(normalizeId('emp001')).toBe('EMP001');
    });
    
    it('should handle numeric inputs', () => {
      expect(normalizeId(98765)).toBe('98765');
    });
  });
});
