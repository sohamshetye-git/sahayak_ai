// Jest setup file for global test configuration
import { config } from 'dotenv';

// Load environment variables for testing
config({ path: '.env.test' });

// Set test timeout
jest.setTimeout(10000);

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
  log: jest.fn(),
};
