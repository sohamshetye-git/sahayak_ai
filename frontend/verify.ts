/**
 * Pre-flight check script for Sahayak AI Frontend
 * Run this before starting the dev server to catch errors early
 */

import { execSync } from 'child_process';
import { existsSync, rmSync } from 'fs';
import { join } from 'path';

const FRONTEND_DIR = join(__dirname, '..');

console.log('\n========================================');
console.log('  Sahayak AI - Pre-Flight Check');
console.log('========================================\n');

// Step 1: Check TypeScript
console.log('Step 1: Checking TypeScript errors...');
try {
  execSync('npx tsc --noEmit --skipLibCheck', { stdio: 'inherit' });
  console.log('✅ TypeScript check passed!\n');
} catch (error) {
  console.log('\n❌ TypeScript errors found! Fix them before running.\n');
  console.log('To fix:');
  console.log('  1. Read the error messages above');
  console.log('  2. Open the files mentioned in the errors');
  console.log('  3. Fix the issues (duplicate keys, type mismatches, etc.)');
  console.log('  4. Run this script again\n');
  process.exit(1);
}

// Step 2: Clear Next.js cache
console.log('Step 2: Clearing Next.js cache...');
const nextCache = join(FRONTEND_DIR, '.next');
if (existsSync(nextCache)) {
  rmSync(nextCache, { recursive: true, force: true });
  console.log('✅ Cache cleared!\n');
} else {
  console.log('ℹ️  No cache to clear.\n');
}

console.log('========================================');
console.log('  Ready to run! Use: npm run dev');
console.log('========================================\n');
