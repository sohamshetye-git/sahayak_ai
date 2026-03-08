/**
 * Database Connection Manager
 * Automatically connects to Local PostgreSQL or AWS RDS based on environment
 */

import { Pool, PoolConfig } from 'pg';
import { config } from '../config';

let pool: Pool | null = null;

/**
 * Get database connection pool
 * Singleton pattern - creates pool once and reuses
 */
export function getDatabase(): Pool {
  if (pool) {
    return pool;
  }

  const poolConfig: PoolConfig = {
    host: config.database.host,
    port: config.database.port,
    database: config.database.name,
    user: config.database.user,
    password: config.database.password,
    max: config.database.maxConnections,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  };

  // Add SSL configuration for production (AWS RDS)
  if (config.database.ssl) {
    poolConfig.ssl = {
      rejectUnauthorized: false, // AWS RDS uses self-signed certificates
    };
  }

  pool = new Pool(poolConfig);

  // Handle connection errors
  pool.on('error', (err) => {
    console.error('Unexpected database error:', err);
  });

  // Log successful connection
  pool.on('connect', () => {
    console.log(`✓ Database connected: ${config.database.host}:${config.database.port}/${config.database.name}`);
  });

  return pool;
}

/**
 * Test database connection
 */
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    const db = getDatabase();
    const result = await db.query('SELECT NOW()');
    console.log('✓ Database connection test successful:', result.rows[0].now);
    return true;
  } catch (error) {
    console.error('✗ Database connection test failed:', error);
    return false;
  }
}

/**
 * Close database connection
 */
export async function closeDatabaseConnection(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
    console.log('✓ Database connection closed');
  }
}
