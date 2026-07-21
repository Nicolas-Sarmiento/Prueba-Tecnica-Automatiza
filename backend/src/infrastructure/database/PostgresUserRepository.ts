import { Pool } from 'pg';
import { User } from '../../domain/entities/User';
import { UserRepository } from '../../domain/repositories/UserRepository';

export class PostgresUserRepository implements UserRepository {
  constructor(private pool: Pool) {}

  async findByUsername(username: string): Promise<User | null> {
    const query = 'SELECT id, username, password_hash as "passwordHash", role FROM users WHERE username = $1';
    const result = await this.pool.query(query, [username]);
    if (result.rows.length === 0) {
      return null;
    }
    return result.rows[0];
  }
}
