import { Request, Response } from 'express';
import { LoginUseCase } from '../../application/use-cases/LoginUseCase';

/**
 * Controlador de Autenticación (Adaptador de entrada).
 * Recibe peticiones HTTP, extrae el payload y delega la lógica al LoginUseCase.
 */
export class AuthController {
  constructor(private loginUseCase: LoginUseCase) {}

  /**
   * Endpoint público POST /auth/login
   * Valida la presencia de cuerpo (username/password) e invoca el login.
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        res.status(400).json({ error: 'Username and password are required' });
        return;
      }

      const result = await this.loginUseCase.execute(username, password);
      if (!result) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }

      res.status(200).json(result);
    } catch (error) {
      console.error('[AuthController] Error logging in:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
