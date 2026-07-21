import { AuthController } from './AuthController';
import { LoginUseCase } from '../../application/use-cases/LoginUseCase';
import { Request, Response } from 'express';

describe('AuthController', () => {
  let authController: AuthController;
  let mockLoginUseCase: any;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    // Mockeamos el caso de uso (dependencia interna)
    mockLoginUseCase = {
      execute: jest.fn(),
    };
    authController = new AuthController(mockLoginUseCase as LoginUseCase);

    // Mockeamos objetos de Express
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  it('debería retornar status 400 si faltan credenciales', async () => {
    mockRequest = { body: {} }; // Sin username ni password

    await authController.login(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Username and password are required' });
  });

  it('debería retornar 200 y el resultado si el login es exitoso', async () => {
    mockRequest = { body: { username: 'admin', password: 'password123' } };
    const fakeTokenData = { token: 'jwt-fake-token', role: 'ADMIN' };
    mockLoginUseCase.execute.mockResolvedValue(fakeTokenData);

    await authController.login(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith(fakeTokenData);
    expect(mockLoginUseCase.execute).toHaveBeenCalledWith('admin', 'password123');
  });
});
