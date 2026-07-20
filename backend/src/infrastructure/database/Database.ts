import { Pool, PoolClient } from 'pg';

export class Database {
  private static pool: Pool;

  static initialize() {
    this.pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      user: process.env.DB_USER || 'admin',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_NAME || 'automatiza',
    });
  }

  static async getClient(): Promise<PoolClient> {
    if (!this.pool) this.initialize();
    return this.pool.connect();
  }

  static getPool(): Pool {
    if (!this.pool) this.initialize();
    return this.pool;
  }
}
