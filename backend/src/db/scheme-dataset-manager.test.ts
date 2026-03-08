/**
 * Tests for SchemeDatasetManager
 */

import { SchemeDatasetManager } from './scheme-dataset-manager';
import * as path from 'path';

describe('SchemeDatasetManager', () => {
  let manager: SchemeDatasetManager;

  beforeEach(() => {
    manager = new SchemeDatasetManager();
  });

  describe('importFromCSV', () => {
    it('should successfully import schemes from CSV file', async () => {
      const csvPath = path.join(__dirname, '../../../data/schemes/schemes.csv');
      const result = await manager.importFromCSV(csvPath);

      expect(result.success).toBe(true);
      expect(result.totalRows).toBeGreaterThan(0);
      expect(result.successfulImports).toBe(5); // We have 5 sample schemes
      expect(result.failedImports).toBe(0);
      expect(result.schemes.length).toBe(5);
    });

    it('should correctly parse PM-KISAN scheme', async () => {
      const csvPath = path.join(__dirname, '../../../data/schemes/schemes.csv');
      const result = await manager.importFromCSV(csvPath);

      const pmKisan = result.schemes.find((s) => s.schemeId === 'PM-KISAN');
      expect(pmKisan).toBeDefined();
      expect(pmKisan?.name).toBe('PM-Kisan Samman Nidhi');
      expect(pmKisan?.nameHi).toBe('पीएम-किसान सम्मान निधि');
      expect(pmKisan?.description).toBe('Income support for farmers');
      expect(pmKisan?.descriptionHi).toBe('किसानों के लिए आय सहायता');
      expect(pmKisan?.category).toBe('Agriculture');
      expect(pmKisan?.state).toBeUndefined(); // "All India" should be undefined
      expect(pmKisan?.eligibility.ageMin).toBe(18);
      expect(pmKisan?.eligibility.ageMax).toBe(120);
      expect(pmKisan?.eligibility.incomeMax).toBe(200000);
      expect(pmKisan?.eligibility.occupation).toBe('farmer');
      expect(pmKisan?.eligibility.disability).toBe(false);
      expect(pmKisan?.benefit.amount).toBe(6000);
      expect(pmKisan?.benefit.type).toBe('Annual Cash Transfer');
      expect(pmKisan?.applicationUrl).toBe('https://pmkisan.gov.in');
    });

    it('should correctly parse NSP scheme with array values', async () => {
      const csvPath = path.join(__dirname, '../../../data/schemes/schemes.csv');
      const result = await manager.importFromCSV(csvPath);

      const nsp = result.schemes.find((s) => s.schemeId === 'NSP');
      expect(nsp).toBeDefined();
      expect(nsp?.eligibility.caste).toEqual(['sc', 'st', 'obc']);
    });

    it('should handle "ANY" values correctly', async () => {
      const csvPath = path.join(__dirname, '../../../data/schemes/schemes.csv');
      const result = await manager.importFromCSV(csvPath);

      const pmKisan = result.schemes.find((s) => s.schemeId === 'PM-KISAN');
      expect(pmKisan?.eligibility.gender).toBeUndefined(); // "ANY" should not be set
      expect(pmKisan?.eligibility.caste).toBeUndefined(); // "ANY" should not be set
    });

    it('should handle schemes with no income limit', async () => {
      const csvPath = path.join(__dirname, '../../../data/schemes/schemes.csv');
      const result = await manager.importFromCSV(csvPath);

      const mgnrega = result.schemes.find((s) => s.schemeId === 'MGNREGA');
      expect(mgnrega).toBeDefined();
      expect(mgnrega?.eligibility.incomeMax).toBeUndefined();
    });

    it('should handle schemes with zero benefit amount', async () => {
      const csvPath = path.join(__dirname, '../../../data/schemes/schemes.csv');
      const result = await manager.importFromCSV(csvPath);

      const mgnrega = result.schemes.find((s) => s.schemeId === 'MGNREGA');
      expect(mgnrega).toBeDefined();
      expect(mgnrega?.benefit.amount).toBe(0);
      expect(mgnrega?.benefit.type).toBe('Employment Days');
    });

    it('should return error for non-existent file', async () => {
      const result = await manager.importFromCSV('non-existent-file.csv');

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].message).toContain('Failed to read or parse CSV file');
    });
  });
});
