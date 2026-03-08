/**
 * Database Migration Runner
 * Runs SQL migrations for PostgreSQL schema setup
 */

import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import { config } from 'dotenv';

config();

const pool = new Pool({
  host: process.env.RDS_HOST || 'localhost',
  port: parseInt(process.env.RDS_PORT || '5432'),
  database: process.env.RDS_DATABASE || 'sahayak',
  user: process.env.RDS_USER || 'sahayak_app',
  password: process.env.RDS_PASSWORD || '',
});

interface Migration {
  id: number;
  filename: string;
  sql: string;
}

async function createMigrationsTable() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Migrations table ready');
  } finally {
    client.release();
  }
}

async function getExecutedMigrations(): Promise<string[]> {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT filename FROM migrations ORDER BY id');
    return result.rows.map((row) => row.filename);
  } finally {
    client.release();
  }
}

async function getMigrationFiles(): Promise<Migration[]> {
  const migrationsDir = path.join(__dirname, 'migrations');
  const files = fs.readdirSync(migrationsDir).filter((f) => f.endsWith('.sql')).sort();

  return files.map((filename, index) => {
    const sql = fs.readFileSync(path.join(migrationsDir, filename), 'utf-8');
    return { id: index + 1, filename, sql };
  });
}

async function runMigration(migration: Migration) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(migration.sql);
    await client.query('INSERT INTO migrations (filename) VALUES ($1)', [migration.filename]);
    await client.query('COMMIT');
    console.log(`✓ Executed migration: ${migration.filename}`);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(`✗ Failed migration: ${migration.filename}`);
    throw error;
  } finally {
    client.release();
  }
}

async function rollbackMigration(migration: Migration) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    // Note: This is a simple rollback that just removes the migration record
    // For production, you'd want proper down migrations
    await client.query('DELETE FROM migrations WHERE filename = $1', [migration.filename]);
    await client.query('COMMIT');
    console.log(`✓ Rolled back migration: ${migration.filename}`);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(`✗ Failed rollback: ${migration.filename}`);
    throw error;
  } finally {
    client.release();
  }
}

async function migrateUp() {
  console.log('Running migrations...\n');
  await createMigrationsTable();

  const executed = await getExecutedMigrations();
  const migrations = await getMigrationFiles();

  const pending = migrations.filter((m) => !executed.includes(m.filename));

  if (pending.length === 0) {
    console.log('No pending migrations');
    return;
  }

  for (const migration of pending) {
    await runMigration(migration);
  }

  console.log(`\n✓ Successfully executed ${pending.length} migration(s)`);
}

async function migrateDown() {
  console.log('Rolling back last migration...\n');

  const executed = await getExecutedMigrations();
  if (executed.length === 0) {
    console.log('No migrations to roll back');
    return;
  }

  const lastMigration = executed[executed.length - 1];
  const migrations = await getMigrationFiles();
  const migration = migrations.find((m) => m.filename === lastMigration);

  if (!migration) {
    console.error(`Migration file not found: ${lastMigration}`);
    return;
  }

  await rollbackMigration(migration);
  console.log('\n✓ Successfully rolled back migration');
}

async function main() {
  const command = process.argv[2];

  try {
    if (command === 'up') {
      await migrateUp();
    } else if (command === 'down') {
      await migrateDown();
    } else {
      console.log('Usage: npm run migrate:up | npm run migrate:down');
      process.exit(1);
    }
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
