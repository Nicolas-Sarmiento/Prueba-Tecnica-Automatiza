exports.up = async (pgm) => {
  pgm.createTable('users', {
    id: 'id',
    username: { type: 'varchar(255)', notNull: true, unique: true },
    password_hash: { type: 'varchar(255)', notNull: true },
    role: { type: 'varchar(50)', notNull: true }
  });

  // Seed with initial users
  // Password is "password" hashed using bcryptjs with salt rounds = 10
  const passwordHash = '$2b$10$HVxRJZRiyc/RlIHI7XCiNOoC50BMPgquRAYCXAj99ek2APysEV4VK'; // corresponds to "password"
  
  pgm.sql(`
    INSERT INTO users (username, password_hash, role) VALUES 
    ('admin', '${passwordHash}', 'ADMIN'),
    ('supervisor', '${passwordHash}', 'SUPERVISOR');
  `);
};

exports.down = (pgm) => {
  pgm.dropTable('users');
};
