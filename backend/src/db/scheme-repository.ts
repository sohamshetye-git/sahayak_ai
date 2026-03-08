/**
 * Scheme Repository
 * Handles database operations for government schemes
 */

import { Pool } from 'pg';
import { Scheme } from '../types';

export class SchemeRepository {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  /**
   * Upsert a scheme into the database
   */
  async upsert(scheme: Scheme): Promise<void> {
    const query = `
      INSERT INTO schemes (
        scheme_id, name, name_hi, description, description_hi,
        category, state, eligibility, benefit, application_url,
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
      ON CONFLICT (scheme_id) 
      DO UPDATE SET
        name = EXCLUDED.name,
        name_hi = EXCLUDED.name_hi,
        description = EXCLUDED.description,
        description_hi = EXCLUDED.description_hi,
        category = EXCLUDED.category,
        state = EXCLUDED.state,
        eligibility = EXCLUDED.eligibility,
        benefit = EXCLUDED.benefit,
        application_url = EXCLUDED.application_url,
        updated_at = NOW()
    `;

    await this.pool.query(query, [
      scheme.schemeId,
      scheme.name,
      scheme.nameHi || null,
      scheme.description,
      scheme.descriptionHi || null,
      scheme.category,
      scheme.state || null,
      JSON.stringify(scheme.eligibility),
      JSON.stringify(scheme.benefit),
      scheme.applicationUrl || null,
    ]);
  }

  /**
   * Bulk upsert schemes
   */
  async bulkUpsert(schemes: Scheme[]): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      
      for (const scheme of schemes) {
        await this.upsert(scheme);
      }
      
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get all schemes
   */
  async getAll(): Promise<Scheme[]> {
    const result = await this.pool.query('SELECT * FROM schemes ORDER BY name');
    return result.rows.map(this.mapRowToScheme);
  }

  /**
   * Get scheme by ID
   */
  async getById(schemeId: string): Promise<Scheme | null> {
    const result = await this.pool.query(
      'SELECT * FROM schemes WHERE scheme_id = $1',
      [schemeId]
    );
    
    if (result.rows.length === 0) return null;
    return this.mapRowToScheme(result.rows[0]);
  }

  /**
   * Map database row to Scheme object
   */
  private mapRowToScheme(row: any): Scheme {
    return {
      schemeId: row.scheme_id,
      name: row.name,
      nameHi: row.name_hi,
      description: row.description,
      descriptionHi: row.description_hi,
      category: row.category,
      state: row.state,
      eligibility: typeof row.eligibility === 'string' 
        ? JSON.parse(row.eligibility) 
        : row.eligibility,
      benefit: typeof row.benefit === 'string'
        ? JSON.parse(row.benefit)
        : row.benefit,
      applicationUrl: row.application_url,
    };
  }
}
