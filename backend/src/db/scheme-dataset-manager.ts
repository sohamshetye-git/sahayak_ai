/**
 * Scheme Dataset Manager
 * Handles importing and parsing government scheme data from CSV files
 */

import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';
import { Scheme, EligibilityCriteria } from '../types';
import { SchemeRepository } from './scheme-repository';
import { CacheService } from './cache-service';

export interface ImportResult {
  success: boolean;
  totalRows: number;
  successfulImports: number;
  failedImports: number;
  errors: ImportError[];
  schemes: Scheme[];
}

export interface ImportError {
  row: number;
  field?: string;
  message: string;
  data?: any;
}

export class SchemeDatasetManager {
  private schemeRepository?: SchemeRepository;
  private cacheService?: CacheService;

  constructor(schemeRepository?: SchemeRepository, cacheService?: CacheService) {
    this.schemeRepository = schemeRepository;
    this.cacheService = cacheService;
  }

  /**
   * Import schemes from CSV file
   * @param csvPath Path to CSV file (relative to project root or absolute)
   * @returns ImportResult with parsed schemes and any errors
   */
  async importFromCSV(csvPath: string): Promise<ImportResult> {
    const result: ImportResult = {
      success: false,
      totalRows: 0,
      successfulImports: 0,
      failedImports: 0,
      errors: [],
      schemes: [],
    };

    try {
      // Read CSV file
      const csvContent = fs.readFileSync(csvPath, 'utf-8');

      // Parse CSV
      const records = parse(csvContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });

      result.totalRows = records.length;

      // Process each row
      for (let i = 0; i < records.length; i++) {
        const row = records[i];
        const rowNumber = i + 2; // +2 because: +1 for header, +1 for 1-based indexing

        try {
          const scheme = this.mapCSVRowToScheme(row, rowNumber);
          result.schemes.push(scheme);
          result.successfulImports++;
        } catch (error) {
          result.failedImports++;
          result.errors.push({
            row: rowNumber,
            message: error instanceof Error ? error.message : 'Unknown error',
            data: row,
          });
        }
      }

      result.success = result.successfulImports > 0;
      return result;
    } catch (error) {
      result.errors.push({
        row: 0,
        message: `Failed to read or parse CSV file: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
      return result;
    }
  }

  /**
   * Map CSV row to Scheme interface
   * @param row CSV row object
   * @param rowNumber Row number for error reporting
   * @returns Scheme object
   */
  private mapCSVRowToScheme(row: any, rowNumber: number): Scheme {
    // Validate required fields
    if (!row.scheme_id || !row.name || !row.description || !row.category) {
      throw new Error(
        `Missing required fields (scheme_id, name, description, or category) at row ${rowNumber}`
      );
    }

    // Parse eligibility criteria
    const eligibility: EligibilityCriteria = {};

    // Age criteria
    if (row.eligibility_age_min) {
      const ageMin = this.parseNumber(row.eligibility_age_min, 'eligibility_age_min', rowNumber);
      if (ageMin !== null) eligibility.ageMin = ageMin;
    }

    if (row.eligibility_age_max) {
      const ageMax = this.parseNumber(row.eligibility_age_max, 'eligibility_age_max', rowNumber);
      if (ageMax !== null) eligibility.ageMax = ageMax;
    }

    // Gender criteria
    if (row.eligibility_gender && row.eligibility_gender !== 'ANY') {
      eligibility.gender = this.parseArrayOrString(row.eligibility_gender);
    }

    // Income criteria
    if (row.eligibility_income_max && row.eligibility_income_max !== 'ANY') {
      const incomeMax = this.parseNumber(
        row.eligibility_income_max,
        'eligibility_income_max',
        rowNumber
      );
      if (incomeMax !== null) eligibility.incomeMax = incomeMax;
    }

    // Caste criteria
    if (row.eligibility_caste && row.eligibility_caste !== 'ANY') {
      eligibility.caste = this.parseArrayOrString(row.eligibility_caste);
    }

    // Occupation criteria
    if (row.eligibility_occupation && row.eligibility_occupation !== 'ANY') {
      eligibility.occupation = this.parseArrayOrString(row.eligibility_occupation);
    }

    // Disability criteria
    if (row.eligibility_disability) {
      eligibility.disability = this.parseBoolean(
        row.eligibility_disability,
        'eligibility_disability',
        rowNumber
      );
    }

    // Parse benefit information
    const benefit: { amount?: number; type: string } = {
      type: row.benefit_type || 'Other',
    };

    if (row.benefit_amount) {
      const amount = this.parseNumber(row.benefit_amount, 'benefit_amount', rowNumber);
      if (amount !== null) benefit.amount = amount;
    }

    // Construct Scheme object
    const scheme: Scheme = {
      schemeId: row.scheme_id.trim(),
      name: row.name.trim(),
      nameHi: row.name_hi ? row.name_hi.trim() : undefined,
      description: row.description.trim(),
      descriptionHi: row.description_hi ? row.description_hi.trim() : undefined,
      category: row.category.trim(),
      state: row.state && row.state !== 'All India' ? row.state.trim() : undefined,
      eligibility,
      benefit,
      applicationUrl: row.application_url ? row.application_url.trim() : undefined,
    };

    return scheme;
  }

  /**
   * Parse a string value to number
   * @param value String value to parse
   * @param fieldName Field name for error reporting
   * @param rowNumber Row number for error reporting
   * @returns Parsed number or null if empty/invalid
   */
  private parseNumber(value: string, fieldName: string, rowNumber: number): number | null {
    if (!value || value.trim() === '') return null;

    const parsed = parseFloat(value);
    if (isNaN(parsed)) {
      throw new Error(`Invalid number for ${fieldName} at row ${rowNumber}: ${value}`);
    }

    return parsed;
  }

  /**
   * Parse a string value to boolean
   * @param value String value to parse
   * @param fieldName Field name for error reporting
   * @param rowNumber Row number for error reporting
   * @returns Parsed boolean
   */
  private parseBoolean(value: string, fieldName: string, rowNumber: number): boolean {
    const normalized = value.toLowerCase().trim();

    if (normalized === 'true' || normalized === '1' || normalized === 'yes') {
      return true;
    }

    if (normalized === 'false' || normalized === '0' || normalized === 'no') {
      return false;
    }

    throw new Error(`Invalid boolean for ${fieldName} at row ${rowNumber}: ${value}`);
  }

  /**
   * Parse comma-separated values into array or return single string
   * @param value String value that may contain comma-separated values
   * @returns Array of strings or single string
   */
  private parseArrayOrString(value: string): string | string[] {
    if (!value) return '';

    const trimmed = value.trim();
    if (trimmed.includes(',')) {
      return trimmed.split(',').map((v) => v.trim());
    }

    return trimmed;
  }

  /**
   * Validate scheme data
   * @param scheme Scheme object to validate
   * @returns Array of validation errors (empty if valid)
   */
  validateSchemeData(scheme: Scheme): string[] {
    const errors: string[] = [];

    // Required fields
    if (!scheme.schemeId) errors.push('Missing scheme_id');
    if (!scheme.name) errors.push('Missing name');
    if (!scheme.description) errors.push('Missing description');
    if (!scheme.category) errors.push('Missing category');

    // Validate age range
    if (scheme.eligibility.ageMin !== undefined && scheme.eligibility.ageMax !== undefined) {
      if (scheme.eligibility.ageMin > scheme.eligibility.ageMax) {
        errors.push('age_min must be <= age_max');
      }
    }

    // Validate age values
    if (scheme.eligibility.ageMin !== undefined && (scheme.eligibility.ageMin < 0 || scheme.eligibility.ageMin > 120)) {
      errors.push('age_min must be between 0 and 120');
    }
    if (scheme.eligibility.ageMax !== undefined && (scheme.eligibility.ageMax < 0 || scheme.eligibility.ageMax > 120)) {
      errors.push('age_max must be between 0 and 120');
    }

    // Validate income
    if (scheme.eligibility.incomeMax !== undefined && scheme.eligibility.incomeMax < 0) {
      errors.push('income_max must be >= 0');
    }

    // Validate benefit amount
    if (scheme.benefit.amount !== undefined && scheme.benefit.amount < 0) {
      errors.push('benefit_amount must be >= 0');
    }

    // Validate enums
    const validCategories = ['Education', 'Health', 'Agriculture', 'Housing', 'Employment', 'Social Welfare', 'Financial Assistance', 'Other'];
    if (scheme.category && !validCategories.includes(scheme.category)) {
      errors.push(`Invalid category: ${scheme.category}`);
    }

    const validGenders = ['Male', 'Female', 'Other', 'Transgender'];
    if (scheme.eligibility.gender) {
      const genders = Array.isArray(scheme.eligibility.gender) ? scheme.eligibility.gender : [scheme.eligibility.gender];
      for (const gender of genders) {
        if (!validGenders.includes(gender)) {
          errors.push(`Invalid gender: ${gender}`);
        }
      }
    }

    const validCastes = ['General', 'SC', 'ST', 'OBC', 'EWS'];
    if (scheme.eligibility.caste) {
      const castes = Array.isArray(scheme.eligibility.caste) ? scheme.eligibility.caste : [scheme.eligibility.caste];
      for (const caste of castes) {
        if (!validCastes.includes(caste)) {
          errors.push(`Invalid caste: ${caste}`);
        }
      }
    }

    return errors;
  }

  /**
   * Sync schemes to database
   * @param schemes Array of schemes to sync
   * @returns Number of schemes synced
   */
  async syncToDatabase(schemes: Scheme[]): Promise<number> {
    if (!this.schemeRepository) {
      throw new Error('SchemeRepository not configured');
    }

    // Validate all schemes first
    const validSchemes: Scheme[] = [];
    const errors: string[] = [];

    for (let i = 0; i < schemes.length; i++) {
      const scheme = schemes[i];
      const validationErrors = this.validateSchemeData(scheme);
      
      if (validationErrors.length > 0) {
        errors.push(`Scheme ${scheme.schemeId} (index ${i}): ${validationErrors.join(', ')}`);
      } else {
        validSchemes.push(scheme);
      }
    }

    if (errors.length > 0) {
      console.warn(`Validation errors found:\n${errors.join('\n')}`);
    }

    // Sync valid schemes
    if (validSchemes.length > 0) {
      await this.schemeRepository.bulkUpsert(validSchemes);
    }

    return validSchemes.length;
  }

  /**
   * Invalidate cache after data update
   */
  async invalidateCache(): Promise<void> {
    if (!this.cacheService) {
      console.warn('CacheService not configured, skipping cache invalidation');
      return;
    }

    try {
      // Invalidate all scheme-related cache keys
      await this.cacheService.delete('schemes:all');
      await this.cacheService.invalidate('schemes:*');
      console.log('Cache invalidated successfully');
    } catch (error) {
      console.error('Failed to invalidate cache:', error);
      // Don't throw - cache invalidation failure shouldn't break the import
    }
  }

  /**
   * Import and sync schemes from CSV to database
   * @param csvPath Path to CSV file
   * @returns ImportResult with sync information
   */
  async importAndSync(csvPath: string): Promise<ImportResult> {
    const result = await this.importFromCSV(csvPath);
    
    if (result.success && result.schemes.length > 0) {
      try {
        const synced = await this.syncToDatabase(result.schemes);
        await this.invalidateCache();
        console.log(`Successfully synced ${synced} schemes to database`);
      } catch (error) {
        result.errors.push({
          row: 0,
          message: `Failed to sync to database: ${error instanceof Error ? error.message : 'Unknown error'}`,
        });
      }
    }
    
    return result;
  }
}
