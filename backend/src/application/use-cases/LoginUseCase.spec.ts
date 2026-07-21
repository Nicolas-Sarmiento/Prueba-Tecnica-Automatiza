import { LoginUseCase } from './LoginUseCase';
import { UserRepository } from '../../domain/repositories/UserRepository';
import bcrypt from 'bcryptjs';

describe('LoginUseCase', () => {
  let loginUseCase: LoginUseCase;
  let mockUserRepository: jest.Mocked<UserRepository>;

  beforeEach(() => {
    // Creamos un mock del repositorio (Puerto)
    mockUserRepository = {
      findByUsername: jest.fn(),
    };
    loginUseCase = new LoginUseCase(mockUserRepository);
  });

  it('debería retornar token y rol si las credenciales son válidas', async () => {
    // Arrange: Preparamos los datos de prueba
    const passwordHash = await bcrypt.hash('mypassword', 10);
    mockUserRepository.findByUsername.mockResolvedValue({
      id: 1,
      username: 'admin',
      passwordHash,
      role: 'ADMIN'
    });

    // Act: Ejecutamos el caso de uso
    const result = await loginUseCase.execute('admin', 'mypassword');

    // Assert: Verificamos los resultados (reglas de negocio)
    expect(result).not.toBeNull();
    expect(result?.role).toBe('ADMIN');
    expect(typeof result?.token).toBe('string');
    expect(mockUserRepository.findByUsername).toHaveBeenCalledWith('admin');
  });

  it('debería retornar null si el usuario no existe', async () => {
    mockUserRepository.findByUsername.mockResolvedValue(null);

    const result = await loginUseCase.execute('unknown', 'anypassword');

    expect(result).toBeNull();
  });
});
