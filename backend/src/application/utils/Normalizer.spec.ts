import { normalizeText } from './Normalizer';

describe('Normalizer Utility', () => {
  it('should remove accents and special characters', () => {
    expect(normalizeText('Bogotá')).toBe('BOGOTA');
    expect(normalizeText('Medellín')).toBe('MEDELLIN');
    expect(normalizeText('Chía')).toBe('CHIA');
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
});
