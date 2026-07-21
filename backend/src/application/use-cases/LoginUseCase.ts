import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../../domain/repositories/UserRepository';

/**
 * Caso de uso responsable de autenticar a los usuarios en el sistema.
 * 
 * Sigue el principio de Inversión de Dependencias al requerir 
 * una implementación de UserRepository en su constructor.
 */
export class LoginUseCase {
  constructor(private userRepository: UserRepository) {}

  /**
   * Ejecuta la lógica de inicio de sesión.
   * 
   * @param username - El nombre de usuario ingresado
   * @param plainPassword - La contraseña en texto plano
   * @returns Un objeto con el token JWT y el rol del usuario, o null si las credenciales son inválidas.
   */
  async execute(username: string, plainPassword: string): Promise<{ token: string, role: string } | null> {
    const user = await this.userRepository.findByUsername(username);
    if (!user) {
      return null;
    }

    const passwordMatches = await bcrypt.compare(plainPassword, user.passwordHash);
    if (!passwordMatches) {
      return null;
    }

    const secret = process.env.JWT_SECRET || 'super-secret-key';
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      secret,
      { expiresIn: '8h' }
    );

    return { token, role: user.role };
  }
}
